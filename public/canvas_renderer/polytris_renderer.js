console.log('public JS running!');

const canvas = document.querySelector('.board');
const ctx = canvas.getContext("2d");

const canvas_controls = document.querySelector('.controls');
const ctx_controls = canvas_controls.getContext("2d");

const canvas_hud = document.querySelector('.hud');
const ctx_hud = canvas_hud.getContext("2d");

const canvas_overlay = document.querySelector('.overlay');
const ctx_overlay = canvas_overlay.getContext("2d");


class Renderer {
    constructor(rd_width, rd_height) {
        this.r_dimensions = { //real dimensions
            width: rd_width,
            height: rd_height
        };
        this.b_dimensions = { //block dimensions
            width: 10, //default = 10
            height: 20 //default = 20
        };
        this.maxFPS = 20;
        this.frameFreq = 1000 / this.maxFPS; //ms
        this.id = null;
        this.status = null;
        this.debugToggle = {highlight_pivotPoint: false, displayText: false};
        this.css = {
            tile_margin: 2, //default = 2
            overlay: {
                opaquePeriod: 2000,
                fadePeriod: 500
            }
        };
        this.mouseDown = false;
        this.menu_btns = {
            text: ['New Game', '-', 'Standard Rendering'],
            functions: [
                () => this.start(),
                null,
                () => {
                    window.location.href = '../index.html';
                }
            ],
            objects: []
        }
        this.listeners = [];
        this.overlay = {
            properties: {
                opaquePeriod: 2000,
                fadePeriod: 500
            },
            time: {
                latestInset: null
            },
            open: false,
            text: '',
            opacity: 1,
            timers: []
        }
    }

    init() {
        canvas.width = this.r_dimensions.width;
        canvas.height = this.r_dimensions.height;

        canvas_controls.width = this.r_dimensions.width;
        canvas_controls.height = this.r_dimensions.height;

        canvas_hud.width = this.r_dimensions.width;
        canvas_hud.height = this.r_dimensions.height;

        canvas_overlay.width = this.r_dimensions.width;
        canvas_overlay.height = this.r_dimensions.height;

        const canvas_container = document.querySelector('.canvas_container');
        canvas_container.style.width = `${this.r_dimensions.width}px`;
        canvas_container.style.height = `${this.r_dimensions.height}px`;

        //Event listeners

        document.addEventListener("keydown", (event) => {
            if (this.status !== "play") {
                return;
            }
        
            let key = event.key;
            switch (key) {
                case 'ArrowUp':
                    break;
                case 'ArrowDown':
                    break;
                case 'ArrowLeft':
                    break;
                case 'ArrowRight':
                    break;
                case ' ': //Spacebar
                    key = 'space';
                    break;
                default:
                    return;
            }
            sendInput(key);
        });
        
        document.addEventListener("keyup", (event) => {
            //clear key press btn indication
        
            //list of ids to clear
        
        });
        
        const sendInput = (key) => {
            this.sendReq(
                `/tetris/input/${key}`,  //ArrowUp, ArrowDown, ArrowLeft, ArrowRight, 'space'
                'POST',
                JSON.stringify({ id: this.id }),
                (data) => {
                    this.displayFrame(data.frame, data.status, data.stats, null, data.debug);
                }
            );
        }
    }

