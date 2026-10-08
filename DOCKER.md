# Docker Deployment Guide

This project includes Docker configuration for containerizing and running the **Pet Grooming Salon Management System**.

---

## Quick Start with Docker Compose

The easiest way to build and start the application is using Docker Compose:

```bash
# Build and run the container in the foreground
docker compose up --build

# Or run in detached (background) mode
docker compose up --build -d
```

Once running, access the application in your browser:
**http://localhost:3000**

To stop the container:
```bash
docker compose down
```

---

## Building and Running with Docker CLI

### 1. Build the Docker Image
```bash
docker build -t pet-grooming-app:latest .
```

### 2. Run the Container
```bash
docker run -d \
  --name pet-grooming-salon-app \
  -p 3000:3000 \
  -e PORT=3000 \
  -e NODE_ENV=production \
  pet-grooming-app:latest
```

### 3. Check Container Health and Logs
```bash
# Check container status
docker ps

# View real-time logs
docker logs -f pet-grooming-salon-app

# Inspect healthcheck status
docker inspect --format='{{json .State.Health}}' pet-grooming-salon-app
```

### 4. Stop and Remove the Container
```bash
docker stop pet-grooming-salon-app
docker rm pet-grooming-salon-app
```

---

## Production & Security Features

- **Multi-Stage Build**: Keeps image size minimal by separating compilation dependencies from production runtime.
- **Non-Root Execution**: Runs under a dedicated `node` user with limited privileges.
- **Automated Healthchecks**: Validates `/api/health` availability every 30 seconds.
- **Configurable Port**: Listens on `PORT` environment variable (defaults to 3000).
- **Embedded API & Static Assets**: Serves both Express API endpoints and Vite-built React frontend from the unified container.

---

## Optional: Spring Boot Backend Microservice

If deploying the Spring Boot backend (`/backend`) independently:

```bash
cd backend
docker build -t pet-grooming-backend:latest .
docker run -d -p 8080:8080 pet-grooming-backend:latest
```
