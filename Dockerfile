# ============================================
# Multi-stage Dockerfile: Node (React build) + Maven (Java build)
# ============================================

# Stage 1: Build React frontend
FROM node:20-alpine AS frontend-build
WORKDIR /frontend

# Copy frontend code from REDDIS directory (needs to be in Docker context)
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Build Spring Boot
FROM maven:3.9-eclipse-temurin-17 AS backend-build
WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline -B

COPY src ./src

# Copy React build output into Spring Boot static resources
COPY --from=frontend-build /frontend/dist/ ./src/main/resources/static/

RUN mvn package -DskipTests -B

# Stage 3: Runtime
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

COPY --from=backend-build /app/target/*.jar app.jar

EXPOSE 8080

ENV SPRING_PROFILES_ACTIVE=prod

ENTRYPOINT ["java", "-Djava.net.preferIPv4Stack=true", "-jar", "app.jar"]
