# Multi-stage Dockerfile for pqtl_shop backend
# Build stage: use Maven with Eclipse Temurin JDK 23
FROM maven:3.9.8-eclipse-temurin-23 AS build
WORKDIR /app

# Copy only Maven descriptors first to leverage Docker layer cache
COPY pom.xml mvnw* ./
COPY .mvn .mvn

# Copy source
COPY src ./src

# Build the project (skip tests for faster image builds)
RUN mvn -B -DskipTests package

# Runtime stage: lightweight JRE
FROM eclipse-temurin:23-jre AS runtime
WORKDIR /app

# Copy the fat jar from the build stage
COPY --from=build /app/target/*.jar ./app.jar

# Expose default Spring Boot port
EXPOSE 8080

# Recommended environment variables
ENV SPRING_PROFILES_ACTIVE=prod
ENV JAVA_OPTS="-Xms256m -Xmx512m"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