    start(id) {
        console.log('start!');

        fetch(`../tetris/start`, {
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
            console.log(data.message);
            this.id = data.id;
            this.status = data.status;
            this.gameLoop();
        })
        .catch((error) => {
            console.error(`${error}`);
        });
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

    gameLoop() {
        if (this.status === "end") {
            return;
        }
    
        this.requestNewFrame();
        
        setTimeout(this.gameLoop.bind(this), this.frameFreq);
    }

    requestNewFrame() {
        this.sendReq(
            '../tetris/reqFrame',
            'POST',
            JSON.stringify({ id: this.id }),
            (data) => {
                this.displayFrame(data.frame, data.status, data.stats, data.eventLog, data.debug);
            }
        );
    }

    drawTile(row, col) {
        const width = this.r_dimensions.width / this.b_dimensions.width;
        const height = this.r_dimensions.height / this.b_dimensions.height;
        const offsetWidth = col * width;
        const offsetHeight = row * height;

        ctx.fillRect(offsetWidth, offsetHeight, width, height);
    }

    drawOverlay(text) { //DOES NOT CLEAR REGION
        ctx_overlay.clearRect(0, 0, canvas_overlay.width, canvas_overlay.height);
        this.overlay.timers.forEach(({type, timer}) => {
            switch (type) {
                case 'interval':
                    clearInterval(timer);
                    break;
                case 'timeout':
                    clearTimeout(timer);
                    break;
            }
        });


        this.overlay.text = text;
        this.overlay.opacity = 1;
        
        this.overlay.open = true;

        ctx_overlay.font = '16px Arial';
        ctx_overlay.fillStyle = `rgba(0, 0, 0, 1)`;

        const textWidth = ctx_overlay.measureText(this.overlay.text).width;
        const centerX = (this.r_dimensions.width - textWidth) / 2;
        ctx_overlay.fillText(`${this.overlay.text}`, centerX, 20);

        const fadeText = (opacityReduction) => {
            ctx_overlay.clearRect(0, 0, canvas_overlay.width, canvas_overlay.height);
            this.overlay.opacity -= opacityReduction;
            ctx_overlay.fillStyle = `rgba(0, 0, 0, ${this.overlay.opacity})`;
            ctx_overlay.fillText(`${this.overlay.text}`, centerX, 20);
        }

        let fadeCaller;
        let fadeTimeout; //give higher scope

        const opaqueTimeout = setTimeout(() => {

            const fps = 20;
            const opacityReduction = (1000 / fps) / this.overlay.properties.fadePeriod;

            fadeCaller = setInterval(() => {
                fadeText(opacityReduction);
            }, 1000 / fps);

            
            fadeTimeout = setTimeout(() => {
                clearInterval(fadeCaller);
                this.overlay.open = false;
                this.overlay.opacity = 1;

                ctx_overlay.fillStyle = `rgba(0, 0, 0, 1)`;

            }, this.overlay.properties.fadePeriod);
            
        }, this.overlay.properties.opaquePeriod);

        this.overlay.timers.push({type: 'interval', timer: fadeCaller}, {type: 'timeout', timer: opaqueTimeout}, {type: 'timeout', timer: fadeTimeout});
    }

    displayFrame(frame, status, stats, eventLog, debug) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        //Update board
        for (let i = 0; i < this.b_dimensions.height; i++) {
            for (let j = 0; j < this.b_dimensions.width; j++) {
                if (frame[i][j] !== 0) {
                    this.drawTile(i, j);
                }
            }
        }

        //Update status
        this.status = status;

        //Display controls
        ctx_controls.clearRect(0, 0, canvas_controls.width, canvas_controls.height);
        
        /*
        const btn = new Button(canvas_controls.width - 50, 200, 40, 40, '*');
        btn.draw(ctx);

        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;btn.updateMouseState(mouseX, mouseY, this.mouseDown);
    
        if (btn.mouseState !== btn.btnState) {
            btn.draw(ctx);
        }
        */

        //Update stats
        
        ctx_hud.clearRect(0, 0, canvas_hud.width, canvas_hud.height);

        ctx_hud.font = '16px Arial';
        ctx_hud.fillStyle = 'blue';

        const stat_keys = Object.keys(stats);
        stat_keys.forEach((key, i) => {
            ctx_hud.fillText(`${key}: ${stats[key]}`, 10, 50 + i * 30);
        });

        //Game messages
        if (this.status === "end") {
            this.drawOverlay("Game Over!")
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
                        this.drawOverlay('Tetris');
                        break;
                    case 'polytris':
                        this.drawOverlay('Polytris');
                        break;
                    case 'clear':
                        this.drawOverlay('Line Clear');
                        break;
                    case 'tetris-perfect':
                        this.drawOverlay('Perfect Tetris');
                        break;
                    case 'polytris-perfect':
                        this.drawOverlay('Perfect Polytris');
                        break;
                    case 'clear-perfect':
                        this.drawOverlay('Perfect Line Clear');
                        break;
                }
            });
            
        }
        

    }
}

/*
const game = new Renderer(300, 600);
game.init();

//RUN GAME
function gameLoop() {
    if (game.status === "end") {
        //game.endSequence();
        //game.requestNewFrame();
        return;
    }

    game.requestNewFrame();
    
    setTimeout(gameLoop, game.frameFreq);
}

*/



export { Renderer };