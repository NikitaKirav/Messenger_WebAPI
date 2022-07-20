/** Absolute imports */
const express = require('express');
const bodyParser = require("body-parser");
const cors = require('cors');
const path = require('path');



const app = express();
app.use(cors());

app.use(express.json({ extended: true }));
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

app.use('/api-messanger/auth', require('./routes/auth.routes'));
app.use('/api-messanger/profile', require('./routes/profile.routes'));
app.use('/api-messanger/users', require('./routes/users.routes'));
app.use('/api-messanger/post', require('./routes/post.routes'));

module.exports = app;
