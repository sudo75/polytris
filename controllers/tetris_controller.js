const Game = require('../models/tetris_model.js');

exports.start = (req, res) => {
    const { game_id } = req.body;

    if (!game_id) {
        return res.status(200).json({ message: 'Game started successfully' });
    } else {
        return res.status(200).json({ message: 'Loading game' });
    }

    /*
    if (!games[gameId]) {
        games[gameId] = {
        playerName,
        state: { } //initial game state
        };
        return res.status(200).send('Game started');
    } else {
        return res.status(400).send('Game already exists');
    }
    */
};