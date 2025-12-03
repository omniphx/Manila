# Digital Ocean Setup command

I need help setting up a new DigitalOcean droplet for my application called Manila. This server will host a document management system with LLM-powered question answering.

Do not create a script or write code. Simply follow the setup instructions and execute each step.

SETUP INSTRUCTIONS:

1 USER ACCOUNTS:

- Create two user accounts (both will use the same SSH key for authentication):
  - Personal admin user: marty
  - Agent/deployment user: agent
- Both users should have sudo privileges
- Create a group for both users called `devs`
- Both users share the same SSH public key found in: `cat ~/.ssh/id_ed25519.pub`

> If reusing an IP, you'll need
> to remove old host keys with ssh-keygen -R <IP>

2 VERIFY ACCESS

- Test SSH and sudo for both users
- Continue remaining steps as agent (this is important because in the next steps we will be removing root access)

3 SECURITY HARDENING:

- Disable root SSH login after setup
- Disable password authentication (SSH key only)
- Configure UFW firewall (allow SSH, HTTP, HTTPS)
- Set up fail2ban for brute force protection
- Configure automatic security updates

4 DOCKER SETUP:

- Install Docker and Docker Compose
- Add both users to the docker group (no sudo needed for docker commands)
- Configure Docker to start on boot
- Add Docker log limits to prevent disk space issues:

  ```json
    # Add to /etc/docker/daemon.json
    {
      "log-driver": "json-file",
      "log-opts": {
        "max-size": "10m",
        "max-file": "3"
      }
    }
  ```

5 APPLICATION DIRECTORY STRUCTURE:

- Create application directory at: /opt/manila
- Create file storage directory at: /var/manila/files
- Set appropriate permissions for both users to access these directories. Both users should share ownership with the `devs` group

6 DEVELOPMENT TOOLS:

- Install: git, curl, vim (or nano), htop
- Configure timezone to: [PST, e.g., America/Los_Angeles]

7 MONITORING/MAINTENANCE:

- Set up logrotate for application logs
- Configure basic system monitoring

8 POSTGRESQL/DOCKER VOLUMES:

- Create dedicated directory for database volumes: /var/manila/db
- Set appropriate permissions for Docker to write to volume directories
- Ensure sufficient disk space is available (check with df -h)
- Verify swap is enabled for database performance

9 Git Configuration for Deployment

Add a step after user creation:

- Configure git for both users (needed for deployments)

git config --global user.name "Manila Deploy"
git config --global user.email "<deploy@manila.app>"

- setup ssh key: `ssh-keygen -t ed25519 -C "agent@manila-droplet"`
- prompt user to add public key to [repo setting](hhttps://github.com/omniphx/Manila/settings/keys) with `cat ~/.ssh/id_ed25519.pub`
- once completed test out the connection with `ssh -T git@github.com`
- clone the repo: `git clone --depth 1 --branch main git@github.com:omniphx/manila.git /opt/manila`

11 Node, pnpm

- Install Node.js v22
- Through node, enable corepack and install pnpm

10 Testing Checklist

- Test firewall: sudo ufw status verbose
- Test fail2ban: sudo fail2ban-client status sshd
- Verify no password auth: Try SSH with password
- Check disk space alerts at 80% usage

11 Configuration for user "marty"

- Login as "marty"
- Add "oh-my-zsh"

```bash
# Install zsh
sudo apt update
sudo apt install zsh -y

# Install oh-my-zsh
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

# Set zsh as default shell for marty
chsh -s $(which zsh)
```

12 Setup nginx/SSL:

```
server {
    listen 443 ssl;
    server_name api.filellama.ai;

    ssl_certificate /etc/letsencrypt/live/api.filellama.ai/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.filellama.ai/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Use Certbot and Let's Encrypt, which gives you free certificates that auto-renew.

```sh
sudo apt update
sudo apt install certbot python3-certbot-nginx
```

Make sure nginx is installed and running

```sh
sudo apt install nginx
sudo systemctl start nginx
```

Get the certificate (certbot will configure nginx for you)

```sh
sudo certbot --nginx -d api.filellama.ai
```

Before running certbot, make sure your DNS A record for api.filellama.ai is already pointing to your droplet's IP and has propagated (you can check with dig backend.yourdomain.com). Let's Encrypt validates domain ownership by hitting your server over HTTP, so port 80 needs to be open in your firewall.

After it succeeds, you can test the auto-renewal with:

```sh
sudo certbot renew --dry-run
```

DROPLET INFORMATION:

- Droplet IP: 104.248.66.216
- OS: Ubuntu 24.04 (LTS) x64
- Current access: root@104.248.66.216

After completion, I should be able to SSH in as either user. Do not make any code changes.

$ARGUMENTS
