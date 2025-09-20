FROM maven:3.8.5-openjdk-17 AS backend-build
WORKDIR /app/backend
COPY backend/pom.xml .
COPY backend/src ./src
RUN mvn clean package -DskipTests

FROM node:16 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json .
RUN npm install
COPY frontend/ .
RUN npm run build

FROM openjdk:17-jdk-slim
WORKDIR /app
COPY --from=backend-build /app/backend/target/*.jar app.jar
COPY --from=frontend-build /app/frontend/dist/frontend /app/public

RUN apt-get update && apt-get install -y nginx sqlite3

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["sh", "-c", "service nginx start && java -jar app.jar"]
