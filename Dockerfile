FROM node:16-alpine
WORKDIR /app

EXPOSE 4040
EXPOSE 8081

COPY . .
RUN npm install -g npm@8.14.0
RUN npm install 

CMD [ "npm", "start" ]