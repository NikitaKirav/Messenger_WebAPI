FROM node:14-alpine
WORKDIR /app

EXPOSE 4040
EXPOSE 8081

COPY . .
RUN npm install --location=global npm@8.14.0
RUN apk add --update python3 make g++ && rm -rf /var/cache/apk/*
RUN npm install 

CMD [ "npm", "start" ]