# --- Giai đoạn 1: Build ---
# Đổi sang image Maven hỗ trợ Java 23
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

COPY pom.xml .  
COPY src ./src

RUN mvn -B clean package -DskipTests

# --- Giai đoạn 2: Run ---
# Đổi sang image JRE hỗ trợ Java 23
FROM eclipse-temurin:17-jre
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

# Lower Java memory footprint for small hosts (adjust as needed)
ENV JAVA_OPTS="-Xms128m -Xmx384m -XX:+UseG1GC -XX:MaxGCPauseMillis=200"
# Use production Spring profile inside container
ENV SPRING_PROFILES_ACTIVE=prod

EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]