FROM node:20

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --production

COPY . .

EXPOSE 80
ENV PORT=80

CMD ["node", "bin/www"]
