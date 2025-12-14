# --- Giai đoạn 1: Build ---
# Đổi sang image Maven hỗ trợ Java 23
FROM maven:3.9.9-eclipse-temurin-23 AS build
WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN mvn clean package -DskipTests

# --- Giai đoạn 2: Run ---
# Đổi sang image JRE hỗ trợ Java 23
FROM eclipse-temurin:23-jre
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"] 