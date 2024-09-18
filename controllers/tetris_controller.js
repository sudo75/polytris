const Game = require('../models/tetris_model.js');

let games = [];

exports.start = (req, res) => {
    const { id } = req.body;

    if (!id) {
        const newGame = new Game(games.length);
        newGame.start();
        games.push(newGame);
        //const frame = newGame.pushFrame();
        return res.status(200).json({ message: `Game started successfully with id ${newGame.id}; status ${newGame.status}`, id: newGame.id, status: newGame.status });
    } else {
        return res.status(200).json({ message: 'Loading game' });
    }
};

exports.reset = (req, res) => {
    const { id } = req.body;

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
    const { id, status } = req.body;
    if (id !== 0 || id != null) {
        if (typeof games[id][status] === 'function') {
            games[id][status]();
        }
        return res.status(200).json({ message: `Game status set to ${status}`, status: status });
    } else {
        return res.status(200).json({ message: 'Game ID not found.' });
    }
}

exports.reqFrame = (req, res) => {
    const { id } = req.body;

    if (games[id]) {
        //games[id].pushFrame();
        const data = games[id].getFrame();
        return res.status(200).json({ message: 'Frame pushed', frame: data.frame, status: data.status, stats: data.stats, eventLog: games[id].getLatestEventLogs(), debug: data.debug });
    } else {
        return res.status(404).json({ message: 'Game not found' });
    }
}

exports.input_up = (req, res) => {
    const { id } = req.body;

    games[id].input_up();
    const data = games[id].getFrame();

    return res.status(200).json({ message: 'Frame pushed - input up', frame: data.frame, status: data.status, stats: data.stats, debug: data.debug });

}
exports.input_down = (req, res) => {
    const { id } = req.body;

    games[id].input_down();
    const data = games[id].getFrame();

    return res.status(200).json({ message: 'Frame pushed - input down', frame: data.frame, status: data.status, stats: data.stats, debug: data.debug });

}
exports.input_left = (req, res) => {
    const { id } = req.body;


    games[id].input_left();
    const data = games[id].getFrame();

    return res.status(200).json({ message: 'Frame pushed - input left', frame: data.frame, status: data.status, stats: data.stats, debug: data.debug });

}
exports.input_right = (req, res) => {
    const { id } = req.body;

    games[id].input_right();
    const data = games[id].getFrame();

    return res.status(200).json({ message: 'Frame pushed - input right', frame: data.frame, status: data.status, stats: data.stats, debug: data.debug });

}
exports.input_space = (req, res) => {
    const { id } = req.body;

    games[id].input_space();
    const data = games[id].getFrame();

    return res.status(200).json({ message: 'Frame pushed - input right', frame: data.frame, status: data.status, stats: data.stats, debug: data.debug});

}