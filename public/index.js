
console.log('public JS running!');

class Game {
    constructor(rd_width, rd_height) {
        this.r_dimensions = { //real dimensions
            width: rd_width,
            height: rd_height
        }
        this.b_dimensions = { //block dimensions
            width: 10, //default = 10
            height: 20 //default = 20
        }
        this.maxFPS = 20;
        this.frameFreq = 1000 / this.maxFPS; //ms
        this.id = null;
        this.status = null;
        this.debugToggle = {highlight_pivotPoint: false, displayText: false};
        this.css = {
            tile_margin: 1, //default = 2
            overlay: {
                opaquePeriod: 2000,
                fadePeriod: 500
            }
        }
    }

    init() {
        const r_blockWidth = this.r_dimensions.width / this.b_dimensions.width;
        const r_blockHeight = this.r_dimensions.height / this.b_dimensions.height;
        
        const gameBoard = document.querySelector('.game_board');
        gameBoard.style.width = `${this.r_dimensions.width}px`;
        gameBoard.style.height = `${this.r_dimensions.height}px`;

        for (let i = 0; i < this.b_dimensions.width * this.b_dimensions.height; i++) {
            const tile = document.createElement("div");
            
            tile.style.margin = `${this.css.tile_margin}px`;

            tile.classList.add('game_tile');
            tile.style.width = `${r_blockWidth - this.css.tile_margin * 2}px`;
            tile.style.height = `${r_blockHeight - this.css.tile_margin * 2}px`;
            gameBoard.append(tile);
        }

        //Load texts
        document.querySelector('.game_info').innerText = this.fetchInfoText();
    }

    pause() {
        this.sendReq(
            'tetris/setStatus',
            'POST',
            JSON.stringify({ id: this.id, key: 0, status: 'pause' }),
            (data) => {
                console.log(data.message);

                this.status = data.status;
            }
        );
    }

    resume() {
        this.sendReq(
            'tetris/setStatus',
            'POST',
            JSON.stringify({ id: this.id, key: 0, status: 'resume' }),
            (data) => {
                console.log(data.message);

                this.status = data.status;
            }
        );
    }

    boardBlur(blurState) {
        const board = document.querySelector('.game_board');
        //reset board blur
        board.classList.remove('board_blur');

        if (blurState === true) {
            board.classList.add('board_blur');
        }
    }

    endSequence() {
        this.boardBlur(true);
    }

