FROM node:20

WORKDIR /usr/src/app

COPY . ./

RUN npm install --production

EXPOSE 80

CMD ["node", "bin/www"]
