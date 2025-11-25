Deploy the Manila application to my DigitalOcean droplet.

DROPLET INFORMATION:

- Droplet IP: [request if not provided already]
- OS: Ubuntu 24.04 (LTS) x64
- Current access: root@[request if not provided already]

Steps:

1. SSH as: agent@[YOUR_DROPLET_IP]
2. cd /opt/manila
3. git pull origin main
4. Navigate to backend folder: apps/backend
5. docker compose down
6. docker compose up -d --build
7. docker compose ps (verify all containers are running)
8. docker compose logs -f (check for errors)

If anything fails, report the error and ask the user for next steps.
