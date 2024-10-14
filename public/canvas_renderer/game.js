import {Menu_Renderer} from 'https://sudo75.github.io/canvas-functions/menu_renderer.js';
import {Btn} from 'https://sudo75.github.io/canvas-functions/button.js';
import {Renderer} from './polytris_renderer.js';
import {Info_Screen} from './info_screen.js';

class Game {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.canvas_menu = document.querySelector('.menu');
        this.ctx_menu = this.canvas_menu.getContext('2d');
        this.btns = [
            {txt: ['Play'], callback: this.start.bind(this)},
            {txt: ['Settings'], callback: this.openSettings.bind(this)},
            {txt: ['Statistics'], callback: this.openStats.bind(this)}
        ];
        this.menu = new Menu_Renderer('Polytris', 'Canvas Rendering (alpha)', 'v.0.4.0', this.btns, width, height, this.canvas_menu);

        this.maxFPS = 20;
        this.frameFreq = 1000 / this.maxFPS; //ms
        this.id = null;
        this.status = null;
        this.stats = null;
        this.saved_stats = {
            debug: 6,
            debug2: 91
        }

        this.renderer_btns = {
            quickControlBtns: [
                {txt: ['⚙'], callback: () => {
                    if (this.status === 'play') {
                        this.pause();
                    }
                    this.renderer.openGameControlMenu();

                    if (this.renderer.overlay.open) { //prevents overlay while in the menu
                        this.renderer.closeOverlay();
                    }
                }
                
                },
                {txt: ['⏯'], callback: () => {
                        if (this.status === 'pause') {
                            this.resume();
                            this.renderer.closeOverlay();
                            this.renderer.drawOverlay('Resume...')
                        } else if (this.status === 'play') {
                            this.pause();
                            this.renderer.longOverlay('Paused');
                        }
                    }
                }
            ],
            gameControlBtns: [ //in-game menu page
                {txt: ['Reset'], callback: () => {
                    this.renderer.closeGameControlMenu();
                    this.reset();
                    this.renderer.endSequence(this.stats);
                }},
                {txt: ['Return'], callback: () => {
                    this.renderer.closeGameControlMenu();
                    this.resume();
                }}
            ],
            endMenuBtns: [
                {txt: ['Main Menu'], callback: () => {
                    this.renderer.closeEndMenu();
                    this.openMenu();
                }}
            ]
        }
        this.renderer = new Renderer(width, height, this.renderer_btns);

        this.settings_btns = [
            {txt: ['Setting 1'], callback: this.default_callback.bind(this)},
            {txt: ['Standard Rendering'], callback: this.useStandardRenderer.bind(this)},
            {txt: ['Main Menu'], callback: this.closeSettings.bind(this)}
        ]

        this.settings = new Menu_Renderer('Settings', null, null, this.settings_btns, width, height, this.canvas_menu);

        this.stats_screen = null;
    }

    init() {
        this.openMenu();

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
        this.closeMenu();

        this.renderer.init();
        this.renderer.start();

        //Send Start Request
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

            this.renderer.status = data.status;
            this.gameLoop();
        })
        .catch((error) => {
            console.error(`${error}`);
        });
    }

    pause() {
        this.status = 'pause';
        this.sendReq(
            '../tetris/setStatus',
            'POST',
            JSON.stringify({ id: this.id, status: 'pause' }),
            (data) => {
                console.log(data.message);

                this.status = data.status;
            }
        );
    }

    resume() {
        this.sendReq(
            '../tetris/setStatus',
            'POST',
            JSON.stringify({ id: this.id, status: 'resume' }),
            (data) => {
                console.log(data.message);
                
                this.status = data.status;
            }
        );
    }

    reset() {
        this.sendReq(
            '../tetris/reset',
            'POST',
            JSON.stringify({ id: this.id }),
            (data) => {
                console.log(data.message);
                //this.status = data.status;
                this.stats = data.stats;
            }
        );
    }

    useStandardRenderer() {
        window.location.href = '../index.html';
    }

    default_callback() {
        console.log('Default callback: not assigned');
    }

    openStats() {
        this.closeMenu();
        
        const info = Object.keys(this.saved_stats).map(key => (
            {
                head: `${key}:  `,
                txt: this.saved_stats[key]
            }
        ));
        this.stats_screen = {
            info: new Info_Screen(this.canvas_menu, this.ctx_menu, "Statistics", info, 5), 
            menuLink: new Btn(this.canvas_menu, this.ctx_menu, 10, this.canvas_menu.height - 60, this.canvas_menu.width - 20, 50, ['Return'], this.closeStats.bind(this)),
            listener: null,
            mouseListener: (event) => {
                this.canvas_menu.style.cursor = 'default';
                const rect = this.canvas_menu.getBoundingClientRect();
                const mouseX = event.clientX - rect.left;
                const mouseY = event.clientY - rect.top;

                if (
                    (mouseX >= this.stats_screen.menuLink.bounds.x && mouseX <= this.stats_screen.menuLink.bounds.x + this.stats_screen.menuLink.bounds.width) &&
                    (mouseY >= this.stats_screen.menuLink.bounds.y && mouseY <= this.stats_screen.menuLink.bounds.y + this.stats_screen.menuLink.bounds.height)
                ) {
                    this.canvas_menu.style.cursor = 'pointer';
                }
            },

            open: () => {
                this.canvas_menu.style.pointerEvents = 'auto';
                this.stats_screen.info.open();
                this.stats_screen.menuLink.init();

                this.stats_screen.listener = this.stats_screen.mouseListener.bind(this);
                this.canvas_menu.addEventListener('mousemove', this.stats_screen.mouseListener);
            },

            close: () => {
                this.canvas_menu.style.pointerEvents = 'none';
                this.stats_screen.info.close();
                this.stats_screen.menuLink.removeListeners();

                this.canvas_menu.removeEventListener('mousemove', this.stats_screen.listener);
            }
        };

        this.stats_screen.open();
    }

    closeStats() {
        this.stats_screen.close();
        this.openMenu();
    }

    openMenu() {
        document.querySelector('.menu').style.opactiy = '1';
        const canvas_container = document.querySelector('.canvas_container');
        canvas_container.style.width = '300px';
        canvas_container.style.height = '600px';

        this.menu.font.title.size = 40;
        this.menu.init();
    }

    closeMenu() {
        this.menu.close();
    }

    openSettings() {
        this.closeMenu();
        this.settings.init();
    }

    closeSettings() {
        this.settings.close();
        this.openMenu();
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
            this.renderer.endSequence(this.stats);
            return;
        }
    
        if (this.status === 'play') {
            this.requestNewFrame();
        }
        
        setTimeout(this.gameLoop.bind(this), this.frameFreq);
    }

    requestNewFrame() {
        this.sendReq(
            '../tetris/reqFrame',
            'POST',
            JSON.stringify({ id: this.id }),
            (data) => {
                this.displayFrame(data.frame, data.status, data.stats, data.eventLog, data.debug);
                this.status = data.status;
                this.stats = data.stats;
            }
        );
    }

    displayFrame(frame, status, stats, eventLog, debug) {
        if (this.status === "pause") {
            return;
        }
        this.renderer.displayFrame(frame, status, stats, eventLog, debug);
    }
}

export { Game }