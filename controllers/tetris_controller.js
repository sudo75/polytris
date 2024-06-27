const express = require('express');

exports.start = (req, res) => {
    const { game_id } = req.body;

    if (!game_id) {
        return res.status(400).send('Creating game');
    } else {
        return res.status(400).send('Loading game');
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