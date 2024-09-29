console.log('public JS running!');

const canvas = document.querySelector('.board');
const ctx = canvas.getContext("2d");

class Game {
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
            text: ['New Game', '-'],
            functions: [() => this.start()],
            objects: []
        }
        this.listeners = [];
    }

    init() {
        canvas.width = this.r_dimensions.width;
        canvas.height = this.r_dimensions.height;
    }

    openMenu() {
        const btnWidth = this.r_dimensions.width * 0.8;
        const btn_OffsetX = (this.r_dimensions.width - btnWidth) / 2;

        for (let i = 0; i < this.menu_btns.text.length; i++) {
            const btn = new Button(btn_OffsetX, 100 + i * 60, btnWidth, 50, this.menu_btns.text[i]);
            this.menu_btns.objects.push(btn);
            btn.draw(ctx);
    
            this.mouseListener = (event) => {
                const rect = canvas.getBoundingClientRect();
                const mouseX = event.clientX - rect.left;
                const mouseY = event.clientY - rect.top;

                switch (event.type) {
                    case 'mousemove':
                        break;
                    case 'mousedown':
                        this.mouseDown = true;
                        break;
                    case 'mouseup':
                        this.mouseDown = false;
                        break;
                }

                canvas.style.cursor = 'default';
                for (let i = 0; i < this.menu_btns.objects.length; i++) {
                    if (this.menu_btns.objects[i].mouseState === 'hover' || this.menu_btns.objects[i].mouseState === 'click') {
                        canvas.style.cursor = 'pointer';
                    }
                }
    
                
                // Check if hovering over the button
                btn.updateMouseState(mouseX, mouseY, this.mouseDown);
    
                if (btn.mouseState !== btn.btnState) {
                    btn.draw(ctx);
                }
            };
    
            canvas.addEventListener('mousemove', this.mouseListener);
            canvas.addEventListener('mousedown', this.mouseListener);
            canvas.addEventListener('mouseup', this.mouseListener);

            this.listeners.push({type: 'mousemove', listener: this.mouseListener});
            this.listeners.push({type: 'mousedown', listener: this.mouseListener});
            this.listeners.push({type: 'mouseup', listener: this.mouseListener});
        };

        this.clickListener = (event) => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;

            for (let i = 0; i < this.menu_btns.objects.length; i++) {
                if (this.menu_btns.objects[i].checkMouseCollision(mouseX, mouseY)) {
                    this.menu_btns.functions[i](null);
                }
            }
        }

        canvas.addEventListener('click', this.clickListener);
        this.listeners.push({type: 'click', listener: this.clickListener});

    }

    closeMenu() {
        // Remove all event listeners that were added
        this.listeners.forEach(({type, listener}) => {
            canvas.removeEventListener(type, listener);
        });

        //Reset cursor
        canvas.style.cursor = 'default';
        
        // Clear the menu area
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        console.log('Menu closed');

    }

    start(id) {
        console.log('start!');
        this.closeMenu();

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
            console.log(data.message);
            this.id = data.id;
            this.status = data.status;
            gameLoop();
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

    requestNewFrame() {
        this.sendReq(
            'tetris/reqFrame',
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

    displayFrame(frame, status, stats, eventLog, debug) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const board = document.querySelectorAll('.game_tile');

        //Update board

        for (let i = 0; i < game.b_dimensions.height; i++) {
            for (let j = 0; j < game.b_dimensions.width; j++) {
                const tileIndex = i * game.b_dimensions.width + j;
                if (frame[i][j] !== 0) {
                    this.drawTile(i, j);
                }
            }
        }

        //Update status
        this.status = status;


        //Update stats


        //Game messages
        if (this.status === "end") {
            //this.overlay("Game Over!")
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
                        //this.overlay('Tetris');
                        break;
                    case 'polytris':
                        //this.overlay('Polytris');
                        break;
                    case 'clear':
                        //this.overlay('Line Clear');
                        break;
                    case 'tetris-perfect':
                        //this.overlay('Perfect Tetris');
                        break;
                    case 'polytris-perfect':
                        //this.overlay('Perfect Polytris');
                        break;
                    case 'clear-perfect':
                        //this.overlay('Perfect Line Clear');
                        break;
                }
            });
            
        }
        

    }
}

class Button {
    constructor(x, y, width, height, text) {
        this.width = {default: width, hover: width * 1.02};
        this.height = {default: height, hover: height * 1.02};

        this.x = {default: x, hover: x - (this.width.hover - this.width.default) / 2};
        this.y = {default: y, hover: y - (this.height.hover - this.height.default) / 2};

        this.d_current = {width: this.width.default, height: this.height.default, x: this.x.default, y: this.y.default};

        this.text = text;
        this.fontSize = 20;
        this.mouseState = 'default'; // in relation to btn
        this.btnState = 'default';
    }

    draw(ctx) {
        // Clear the previous button area
        ctx.clearRect(this.d_current.x - 2, this.d_current.y - 2, this.d_current.width + 4, this.d_current.height + 4);

        // Update size and position based on hover state
        if (this.mouseState === 'hover') {
            this.btnState = 'hover';
            this.d_current.width = this.width.hover;
            this.d_current.height = this.height.hover;
            this.d_current.x = this.x.hover;
            this.d_current.y = this.y.hover;
        } else {
            this.btnState = 'default';
            this.d_current.width = this.width.default;
            this.d_current.height = this.height.default;
            this.d_current.x = this.x.default;
            this.d_current.y = this.y.default;
        }

        // Draw button rectangle
        ctx.beginPath();
        ctx.fillStyle = this.mouseState === 'hover' || this.mouseState === 'click' ? 'lightgray' : 'white';
        ctx.rect(this.d_current.x, this.d_current.y, this.d_current.width, this.d_current.height);
        ctx.fillRect(this.d_current.x, this.d_current.y, this.d_current.width, this.d_current.height);
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();

        // Draw button text, centered
        ctx.font = `${this.fontSize}px Arial`;
        const textWidth = ctx.measureText(this.text).width;
        const textMetrics = ctx.measureText(this.text);
        const textHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;
        const centerX = this.d_current.x + this.d_current.width / 2 - textWidth / 2;
        const centerY = this.d_current.y + this.d_current.height / 2 + textHeight / 2;

        ctx.fillStyle = 'black';
        ctx.fillText(this.text, centerX, centerY);
    }

    updateMouseState(mouseX, mouseY, mouseDown) {
        if (this.checkMouseCollision(mouseX, mouseY)) {
            if (mouseDown) {
                this.mouseState = 'click';
            } else {
                this.mouseState = 'hover';
            }
        } else {
            this.mouseState = 'default';
        }
    }

    checkMouseCollision(mouseX, mouseY) {
        return (
            mouseX >= this.d_current.x &&
            mouseX <= this.d_current.x + this.d_current.width &&
            mouseY >= this.d_current.y &&
            mouseY <= this.d_current.y + this.d_current.height
        )
    }
}

const game = new Game(300, 600);
game.init();
game.openMenu();

//RUN GAME
function gameLoop() {
    if (game.status === "end") {
        //game.endSequence();
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
        JSON.stringify({ id: game.id }),
        (data) => {
            game.displayFrame(data.frame, data.status, data.stats, null, data.debug);
        }
    );
}