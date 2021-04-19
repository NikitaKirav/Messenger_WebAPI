const express = require('express');
const mongoose = require('mongoose');
var path = require('path');
var cors = require('cors');
const bodyParser = require('body-parser');
const WebSocket = require('ws');
const incoming = require('./routes/chat');

const PORT = process.env.MESSANGER_PORT || 4000;
const corsOpts = {
    origin: '*',
  
    methods: [
      'GET',
      'POST',
      'PUT',
      'DELETE'
    ],
  
    allowedHeaders: [
      'Content-Type',
    ],
  };

const app = express();

app.use(cors());

app.use(express.json({ extended: true }));
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/profile', require('./routes/profile.routes'));
app.use('/api/users', require('./routes/users.routes'));
app.use('/api/post', require('./routes/post.routes'));

const start = async() => {
    try {
        await mongoose.connect(process.env.MESSANGER_MONGO_URI,
            { useFindAndModify: false, 
              useNewUrlParser: true, 
              useCreateIndex: true, 
              useUnifiedTopology: true });
        app.listen(PORT, 'localhost', () => {
            console.log(`server is listening on port: ${PORT}`);
        });

        // WebSocket-server on the port 8081
        const wss = new WebSocket.Server({ port: 8081, host: 'localhost' });
        wss.on('connection', function connection(ws) {
          ws.on('message', (data) => incoming(ws, data));
        });

    } catch(e) {
        console.log('Server Error', e.message);
        process.exit(1);
    }
}

start();

