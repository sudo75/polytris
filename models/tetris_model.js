class Game {
    constructor(id) {
        this.id = id
        this.board = [];
        this.width = 10;
        this.height = 20;
    }

    initBoard() {
        let board = [];
        for (let i = 0; i < this.height; i++) {
            let row = [];
            for (let i = 0; i < this.width; i++) {
                row.push(0);
            }
            board.push(row);
        }
        return board;
    }

    start(width, height) {
        this.board = this.initBoard(width, height);
    }
    
    pushFrame() {
        //push blocks below if possible
        //add functionality code
        return this.board;
    }
}


module.exports = Game;