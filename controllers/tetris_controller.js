const Game = require('../models/tetris_model.js');

let games = [];

exports.start = (req, res) => {
    const { id, key, useKey, gamemode } = req.body;

    if (id && key) {
        if (!isValidKey(id, key)) {
            return;
        }
    }

    const newGame = new Game(games.length, gamemode);
    newGame.start();
    newGame.useKey = useKey;
    games.push(newGame);
    return res.status(200).json({ message: `Game started successfully with id ${newGame.id}; status ${newGame.status}`, id: newGame.id, key: newGame.key, status: newGame.status });
};

exports.reset = (req, res) => {
    const { id, key } = req.body;

    if (!isValidKey(id, key)) {
        return;
    }

    if (id !== 0 || id != null) {
        games[id].reset();
        const data = {status: games[id].status, stats: games[id].stats}
        //const data = games[id].getFrame();
        return res.status(200).json({ message: `Game reset; status ${data.status}`, status: data.status, stats: data.stats });
    } else {
        return res.status(200).json({ message: 'Game ID not found.' });
    }
};

exports.setStatus = (req, res) => {
    const { id, key, status } = req.body;

    if (!isValidKey(id, key)) {
        return;
    }

    if (id !== 0 || id != null) {
        if (typeof games[id][status] === 'function') {
            games[id][status]();
        }
        return res.status(200).json({ message: `Game status set to ${games[id].status}`, status: games[id].status });
    } else {
        return res.status(200).json({ message: 'Game ID not found.' });
    }
}

exports.reqFrame = (req, res) => {
    const { id, key } = req.body;

    if (!isValidKey(id, key)) {
        return;
    }

    if (games[id]) {
        //games[id].pushFrame();
        const data = games[id].getFrame();
        return res.status(200).json({ message: 'Frame pushed', frame: data.frame, status: data.status, stats: data.stats, eventLog: games[id].getLatestEventLogs(), debug: data.debug });
    } else {
        return res.status(404).json({ message: 'Game not found' });
    }
}

exports.input_up = (req, res) => {
    const { id, key } = req.body;

    if (!isValidKey(id, key)) {
        return;
    }

    games[id].input_up();
    const data = games[id].getFrame();

    return res.status(200).json({ message: 'Frame pushed - input up', frame: data.frame, status: data.status, stats: data.stats, debug: data.debug });

}
exports.input_down = (req, res) => {
    const { id, key } = req.body;

    if (!isValidKey(id, key)) {
        return;
    }

    games[id].input_down();
    const data = games[id].getFrame();

    return res.status(200).json({ message: 'Frame pushed - input down', frame: data.frame, status: data.status, stats: data.stats, debug: data.debug });

}
exports.input_left = (req, res) => {
    const { id, key } = req.body;

    if (!isValidKey(id, key)) {
        return;
    }

    games[id].input_left();
    const data = games[id].getFrame();

    return res.status(200).json({ message: 'Frame pushed - input left', frame: data.frame, status: data.status, stats: data.stats, debug: data.debug });

}
exports.input_right = (req, res) => {
    const { id, key } = req.body;

    if (!isValidKey(id, key)) {
        return;
    }

    games[id].input_right();
    const data = games[id].getFrame();

    return res.status(200).json({ message: 'Frame pushed - input right', frame: data.frame, status: data.status, stats: data.stats, debug: data.debug });

}
exports.input_space = (req, res) => {
    const { id, key } = req.body;

    if (!isValidKey(id, key)) {
        return;
    }

    games[id].input_space();
    const data = games[id].getFrame();

    return res.status(200).json({ message: 'Frame pushed - input right', frame: data.frame, status: data.status, stats: data.stats, debug: data.debug});

}


const isValidKey = (id, key) => {
    if (!games[id].useKey) {
        return true;
    } else {
        return games[id].key === key;
    }
};