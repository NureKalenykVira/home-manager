# Етап 1: Build Angular
FROM node:20 AS builder

WORKDIR /app

# Встановлюємо CLI і залежності
COPY home-manager-project/package*.json ./home-manager-project/
RUN cd home-manager-project && npm install && npm run build -- --configuration production

# Етап 2: Backend
FROM node:20

WORKDIR /usr/src/app

COPY home-manager-api/package*.json ./
RUN npm install

# Копіюємо бекенд
COPY home-manager-api .

# Копіюємо зібраний Angular
COPY --from=builder /app/home-manager-project/dist /usr/src/app/public

# Слухай порт 80
ENV PORT=80
EXPOSE 80

CMD ["node", "bin/www"]
