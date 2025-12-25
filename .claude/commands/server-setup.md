# Digital Ocean Setup Instructions

This server will host FileLlama, a document management system with LLM-powered question answering.

**Droplet Information:**

- IP: <DOCKER_IP_ADDRESS>
- OS: Ubuntu 24.04 (LTS) x64
- Current access: root@<DOCKER_IP_ADDRESS>

> If reusing an IP, remove old host keys with `ssh-keygen -R <DOCKER_IP_ADDRESS>`

---

## 1. User Accounts

Create two user accounts (both use the same SSH key):

- **marty** - Personal admin user
- **agent** - Deployment user

Both marty and agent should have sudo privileges and belong to a shared `devs` group.

SSH public key: `cat ~/.ssh/id_ed25519.pub`

---

## 2. Verify Access

⚠️ **CRITICAL: Complete ALL verification before proceeding to security hardening.**

- [ ] Test SSH as `marty`: `ssh marty@<DOCKER_IP_ADDRESS>`
- [ ] Test SSH as `agent`: `ssh agent@<DOCKER_IP_ADDRESS>`
- [ ] Verify sudo works for marty: `sudo whoami` (should return `root`)
- [ ] Verify sudo works for agent: `sudo whoami` (should return `root`)

**Keep your current root session open until ALL of step 3 is complete and verified.**

Continue remaining steps as `agent`.

---

## 3. Security Hardening

⚠️ **LOCKOUT PREVENTION: Follow these steps IN EXACT ORDER. Do not skip ahead.**

### 3.1 Configure UFW Firewall (DO THIS FIRST!)

```bash
# Allow SSH BEFORE enabling the firewall
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Verify rules are added (firewall not yet active)
sudo ufw status numbered

# Only NOW enable the firewall
sudo ufw enable

# Confirm SSH is allowed
sudo ufw status verbose
```

**Expected output should show:**

```
22/tcp (OpenSSH)            ALLOW IN    Anywhere
80/tcp                      ALLOW IN    Anywhere
443/tcp                     ALLOW IN    Anywhere
```

🛑 **STOP AND VERIFY**: Open a NEW terminal and confirm you can still SSH in:

```bash
ssh agent@<DOCKER_IP_ADDRESS>
```

If this fails, you still have your original session to fix it.

### 3.2 Configure SSH Hardening

**Only proceed after verifying UFW allows SSH.**

Edit `/etc/ssh/sshd_config` with these settings:

```bash
sudo nano /etc/ssh/sshd_config
```

```
PermitRootLogin no
PasswordAuthentication no
X11Forwarding yes
MaxAuthTries 3
```

**Before restarting SSH, validate the config:**

```bash
sudo sshd -t
```

If validation passes (no output = success), restart SSH:

```bash
sudo systemctl restart sshd
```

🛑 **STOP AND VERIFY**: In a NEW terminal (keep current session open!):

```bash
# Should succeed
ssh agent@<DOCKER_IP_ADDRESS>

# Should fail with "Permission denied (publickey)"
ssh root@<DOCKER_IP_ADDRESS>

# Should fail (password auth disabled)
ssh -o PreferredAuthentications=password -o PubkeyAuthentication=no agent@<DOCKER_IP_ADDRESS>
```

### 3.3 Install and Configure fail2ban

```bash
sudo apt update
sudo apt install -y fail2ban

# Create local config (don't edit the main config)
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.local
```

In `[sshd]` section, ensure:

```
[sshd]
enabled = true
port = ssh
filter = sshd
maxretry = 5
bantime = 3600
```

```bash
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
sudo fail2ban-client status sshd
```

### 3.4 Configure Automatic Security Updates

```bash
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

### 3.5 Final Security Verification

Run all checks before proceeding:

```bash
# UFW is active and allows SSH
sudo ufw status verbose | grep -E "(22|OpenSSH)"

# SSH config is valid
sudo sshd -t && echo "SSH config OK"

# fail2ban is protecting SSH
sudo fail2ban-client status sshd
```

---

## 4. Docker Setup

- Install Docker and Docker Compose
- Add both users to the docker group
- Configure Docker to start on boot
- Add log limits to `/etc/docker/daemon.json`:

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

> Note: Users must log out and back in (or run `newgrp docker`) for group membership to take effect.

### CRITICAL: Docker Bypasses UFW

**Docker manipulates iptables directly and bypasses UFW firewall rules.** Even if UFW blocks a port, Docker's `-p` flag will expose it to the internet anyway.

**Never do this:**

```yaml
ports:
  - "5432:5432" # Exposed to internet despite UFW!
