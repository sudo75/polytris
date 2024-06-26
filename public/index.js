console.log('public JS running!');

class Game {
    constructor(rd_width, rd_height) {
        this.r_dimensions = { //real dimensions
            width: rd_width,
            height: rd_height
        }
        this.b_dimensions = { //block dimensions
            width: 10,
            height: 20
        }
    }

    init() {
        const r_blockWidth = this.r_dimensions.width / this.b_dimensions.width;
        const r_blockHeight = this.r_dimensions.height / this.b_dimensions.height;

        const container = document.querySelector('.container');
        
        const gameBoard = document.createElement("div");
        gameBoard.classList.add('game_container');
        gameBoard.style.width = `${this.r_dimensions.width}px`;
        gameBoard.style.height = `${this.r_dimensions.height}px`;

        for (let i = 0; i < this.b_dimensions.width * this.b_dimensions.height; i++) {
            const tile = document.createElement("div");
            tile.classList.add('game_tile');
            tile.style.width = `${r_blockWidth}px`;
            tile.style.height = `${r_blockHeight}px`;
            gameBoard.append(tile);
            console.log(i);
        }

        container.append(gameBoard);
    }

    start() {

    }

    sendReq(req) {

    }
}

const game = new Game(300, 600);

game.init();