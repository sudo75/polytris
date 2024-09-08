const express = require('express');
const app = express();
//const port = 3000;
const path = require('path');

const port = process.argv[2];

if (!port || isNaN(port) || port <= 0 || port > 65535) {
    console.error('Invalid or missing port number. Please enter a valid number between 1 and 65535.');
} else {
    console.log(`Server will start on port ${port}.`);
}

const bodyParser = require('body-parser');
app.use(bodyParser.json());


const tetris_routes = require('./routes/tetris_routes');
app.use('/tetris', tetris_routes);

app.use(express.static(path.join(__dirname, 'public')));


//INITIALIZE
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});