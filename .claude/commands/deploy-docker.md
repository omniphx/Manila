Deploy the Manila application to my DigitalOcean droplet.

DROPLET INFORMATION:

- Droplet IP: [request if not provided already]
- OS: Ubuntu 24.04 (LTS) x64
- Current access: root@[request if not provided already]

Steps:

1. SSH as: agent@104.248.66.216
2. cd /opt/manila
3. git pull origin main
4. Navigate to backend folder: apps/backend
5. pnpm docker:down
6. pnpm docker:prod
7. docker compose ps (verify all containers are running)
8. docker compose logs -f (check for errors)
9. pnpm db:migrate

If anything fails, report the error and ask the user for next steps. Do not try to fix the error or make code changes.
