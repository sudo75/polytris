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
        const data = games[id].pushFrame();
        return res.status(200).json({ message: 'Frame pushed', frame: data.frame, frame_preClear: data.frame_preClear, status: data.status, debug: data.debug});
    } else {
        return res.status(404).json({ message: 'Game not found' });
    }
}

exports.input_up = (req, res) => {
    const { id } = req.body;

    games[id].input_up();
    const data = games[id].getFrame();

    return res.status(200).json({ message: 'Input parsed; frame pushed', frame: data.frame, debug: data.debug});

}
exports.input_down = (req, res) => {
    const { id } = req.body;

    games[id].input_down();
    const data = games[id].getFrame();

    return res.status(200).json({ message: 'Input parsed; frame pushed', frame: data.frame, debug: data.debug});

}
exports.input_left = (req, res) => {
    const { id } = req.body;


    games[id].input_left();
    const data = games[id].getFrame();

    return res.status(200).json({ message: 'Input parsed; frame pushed', frame: data.frame, debug: data.debug});

}
exports.input_right = (req, res) => {
    const { id } = req.body;

    games[id].input_right();
    const data = games[id].getFrame();

    return res.status(200).json({ message: 'Input parsed; frame pushed', frame: data.frame, debug: data.debug});

}