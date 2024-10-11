console.log('public JS running!');

const canvas = document.querySelector('.board');
const ctx = canvas.getContext("2d");

const canvas_controls = document.querySelector('.controls');
const ctx_controls = canvas_controls.getContext("2d");

const canvas_hud = document.querySelector('.hud');
const ctx_hud = canvas_hud.getContext("2d");

const canvas_overlay = document.querySelector('.overlay');
const ctx_overlay = canvas_overlay.getContext("2d");

import {Btn_Menu} from 'https://sudo75.github.io/canvas-functions/btn_menu.js';
import {Game_Option_Menu} from './game_option_menu.js';

class Renderer {
    constructor(rd_width, rd_height, btns) {
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

        //In-game quick controls
        this.quickControlBtns = btns.quickControlBtns;
        this.quickControlMenu = null;

        //In game menu - control/settings
        this.gameControlBtns = btns.gameControlBtns;
        this.gameControlMenu = new Game_Option_Menu(canvas_controls, ctx_controls, 'Options', this.gameControlBtns, this.r_dimensions.width, this.r_dimensions.height);

        //Death screen menu
        this.endMenuBtns = btns.endMenuBtns;
        this.endMenu = new Game_Option_Menu(canvas_controls, ctx_controls, 'Game Over', this.endMenuBtns, this.r_dimensions.width, this.r_dimensions.height);
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
    }

    loadQuickControlBtns() {
        ctx_controls.clearRect(0, 0, canvas_controls.width, canvas_controls.height);
        this.quickControlMenu = new Btn_Menu(canvas_controls, ctx_controls, this.quickControlBtns, canvas_controls.width - 40 - 5, 5);

        this.quickControlMenu.btn_dimensions.width = 40;
        this.quickControlMenu.btn_dimensions.height = 40;
        this.quickControlMenu.init();
    }

    unloadQuickControlBtns() {
        ctx_controls.clearRect(0, 0, canvas_controls.width, canvas_controls.height);
        this.quickControlMenu.removeListeners();
    }

    start(id) {
        this.loadQuickControlBtns();
    }

    openGameControlMenu() {
        this.unloadQuickControlBtns();
        this.gameControlMenu.open();
        
        this.clearBoard();
    }

    closeGameControlMenu() {
        this.gameControlMenu.close();
        
        this.loadQuickControlBtns();
        //this.resume();
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

    clearBoard() { //Only clears visually
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx_hud.clearRect(0, 0, canvas_hud.width, canvas_hud.height);
    }

    endSequence() {
        this.unloadQuickControlBtns();
        this.clearBoard();

        this.endMenu.open();
    }

    closeEndMenu() {
        this.endMenu.close();
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

        this.displayOverlayText();

        const fadeText = (opacityReduction) => {
            this.overlay.opacity -= opacityReduction;
            ctx_overlay.clearRect(0, 0, canvas_overlay.width, canvas_overlay.height);

            ctx_overlay.fillStyle = `rgba(0, 0, 0, ${this.overlay.opacity})`;
            this.displayOverlayText();
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

    longOverlay(text) {
        ctx_overlay.clearRect(0, 0, canvas_overlay.width, canvas_overlay.height);

        this.overlay.text = text;
        this.overlay.opacity = 1;
        
        this.overlay.open = true;

        ctx_overlay.fillStyle = `rgba(0, 0, 0, 1)`;
        this.displayOverlayText();
    }

    closeOverlay() {
        ctx_overlay.clearRect(0, 0, canvas_overlay.width, canvas_overlay.height);

        this.overlay.text = '';
        this.overlay.open = false;
    }

    displayOverlayText() { //Does not clear canvas
        ctx_overlay.font = '16px Arial';

        const textWidth = ctx_overlay.measureText(this.overlay.text).width;
        const centerX = (this.r_dimensions.width - textWidth) / 2;
        ctx_overlay.fillText(`${this.overlay.text}`, centerX, 20);
    }

    default_callback() {
        console.log('callback: defaulted');
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
            //this.drawOverlay("Game Over!")
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

export { Renderer };