# --- Giai đoạn 1: Build ---
# Dùng image Maven có sẵn Java 21 (khớp với log của bạn)
FROM maven:3.9.8-eclipse-temurin-21 AS build
WORKDIR /app

# Chỉ copy file cấu hình và source code
# BỎ QUA lệnh copy .mvn và mvnw gây lỗi
COPY pom.xml .
COPY src ./src

# Dùng lệnh 'mvn' trực tiếp (thay vì ./mvnw)
RUN mvn clean package -DskipTests

# --- Giai đoạn 2: Run ---
FROM eclipse-temurin:21-jre
WORKDIR /app

# Copy file .jar đã build xong từ giai đoạn 1
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]