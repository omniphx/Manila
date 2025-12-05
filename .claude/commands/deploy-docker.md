# Deploy the application to my DigitalOcean droplet

DROPLET INFORMATION:

- Droplet IP: 143.110.194.149
- OS: Ubuntu 24.04 (LTS) x64
- Current access: root@143.110.194.149

Steps:

1. SSH as: agent@104.248.66.216
2. cd /opt/manila
3. git pull origin main
4. Navigate to backend folder: apps/backend
5. pnpm docker:prod:down
6. pnpm docker:prod (this can take several minutes)
7. docker compose ps (verify all containers are running)
8. docker compose logs -f (check for errors)
9. pnpm db:migrate

OPTIONAL MAINTENANCE:

Disk Space Cleanup (run when disk usage is high):

- Check disk usage: df -h /
- Check Docker usage: docker system df
- Clean build cache: docker builder prune -a -f
- Clean unused volumes: docker volume prune -f
- This can free up 6-8GB after multiple deployments

Notes:

- Database volumes persist between deployments (data is safe)
- Only run volume prune if you're sure no important data is in unused volumes
- Build cache will accumulate with each deployment
- Monitor disk usage periodically to avoid running out of space

If anything fails, report the error and ask the user for next steps. Do not try to fix the error or make code changes.

$ARGUMENTS
