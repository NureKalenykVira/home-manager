# Етап 1: Збірка Angular
FROM node:20 AS builder

WORKDIR /app

# Копіюємо лише frontend-частину
COPY home-manager-project ./home-manager-project
WORKDIR /app/home-manager-project

RUN npm install
RUN npm run build -- --configuration production --output-path=../home-manager-api/dist

# Етап 2: Запуск backend
FROM node:20

WORKDIR /usr/src/app

# Копіюємо backend
COPY home-manager-api ./home-manager-api

# Копіюємо зібраний Angular в dist
COPY --from=builder /app/home-manager-api/dist ./home-manager-api/dist

WORKDIR /usr/src/app/home-manager-api

RUN npm install --production

EXPOSE 80

CMD ["node", "bin/www"]