```

**Always bind to localhost:**

```yaml
ports:
  - "127.0.0.1:5432:5432" # Only accessible from host
```

Or better yet, don't publish database ports at all—use Docker networks for container-to-container communication.

---

## 5. Container Registry Authentication

Authenticate with GitHub Container Registry:

```bash
echo "YOUR_GITHUB_PAT" | docker login ghcr.io -u omniphx --password-stdin
```

The PAT needs `read:packages` scope at minimum.

---

## 6. Application Directory Structure

Create the following directories with `devs` group ownership:

| Path                   | Purpose                    |
| ---------------------- | -------------------------- |
| `/opt/filellama`       | Docker compose and configs |
| `/var/filellama/files` | Uploaded file storage      |
| `/var/filellama/db`    | PostgreSQL volume data     |

Ensure both `marty` and `agent` can read/write via the `devs` group.

---

## 7. Deploy Configuration Files

Copy these files to `/opt/filellama` on the droplet:

### docker-compose.yml

Copy my local docker compose file:
`scp apps/backend/docker-compose.prod.yml agent@<DOCKER_IP_ADDRESS>:/opt/filellama/docker-compose.yml`

**Verify all port bindings use localhost (see section 4 for why this matters):**

```yaml
# WRONG - exposes to internet (bypasses UFW!)
ports:
  - "5432:5432"
  - "3000:3000"

# CORRECT - localhost only, accessed via nginx reverse proxy
ports:
  - "127.0.0.1:5432:5432"
  - "127.0.0.1:3000:3000"

# BEST for databases - no port exposure, use Docker networks
# (remove ports section entirely, backend connects via service name)
```

### .env

Copy my local .env file:
`scp apps/backend/.env agent@<DOCKER_IP_ADDRESS>:/opt/filellama/.env`

Changed the production .env to use the Docker service name:
`DATABASE_URL=postgresql://postgres:postgres@postgres:5432/manila`

Secure the .env file:

```bash
chmod 600 /opt/filellama/.env
```

---

## 8. System Configuration

- Set timezone to America/Los_Angeles
- Configure logrotate for `/var/filellama/files`
- Verify swap is enabled (for database performance)
- Check disk space with `df -h`

---

## 9. Nginx and SSL

Install nginx and certbot:

```bash
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx
sudo systemctl start nginx
```

Ensure DNS A record for `api.filellama.ai` points to the droplet IP before proceeding.

Get the certificate:

```bash
sudo certbot --nginx -d api.filellama.ai
```

Update nginx config at `/etc/nginx/sites-available/default`:

```nginx
server {
    listen 443 ssl;
    server_name api.filellama.ai;

    ssl_certificate /etc/letsencrypt/live/api.filellama.ai/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.filellama.ai/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
    }
}
```

Test auto-renewal:

```bash
sudo certbot renew --dry-run
```

Add Nginx Rate Limiting

---

## 10. Start the Application

Be sure to run docker with the docker user.

```bash
cd /opt/filellama
docker compose pull
docker compose up -d
docker compose logs -f
```

---

### Migrate any database changes

cd /opt/filellama/apps/backend && pnpm db:migrate

## 11. Verification Checklist

- [ ] SSH works for both `marty` and `agent`
- [ ] Root SSH login disabled
- [ ] Password auth disabled (test with `ssh -o PreferredAuthentications=password`)
- [ ] Firewall active: `sudo ufw status verbose`
- [ ] Fail2ban running: `sudo fail2ban-client status sshd`
- [ ] Docker runs without sudo: `docker ps`
- [ ] Containers healthy: `docker compose ps`
- [ ] HTTPS working: `curl https://api.filellama.ai/health`
- [ ] Disk space adequate: `df -h` (alert threshold: 80%)
- [ ] Database port NOT exposed externally (run from local machine):

  ```bash
  nc -zv <DOCKER_IP_ADDRESS> 5432  # Should fail/timeout
  ```

- [ ] Only localhost ports bound (run on droplet):

  ```bash
  sudo ss -tlnp | grep docker  # All should show 127.0.0.1
  ```

---

## Deployment Workflow

When pushing updates:

**Local machine:**

```bash
docker build -t ghcr.io/omniphx/filellama-backend:latest \
  -f apps/backend/Dockerfile --target production .
docker push ghcr.io/omniphx/filellama-backend:latest
```

**On droplet:**

```bash
cd /opt/filellama
docker compose pull
docker compose up -d
```
