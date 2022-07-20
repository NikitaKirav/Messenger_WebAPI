FROM node:18-alpine
WORKDIR /app

EXPOSE 4040
EXPOSE 8081

COPY . .
RUN npm install

CMD [ "npm", "start" ]