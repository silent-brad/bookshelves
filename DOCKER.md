# Docker Deployment Guide

## Building the Docker Image

The application is containerized using Nix. To build the Docker image:

```bash
nix build .#dockerImage
```

This creates a Docker tarball that can be loaded with:

```bash
docker load < result
```

## Running the Container

Once loaded, run the container:

```bash
docker run -p 8080:8080 bookshelves:latest
```

The application will be available at `http://localhost:8080`.

## What's Included

The Docker image contains:
- **Backend app**: Java Spring Boot application accessible via `/api/*`
- **Frontend**: Angular static files served from root path
- **Reverse proxy**: Caddy proxy that routes API requests and serves static files
- **Database**: SQLite database at `/data/bookshelves.db`

## Architecture

The container runs two processes:
1. **start-proxy**: Caddy reverse proxy on port 8080
2. **app**: Spring Boot backend on port 8000

The proxy routes:
- `/api/*` → Backend (localhost:8000)
- `/*` → Frontend static files with SPA routing

## Environment Variables

- `DB_URL`: SQLite database connection (default: `jdbc:sqlite:/data/bookshelves.db`)
- `FRONTEND_PATH`: Path to static files (default: `/nix/store/.../static`)
- `SERVER_PORT`: Backend port (default: 8000)
- `PROXY_PORT`: Proxy port (default: 8080)
- `JAVA_TOOL_OPTIONS`: JVM options (includes temp directory)

## Volumes

To persist the database and user uploads, mount volumes:

```bash
docker run -p 8080:8080 \
  -v $(pwd)/data:/data \
  -v $(pwd)/uploads:/uploads \
  bookshelves:latest
```

## Testing

To test the build process without Docker:

```bash
# Build the main application
nix build

# Check binary paths
ls -la result/bin/

# Verify static files
ls -la result/static/

# Check proxy config
cat result/data/Caddyfile.template
```
