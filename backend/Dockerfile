# ============================================================
# Stage 1 — Build the Spring Boot JAR
# ============================================================
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Cache dependencies for faster rebuilds
COPY pom.xml .
RUN mvn -B dependency:go-offline -DskipTests

# Copy source and build
COPY src ./src
RUN mvn -B clean package -DskipTests

# ============================================================
# Stage 2 — Minimal runtime image
# ============================================================
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENV JAVA_TOOL_OPTIONS="-Xmx350m -XX:+UseContainerSupport"

ENTRYPOINT ["java", "-jar", "app.jar"]