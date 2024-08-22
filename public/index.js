
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
        this.frameFreq = 500; //ms
        this.id = null;
        this.status = null;
        this.debugToggle = {highlight_pivotPoint: false};
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
        fetch(`tetris/start`, {
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
            'tetris/reqFrame',
            'POST',
            JSON.stringify({ id: this.id }),
            (data) => {
                this.displayFrame(data.frame, data.frame_preClear, data.status, data.debug);
            }
        )
    }

    displayFrame(frame, frame_preClear, status, debug) {
        const board = document.querySelectorAll('.game_tile');

        for (let i = 0; i < game.b_dimensions.height; i++) {
            for (let j = 0; j < game.b_dimensions.width; j++) {
                const tileIndex = i * game.b_dimensions.width + j;

                //const displayText = frame[i][j] !== 0 ? frame[i][j]: "";
                //board[tileIndex].innerText = displayText;

                board[tileIndex].className = "";
                board[tileIndex].classList.add('game_tile');
                if (frame[i][j] !== 0) {
                    board[tileIndex].classList.add('game_tile_active');
                    board[tileIndex].classList.add(`game_tile_${frame[i][j]}`);
                }

                //Debug
                const pivotPoint = debug.pivotPoint;
                if (pivotPoint != undefined && this.debugToggle.highlight_pivotPoint) {
                    if (i === pivotPoint[0] && j === pivotPoint[1]) {
                        board[tileIndex].classList.add(`debug_pivotPoint`);
                    }
                }
                

            }
        }

        this.status = status;

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

    async sendAsyncReq(url, method, body, callback) {
        try {
            const response = await fetch(url, { //use /tetris/xyz format
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: body //ensure body is stringified
            });
    
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
    
            const data = await response.json();
            callback(data);
        } catch (error) {
            console.error(`Error: ${error}`);
        }
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

    if (game.status === "end") {
        return;
    }
    
    setTimeout(gameLoop, game.frameFreq);
}

document.addEventListener("keydown", (event) => {
    const key = event.key;
    switch (key) {
        case 'ArrowUp':
            break;
        case 'ArrowDown':
            break;
        case 'ArrowLeft':
            break;
        case 'ArrowRight':
            break;
        default:
            return;
    }
    if (game.status !== "play") {
        return;
    }
    game.sendReq(
        `/tetris/input/${key}`,  //ArrowUp, ArrowDown, ArrowLeft, ArrowRight
        'POST',
        JSON.stringify({ id: game.id }),
        (data) => {
            game.displayFrame(data.frame, null, game.status, data.debug);
        }
    );

});