    start(id) {
        fetch(`tetris/start`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: id,
                useKey: false
            })
        })
        .then((response) => { //ensure the response
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            return response.json();
        })
        .then((data) => { //handle the response
            console.log(data.message);
            this.id = data.id;
            this.status = data.status;
            this.boardBlur(false);
            gameLoop();
        })
        .catch((error) => {
            console.error(`${error}`);
        });
        
        //Run gameloop
    }

    loadFromSave() {

    }

    reset() {
        this.sendReq(
            'tetris/reset',
            'POST',
            JSON.stringify({ id: this.id, key: 0 }),
            (data) => {
                console.log(data.message);
                //this.status = data.status;
                this.stats = data.stats;
            }
        );
    }

    requestNewFrame() {
        this.sendReq(
            'tetris/reqFrame',
            'POST',
            JSON.stringify({ id: this.id, key: 0 }),
            (data) => {
                this.displayFrame(data.frame, data.status, data.stats, data.eventLog, data.debug);
            }
        );
    }

    displayFrame(frame, status, stats, eventLog, debug) {
        const board = document.querySelectorAll('.game_tile');

        //Update board

        for (let i = 0; i < game.b_dimensions.height; i++) {
            for (let j = 0; j < game.b_dimensions.width; j++) {
                const tileIndex = i * game.b_dimensions.width + j;

                if (this.debugToggle.displayText) {
                    const text = frame[i][j] !== 0 ? frame[i][j]: "";
                    board[tileIndex].innerText = text;
                }

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

        //Update status
        this.status = status;

        //Upade labels and buttons

        const btn_start = document.querySelector('#btn_start');
        const btn_reset = document.querySelector('#btn_reset');
        const game_info = document.querySelector('.game_info');

        switch (status) {
            case 'play':
                btn_start.innerText = 'Pause';
                btn_reset.innerText = 'Reset';
                game_info.innerText = 'Game Started';
                break;
            case 'pause':
                btn_start.innerText = 'Resume';
                btn_reset.innerText = 'Reset';
                game_info.innerText = 'Game Paused';
                break;
            default:
                btn_start.innerText = 'New Game';
                //btn_reset.innerText = 'Load From Save';
                btn_reset.innerText = '';
                game_info.innerText = this.fetchInfoText();
                break;
        }

        //Update stats
        const stat_level = document.querySelector('#stat_body_level');
        stat_level.innerText = stats.level;
        const stat_score = document.querySelector('#stat_body_score');
        stat_score.innerText = stats.score;
        const stat_linesCleared = document.querySelector('#stat_body_linesCleared');
        stat_linesCleared.innerText = stats.linesCleared;

        //Game messages
        if (this.status === "end") {
            this.overlay("Game Over!")
        }

        if (eventLog) {
            //Event log

            let logsToKeep = [];
            const currentTime = Date.now();
            for (let i = 0; i < eventLog.length; i++) {
                if (currentTime - eventLog[i].time < 50) {
                    logsToKeep.push(eventLog[i]);
                }
            }

            logsToKeep.forEach(log => {
                switch (log.log) {
                    case 'tetris':
                        this.overlay('Tetris');
                        break;
                    case 'polytris':
                        this.overlay('Polytris');
                        break;
                    case 'clear':
                        this.overlay('Line Clear');
                        break;
                    case 'tetris-perfect':
                        this.overlay('Perfect Tetris');
                        break;
                    case 'polytris-perfect':
                        this.overlay('Perfect Polytris');
                        break;
                    case 'clear-perfect':
                        this.overlay('Perfect Line Clear');
                        break;
                }
            });
            
        }
        

    }

    fetchInfoText() {
        const altTexts = ["?emag a tratS", "GAME", "HAHAHA", "SEVEN", "${error... or intentional?}"];
        const randNum = Math.floor(Math.random() * 100);
        if (randNum === 0) {
            const randTextIndex = Math.floor(Math.random() * altTexts.length);
            return altTexts[randTextIndex];
        } else {
            return "Start a game?";
        }
    }

    fetchTitleText() {

    }

    overlay(text) {
        const overlay = document.querySelector('.game_overlay');

        overlay.innerText = text;

        overlay.style.transition = 'none';
        overlay.style.opacity = 1;

        setTimeout(() => {
            //reinstate transition
            overlay.style.transition = `opacity ${this.css.overlay.fadePeriod}ms ease-out`;
            
            overlay.style.opacity = 0;
            
        }, this.css.overlay.opaquePeriod);
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

////////////////////////////////////////////////////////////////

const game = new Game(300, 600); //300, 600
game.init();

////////////////////////////////////////////////////////////////

//CLICK
document.addEventListener('click', (event) => {
    const target = event.target;
    
    switch(target.id) {
        case "btn_start":
            if (game.status === 'play') {
                game.pause();
            } else if (game.status === 'pause') {
                game.resume();
            } else {
                game.start(null);
            }
            break;
        case "btn_reset":
            if (game.status === 'play') {
                game.reset();
            } else if (game.status === 'pause') {
                game.reset();
            } else {
                game.loadFromSave();
            }
            break;
    }

    if (target.classList.contains('btn_control') && game.status === "play") {
        switch (target.id) {
        case "btn_left":
            sendInput('ArrowLeft');
            break;
        case "btn_right":
            sendInput('ArrowRight');
            break;
        case "btn_up":
            sendInput('ArrowUp');
            break;
        case "btn_down":
            sendInput('ArrowDown');
            break;
        }
    }
});

//RUN GAME
function gameLoop() {
    if (game.status === "end") {
        game.endSequence();
        game.requestNewFrame();
        return;
    }

    game.requestNewFrame();
    
    setTimeout(gameLoop, game.frameFreq);
}


//KEY INPUT
document.addEventListener("keydown", (event) => {
    if (game.status !== "play") {
        return;
    }

    let key = event.key;
    switch (key) {
        case 'ArrowUp':
            document.querySelector('#btn_up').classList.add('key_active');
            break;
        case 'ArrowDown':
            document.querySelector('#btn_down').classList.add('key_active');
            break;
        case 'ArrowLeft':
            document.querySelector('#btn_left').classList.add('key_active');
            break;
        case 'ArrowRight':
            document.querySelector('#btn_right').classList.add('key_active');
            break;
        case ' ': //Spacebar
            key = 'space'
            break;
        default:
            return;
    }
    sendInput(key);
});

document.addEventListener("keyup", (event) => {
    //clear key press btn indication

    //list of ids to clear
    const clear_ids = ['btn_up', 'btn_down', 'btn_left', 'btn_right'];
    
    clear_ids.forEach(id => {
        document.querySelector(`#${id}`).classList.remove('key_active');
    });

});

function sendInput(key) {
    game.sendReq(
        `/tetris/input/${key}`,  //ArrowUp, ArrowDown, ArrowLeft, ArrowRight, 'space'
        'POST',
        JSON.stringify({ id: game.id, key: 0 }),
        (data) => {
            game.displayFrame(data.frame, data.status, data.stats, null, data.debug);
        }
    );
}