/** Absolute imports */
const mongoose = require('mongoose');
const WebSocket = require('ws');

/** Router */
const incoming = require('./routes/chat');

/** App */
const app = require("./app");

// Environment variables
const {
  MONGO_USERNAME,
  MONGO_PASSWORD,
  MONGO_HOSTNAME,
  MONGO_PORT,
  MONGO_DB
} = process.env;

/** Database connection string */
const urlDb = process.env.NODE_ENV && process.env.NODE_ENV === 'production' 
              ? `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGO_DB}`
              : "mongodb://localhost:27017/messanger";
console.log("urlDb: ", urlDb);

/** Working port */
const PORT = process.env.MESSANGER_PORT || 4040;

const start = async() => {
    try {

        // Mongoose Run
        await mongoose.connect(urlDb,
            { useFindAndModify: false, 
              useNewUrlParser: true, 
              useCreateIndex: true, 
              useUnifiedTopology: true });

        // Server Run
        const server = app.listen(PORT, () => {
            console.log(`server is listening on port: ${PORT}`);
        });
        
        // WebSocket-server on the port 8081
        const wss = new WebSocket.Server({ port: 8081 });
        wss.on('connection', function connection(ws) {
          ws.on('message', (data) => incoming(ws, data));
          ws.on('close', function() {
            console.log('WSS close');
          });
        });

        // Shutting down server
        [`exit`, `SIGINT`, `SIGUSR1`, `SIGUSR2`, `uncaughtException`, `SIGTERM`].forEach((eventType) => {
          process.on(eventType, function () {
            server.close((err) => {
                console.log(chalk.blue('Shutting down server'));
                process.exit(err ? 1 : 0);
            });
        });
        });

    } catch(e) {
        console.log('Server Error', e.message);        
        process.exit(1);
    }
}

start();

