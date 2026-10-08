# =============================================================
# Stage 1 — Build the React SPA with Bun
# =============================================================
FROM oven/bun:1-alpine AS frontend-build
WORKDIR /frontend

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY tsconfig.json vite.config.ts index.html metadata.json ./
COPY src/ ./src/

# Only the Vite half — server.ts is not used anymore (Spring Boot serves the SPA)
RUN bunx vite build

# =============================================================
# Stage 2 — Build Spring Boot fat JAR with the SPA baked in
# =============================================================
FROM maven:3.9-eclipse-temurin-17 AS backend-build
WORKDIR /backend

COPY backend/pom.xml .
RUN mvn -B dependency:go-offline

COPY backend/src ./src

# Drop the compiled React app into Spring Boot's static resources
COPY --from=frontend-build /frontend/dist ./src/main/resources/static

RUN mvn -B clean package -DskipTests

# =============================================================
# Stage 3 — Runtime (JRE only, single process)
# =============================================================
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

COPY --from=backend-build /backend/target/*.jar app.jar

ENV SERVER_PORT=8080
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:8080/api/health || exit 1

ENTRYPOINT ["java", "-jar", "/app/app.jar"]