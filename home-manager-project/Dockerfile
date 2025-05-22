FROM node:20 AS build
WORKDIR /app
COPY ./frontend ./
RUN npm install && npm run build -- --configuration production

FROM nginx:alpine
COPY --from=build /app/dist/home-manager-project /usr/share/nginx/html
COPY ./frontend/nginx.conf /etc/nginx/conf.d/default.conf
