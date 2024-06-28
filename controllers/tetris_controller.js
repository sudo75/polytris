const Game = require('../models/tetris_model.js');

let games = [];

exports.start = (req, res) => {
    const { id } = req.body;

    if (!id) {
        const newGame = new Game(games.length);
        newGame.start();
        games.push(newGame);
        //const frame = newGame.pushFrame();
        return res.status(200).json({ message: 'Game started successfully', id: newGame.id});
    } else {
        return res.status(200).json({ message: 'Loading game' });
    }
};

exports.reqFrame = (req, res) => {
    const { id } = req.body;

    if (games[id]) {
        const frame = games[id].pushFrame();
        return res.status(200).json({ message: 'Frame pushed', frame: frame});
    } else {
        return res.status(404).json({ message: 'Game not found' });
    }
}