const express = require('express');
const app = express();
const port = 3000;

const bodyParser = require('body-parser');
app.use(bodyParser.json());

//INITIALIZE

const tetris_controller = require('./controllers/tetris_controller.js');
app.use('/tetris', tetris_controller);