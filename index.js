const express = require('express');
const app = express();
const port = 3000;
const path = require('path');

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