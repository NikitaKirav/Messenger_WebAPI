FROM node:18-alpine
WORKDIR /app

EXPOSE 4040
EXPOSE 8081

COPY . .
RUN npm install --location=global npm@8.14.0
RUN npm install 
RUN SHARP_IGNORE_GLOBAL_LIBVIPS=1 npm install --arch=x64 --platform=linux sharp

CMD [ "npm", "start" ]