FROM node:18-alpine
WORKDIR /app

EXPOSE 4040
EXPOSE 8081

COPY . .
RUN npm install --location=global npm@8.15.0
RUN npm install 

CMD [ "npm", "start" ]