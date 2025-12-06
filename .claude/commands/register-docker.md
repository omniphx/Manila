# Instructions for registering docker image

```sh
docker buildx build --platform linux/amd64 -t ghcr.io/omniphx/filellama-backend:latest -f apps/backend/Dockerfile --target production . --push

```

```bash
cd /opt/filellama
docker compose pull
docker compose up -d
```
