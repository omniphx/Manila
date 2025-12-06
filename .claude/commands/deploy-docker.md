# Deploy the application to my DigitalOcean droplet

DROPLET INFORMATION:

- IP: 143.110.194.149
- OS: Ubuntu 24.04 (LTS) x64
- Current access: root@143.110.194.149

## Steps

### Build docker image

```sh
docker buildx build --platform linux/amd64 -t ghcr.io/omniphx/filellama-backend:latest -f apps/backend/Dockerfile --target production . --push

```

### Copy and compose docker

SSH as: agent@143.110.194.149

Copy my local docker compose file:
`scp apps/backend/docker-compose.prod.yml root@143.110.194.149:/opt/filellama/docker-compose.yml`

Copy my local .env file:
`scp apps/backend/.env root@143.110.194.149:/opt/filellama/.env`

Changed the production .env to use the Docker service name:
`DATABASE_URL=postgresql://postgres:postgres@postgres:5432/manila`

```bash
cd /opt/filellama
docker compose pull
docker compose up -d
# verify all containers are running
docker compose ps
# check for errors
docker compose logs -f
```

### Migrate any database changes

1. pnpm db:migrate

## OPTIONAL MAINTENANCE

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
