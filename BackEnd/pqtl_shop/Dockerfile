# Build stage
FROM maven:3.9.8-eclipse-temurin-21 AS build
WORKDIR /app

# Copy Maven descriptors first
COPY pom.xml mvnw* ./
COPY .mvn .mvn

# Copy source
COPY src ./src

# Build jar
RUN mvn -B -DskipTests package

# Runtime stage
FROM eclipse-temurin:21-jre
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENV SPRING_PROFILES_ACTIVE=prod
ENV JAVA_OPTS="-Xms256m -Xmx512m"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
