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

- Test SSH and sudo for both users
- Continue remaining steps as `agent` (important before disabling root access)

---

## 3. Security Hardening

- Disable root SSH login
- Disable password authentication (SSH key only)
- Configure UFW firewall (allow SSH, HTTP, HTTPS)
- Set up fail2ban for brute force protection
- Configure automatic security updates
- X11 Forwarding Enabled
- Set SSH max auth tries to 3

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
`scp apps/backend/docker-compose.prod.yml root@<DOCKER_IP_ADDRESS>:/opt/filellama/docker-compose.yml`

Make sure we only expose localhost ports:

```bash
ports: - "5432:5432" # WRONG - exposes to internet
ports: - "127.0.0.1:5432:5432" # CORRECT - localhost only
```

```bash
ports: - "3000:3000" # WRONG - exposes to internet
ports: - "127.0.0.1:3000:3000" # CORRECT - localhost only
```

### .env

Copy my local .env file:
`scp apps/backend/.env root@<DOCKER_IP_ADDRESS>:/opt/filellama/.env`

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
- [ ] Make sure no database ports are exposed

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
