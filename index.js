const express = require('express');
const app = express();
const port = 3000;
const path = require('path');

const bodyParser = require('body-parser');
app.use(bodyParser.json());

//INITIALIZE

const tetris_controller = require('./controllers/tetris_controller.js');
app.use('/tetris', tetris_controller);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});