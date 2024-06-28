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
        this.frameFreq = 1000; //ms
        this.id = null;
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
        }

        container.append(gameBoard);
    }

    start(id) {
        fetch('/tetris/start', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: id
            })
        })
        .then((response) => { //ensure the response
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            return response.json();
        })
        .then((data) => { //handle the response
            console.log('Game started:', data);
            this.id = data.id;
            gameLoop();
        })
        .catch((error) => {
            console.error(`${error}`);
        });
        
        //Run gameloop
    }

    requestNewFrame() {
        this.sendReq(
            '/tetris/reqFrame',
            'POST',
            JSON.stringify({ id: this.id }),
            (data) => {
                displayFrame(data.frame);
            }
        )
    }

    sendReq(url, method, body, callback) {
        fetch(`${url}`, { //use /tetris/xyz format
            method: `${method}`,
            headers: {
                'Content-Type': 'application/json'
            },
            body: `${body}`//ensure body is stringified
        })
        .then((response) => { //ensure the response
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            return response.json();
        })
        .then((data) => { //handle the response
            callback(data);
        })
        .catch((error) => {
            console.error(`Error: ${error}`);
        });
    }
}

const game = new Game(300, 600);

game.init();

document.addEventListener('click', (event) => {
    const target = event.target;

    switch(target.id) {
        case "btn_start":
            game.start(null);
            break;
    }
});

function gameLoop() {
    game.requestNewFrame();

    
    setTimeout(gameLoop, game.frameFreq);
}

function displayFrame(frame) {
    const board = document.querySelector('.game_container');
    console.log(frame);
}