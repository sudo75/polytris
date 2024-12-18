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
        this.sound_playing = false;

        this.pendingInputs = [];
        this.pendingFrameCount = 0;
        this.pendingFrameLimit = 10;

        this.droppedFrames = [];
        
        this.maxFPSOptions = [2, 5, 10, 20, 30, 40, 50, 60];
        this.maxFPS = 20;
        this.frameFreq = 1000 / this.maxFPS; //ms

        this.frameLog = [];
        this.currentFPS = this.maxFPS;
        this.displayFPS = this.currentFPS;
        this.currentLag = 0;
        this.displayLag = this.currentLag;

        this.FPS_displayFreq = 500;

        this.id = null;
        this.key = null;
        this.status = null;
        this.stats = null;
        this.saved_stats = [
            { //Polytris
                hiLevel: 0,
                hiScore: 0,
                hiLinesCleared: 0
            }, { //Monomioes
                hiLevel: 0,
                hiScore: 0,
                hiLinesCleared: 0
            }, { //Dominoes
                hiLevel: 0,
                hiScore: 0,
                hiLinesCleared: 0
            }, { //Trominoes
                hiLevel: 0,
                hiScore: 0,
                hiLinesCleared: 0
            }, { //Tetris
                hiLevel: 0,
                hiScore: 0,
                hiLinesCleared: 0
            }, { //Pentominoes
                hiLevel: 0,
                hiScore: 0,
                hiLinesCleared: 0
            }
        ]
        this.gamemode_arr = ['Polytris', 'Monomioes', 'Dominoes', 'Trominoes', 'Tetris', 'Pentominoes'];
        this.gamemode = 0; //'Polytris', Dominoes, Trominoes, Tetris, Pentominoes, Monomioes
        this.gamemodeBtn_arr = ['...*Polytris*...', '...Monomioes...', '...Dominoes...', '...Trominoes...', '...Tetris...', '...Pentominoes...'];

        this.settings = {
            sound: false,
            music: false,
            dynamicFPS: true,
            dynamicDelay: true
        };

        this.currentSongIndex = null;
        this.audio = [
            new Audio('../sound/chiptune_1.mp3'),
            new Audio('../sound/chiptune_2.mp3'),
            new Audio('../sound/chiptune_3.mp3'),
            new Audio('../sound/chiptune_4.mp3'),
            new Audio('../sound/chiptune_5.mp3'),
            new Audio('../sound/chiptune_6-tetris-.mp3'),
            new Audio('../sound/chiptune_7.mp3')
        ];
        this.musicListener = null;

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
                    this.endGame();
                }},
                {txt: ['Next music'], callback: () => {
                    this.nextMusic();
                    this.renderer.closeGameControlMenu();
                    this.resume();
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
            ],
            gamemodeBtns: [ //gamemode selection page
                {txt: ['...*Polytris*...', '...Monomioes...', '...Dominoes...', '...Trominoes...', '...Tetris...', '...Pentominoes...'], callback: () => {
                    this.gamemode = this.gamemode >= this.gamemode_arr.length - 1 ? 0: this.gamemode + 1;
                }},

                {txt: ['Start'], callback: () => {
                    this.renderer.closeGamemodeMenu();
                    this.start(this.id, this.key);
                }},
                {txt: ['<= Return to Menu'], callback: () => {
                    this.renderer.closeGamemodeMenu();
                    this.openMenu();
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
            {txt: ['Sound Off', 'Sound On'], callback: () => {
                this.settings.sound = this.settings.sound ? false: true;
                localStorage.setItem('settings', JSON.stringify(this.settings));
            }},
            {txt: ['Music Off', 'Music On'], callback: () => {
                this.settings.music = this.settings.music ? false: true;
                localStorage.setItem('settings', JSON.stringify(this.settings));
            }},
            {txt: ['Dynamic FPS (recommended): On', 'Dynamic FPS: Off'], callback: () => {
                this.settings.dynamicFPS = this.settings.dynamicFPS ? false: true;
                localStorage.setItem('settings', JSON.stringify(this.settings));
            }},
            {txt: ['MaxFPS: 2', 'MaxFPS: 5', 'MaxFPS: 10', 'MaxFPS: 20', 'MaxFPS: 30', 'MaxFPS: 40', 'MaxFPS: 50', 'MaxFPS: 60'], callback: () => {
                for (let i = 0; i < this.maxFPSOptions.length; i++) {
                    if (this.maxFPS === this.maxFPSOptions[i]) {
                        if (i >= this.maxFPSOptions.length - 1) {
                            this.maxFPS = this.maxFPSOptions[0];
                            break;
                        } else {
                            this.maxFPS = this.maxFPSOptions[i + 1];
                            break;
                        }
                    }
                }

                localStorage.setItem('maxFPS', JSON.stringify(this.maxFPS));
            }},
            {txt: ['Dynamic frame delay: On', 'Dynamic frame delay: Off'], callback: () => {
                this.settings.dynamicDelay = this.settings.dynamicDelay ? false: true;
                localStorage.setItem('settings', JSON.stringify(this.settings));
            }},
            {txt: ['Classic Rendering'], callback: this.useStandardRenderer.bind(this)},
            {txt: ['Main Menu'], callback: this.closeSettings.bind(this)}
        ]

        this.settings_screen = new Menu_Renderer('Settings', null, null, this.settings_btns, width, height, this.canvas_menu);

        this.stats_screen = null;

        //Main Menu
        this.btns = [
            {txt: ['Play'], callback: () => {
                this.closeMenu();
                if (this.renderer_btns.gamemodeBtns[0].txt[0] !== this.gamemodeBtn_arr[this.gamemode]) {
                    const rotatedTxtsArr = this.renderer_btns.gamemodeBtns[0].txt.slice(this.gamemode).concat(this.renderer_btns.gamemodeBtns[0].txt.slice(0, this.gamemode));
                    this.renderer_btns.gamemodeBtns[0].txt = rotatedTxtsArr;
                }
        
                this.renderer.openGamemodeMenu();
            }},
            {txt: ['Settings'], callback: this.openSettings.bind(this)},
            {txt: ['Statistics'], callback: this.openStats.bind(this)}
        ];
        this.menu = new Menu_Renderer('Polytris', 'Canvas Rendering', 'v.1.0.0', this.btns, width, height, this.canvas_menu);
    }

    initMusic() {
        if (!this.settings.music) {
            return;
        }
        this.nextMusic('rand');
        this.pauseMusic();
    }

    playMusic() {
        if (!this.settings.music) {
            return;
        }
        this.audio[this.currentSongIndex].play();
    }

    pauseMusic() {
        if (!this.settings.music) {
            return;
        }
        this.audio[this.currentSongIndex].pause();
    }

    nextMusic(index) {
        if (!this.settings.music) {
            return;
        }
        if (index) {
            if (index === 'rand') {
                this.currentSongIndex = Math.floor(Math.random() * this.audio.length)
            } else {
                this.currentSongIndex = index;
            }
        } else {
            this.currentSongIndex = this.currentSongIndex >= this.audio.length - 1 ? 0: this.currentSongIndex + 1;
        }

        if (this.gamemode === 4) {
            this.currentSongIndex = 5;
        }

        this.audio[this.currentSongIndex].currentTime = 0;
        
        const nextSong = () => {
            //Remove event listener
            this.audio[this.currentSongIndex].removeEventListener('ended', nextSong);

            setTimeout(() => {
                this.nextMusic();
                if (this.status === 'play') {
                    this.playMusic();
                }
            }, 5000);
        }

        //Event listener
        this.audio[this.currentSongIndex].addEventListener('ended', nextSong);
    }

    init() {
        this.openMenu();

        //Set saved_stats
        if (localStorage.getItem('saved_stats')) {
            this.saved_stats = JSON.parse(localStorage.getItem('saved_stats'));
        }

        //Set settings
        if (localStorage.getItem('settings')) {
            this.settings = JSON.parse(localStorage.getItem('settings'));
        }

        if (localStorage.getItem('maxFPS')) {
            this.maxFPS = JSON.parse(localStorage.getItem('maxFPS'));
        }
        
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
                    if (this.status === 'play' && !this.sound_playing && this.settings.sound) {
                        const hit_sound = new Audio('../sound/hit.mp3');
                        hit_sound.volume = 0.2;
                        hit_sound.play();
                        this.sound_playing = true;
                        hit_sound.addEventListener('ended', () => {
                            this.sound_playing = false;
                        });
                    }
                    break;
                default:
                    return;
            }
            sendInput(key);
        });
        
        const sendInput = (key) => {
            let consecInputs = 0;
            for (let i = this.pendingInputs.length - 2; i >= 0; i--) {
                if (this.pendingInputs[i] === this.pendingInputs[this.pendingInputs.length - 1]) {
                    consecInputs++;
                } else {
                    break;
                }
            }

            if (consecInputs > 3 || this.pendingInputs.length > 6) {
                console.warn(`Input cancelled: "${key}"`)
                return;
            }

            this.pendingInputs.push(key);
            this.sendReq(
                `/polytris/input/${key}`,  //ArrowUp, ArrowDown, ArrowLeft, ArrowRight, 'space'
                'POST',
                JSON.stringify({ id: this.id, key: this.key }),
                (data) => {
                    this.pendingInputs.shift();
                    this.displayFrame(data.frame, data.status, data.stats, null, data.debug);
                }
            );
        }

        //DisplayFPS
        setInterval(() => {
            this.displayFPS = this.currentFPS;
            this.displayLag = this.currentLag;
        }, this.FPS_displayFreq);
    }

    start(id, key) {
        //this.closeMenu();

        this.initMusic();
        this.playMusic();
        
        this.renderer.init();
        this.renderer.start();

        //Send Start Request
        fetch(`../polytris/start`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: id,
                key: key,
                useKey: true,
                gamemode: this.gamemode
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
            this.key = data.key;
            this.status = data.status;

            this.renderer.status = data.status;
            this.gameLoop();
        })
        .catch((error) => {
            console.error(`${error}`);
        });
    }

    pause() {
        this.pauseMusic();
        this.status = 'pause';
        this.sendReq(
            '../polytris/setStatus',
            'POST',
            JSON.stringify({ id: this.id, key: this.key, status: 'pause' }),
            (data) => {
                console.log(data.message);

                this.status = data.status;
            }
        );
    }

    resume() {
        this.playMusic();
        this.sendReq(
            '../polytris/setStatus',
            'POST',
            JSON.stringify({ id: this.id, key: this.key, status: 'resume' }),
            (data) => {
                console.log(data.message);
                
                this.status = data.status;
            }
        );
    }

    reset() {
        this.sendReq(
            '../polytris/reset',
            'POST',
            JSON.stringify({ id: this.id, key: this.key }),
            (data) => {
                console.log(data.message);
                this.status = data.status;
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

    resetStats(gamemode) {
        if (confirm(`Reset all ${this.gamemode_arr[gamemode]} data?`)) {
            Object.keys(this.saved_stats[gamemode]).forEach((key) => {
                this.saved_stats[gamemode][key] = 0;
            });

            localStorage.setItem('saved_stats', JSON.stringify(this.saved_stats));

            this.stats_screen.close();
            this.openStats();
        }
    }

    openStats() {
        
        const saved_stats = structuredClone(this.saved_stats);

        this.closeMenu();

        const info = saved_stats.map((stat) => {
            return Object.keys(stat).map(key => {
                switch (key) {
                    case 'hiLevel':
                        return { head: 'High Level:  ', txt: stat[key] };
                    case 'hiScore':
                        return { head: 'High Score:  ', txt: stat[key] };
                    case 'hiLinesCleared':
                        return { head: 'High Lines Cleared:  ', txt: stat[key] };
                    default:
                        return { head: key, txt: stat[key] }; // fallback for unexpected keys
                }
            });
        });

        this.stats_screen = {
            displayGamemode: this.gamemode,
            info: new Info_Screen(this.canvas_menu, this.ctx_menu, `Statistics - ${this.gamemode_arr[this.gamemode]}:`, info[this.gamemode], 5),
            menuLink: new Btn(this.canvas_menu, this.ctx_menu, 10, this.canvas_menu.height - 60, this.canvas_menu.width - 20, 50, ['Return'], this.closeStats.bind(this)),
            resetStats: new Btn(this.canvas_menu, this.ctx_menu, 10, this.canvas_menu.height - 120, this.canvas_menu.width - 20, 50, ['Clear Gamemode Stats'], () => {
                this.resetStats(this.stats_screen.displayGamemode);
            }),
            gamemode: new Btn(this.canvas_menu, this.ctx_menu, 10, this.canvas_menu.height - 180, this.canvas_menu.width - 20, 50, ['Polytris', 'Monomioes', 'Dominoes', 'Trominoes', 'Tetris', 'Pentominoes'], () => {
                this.stats_screen.displayGamemode = this.stats_screen.displayGamemode >= this.gamemode_arr.length - 1 ? 0: this.stats_screen.displayGamemode + 1;
                this.stats_screen.info.close();

                this.stats_screen.info = new Info_Screen(this.canvas_menu, this.ctx_menu, `Statistics - ${this.gamemode_arr[this.stats_screen.displayGamemode]}:`, info[this.stats_screen.displayGamemode], 5)
                this.stats_screen.info.open();

                this.stats_screen.menuLink.draw();
                this.stats_screen.resetStats.draw();
                this.stats_screen.gamemode.draw();
            }),
            listener: null,
            mouseListener: (event) => {
                this.canvas_menu.style.cursor = 'default';
                const rect = this.canvas_menu.getBoundingClientRect();
                const mouseX = event.clientX - rect.left;
                const mouseY = event.clientY - rect.top;

                if (
                    (
                        (mouseX >= this.stats_screen.menuLink.bounds.x && mouseX <= this.stats_screen.menuLink.bounds.x + this.stats_screen.menuLink.bounds.width) &&
                        (mouseY >= this.stats_screen.menuLink.bounds.y && mouseY <= this.stats_screen.menuLink.bounds.y + this.stats_screen.menuLink.bounds.height)
                    ) || (
                        (mouseX >= this.stats_screen.resetStats.bounds.x && mouseX <= this.stats_screen.resetStats.bounds.x + this.stats_screen.resetStats.bounds.width) &&
                        (mouseY >= this.stats_screen.resetStats.bounds.y && mouseY <= this.stats_screen.resetStats.bounds.y + this.stats_screen.resetStats.bounds.height)
                    ) || (
                        (mouseX >= this.stats_screen.gamemode.bounds.x && mouseX <= this.stats_screen.gamemode.bounds.x + this.stats_screen.gamemode.bounds.width) &&
                        (mouseY >= this.stats_screen.gamemode.bounds.y && mouseY <= this.stats_screen.gamemode.bounds.y + this.stats_screen.gamemode.bounds.height)
                    )
                ) {
                    this.canvas_menu.style.cursor = 'pointer';
                }
            },

            open: () => {
                this.canvas_menu.style.pointerEvents = 'auto';
                this.stats_screen.info.open();
                this.stats_screen.menuLink.init();
                this.stats_screen.resetStats.init();
                this.stats_screen.gamemode.init();

                this.stats_screen.listener = this.stats_screen.mouseListener.bind(this);
                this.canvas_menu.addEventListener('mousemove', this.stats_screen.mouseListener);
            },

            close: () => {
                this.canvas_menu.style.pointerEvents = 'none';
                this.stats_screen.info.close();
                this.stats_screen.menuLink.removeListeners();
                this.stats_screen.resetStats.removeListeners();
                this.stats_screen.gamemode.removeListeners();

                this.canvas_menu.removeEventListener('mousemove', this.stats_screen.listener);
            },

            changeDisplayGamemode() {
                
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

        this.settings_btns[0].txt = ['Sound Off', 'Sound On'];
        this.settings_btns[1].txt = ['Music Off', 'Music On'];
        this.settings_btns[2].txt = ['Dynamic FPS: Off', 'Dynamic FPS (recommended): On'];
        this.settings_btns[3].txt = ['MaxFPS: 2', 'MaxFPS: 5', 'MaxFPS: 10', 'MaxFPS: 20', 'MaxFPS: 30', 'MaxFPS: 40', 'MaxFPS: 50', 'MaxFPS: 60'];
        this.settings_btns[4].txt = ['Dynamic frame delay: Off', 'Dynamic frame delay: On'];


        const sound_rotationIndex = this.settings.sound ? 1: 0;
        const sound_rotatedArr = this.settings_btns[0].txt.slice(sound_rotationIndex).concat(this.settings_btns[0].txt.slice(0, sound_rotationIndex));
        this.settings_btns[0].txt = sound_rotatedArr;

        const music_rotationIndex = this.settings.music ? 1: 0;
        const music_rotatedArr = this.settings_btns[1].txt.slice(music_rotationIndex).concat(this.settings_btns[1].txt.slice(0, music_rotationIndex));
        this.settings_btns[1].txt = music_rotatedArr;

        const dynamicFPS_rotationIndex = this.settings.dynamicFPS ? 1: 0;
        const dynamicFPS_rotatedArr = this.settings_btns[2].txt.slice(dynamicFPS_rotationIndex).concat(this.settings_btns[2].txt.slice(0, dynamicFPS_rotationIndex));
        this.settings_btns[2].txt = dynamicFPS_rotatedArr;

        const get_maxFPS_ri = () => {
            for (let i = 0; i < this.maxFPSOptions.length; i++) {
                if (this.maxFPS === this.maxFPSOptions[i]) {
                    return i;
                }
            }
        }
        const maxFPS_rotationIndex = get_maxFPS_ri();
        const maxFPS_rotatedArr = this.settings_btns[3].txt.slice(maxFPS_rotationIndex).concat(this.settings_btns[3].txt.slice(0, maxFPS_rotationIndex));
        this.settings_btns[3].txt = maxFPS_rotatedArr;

        const dynamicDelay_rotationIndex = this.settings.dynamicDelay ? 1: 0;
        const dynamicDelay_rotatedArr = this.settings_btns[4].txt.slice(dynamicDelay_rotationIndex).concat(this.settings_btns[4].txt.slice(0, dynamicDelay_rotationIndex));
        this.settings_btns[4].txt = dynamicDelay_rotatedArr;


        this.settings_screen.init();
    }

    closeSettings() {
        this.settings_screen.close();
        this.openMenu();
    }

    sendReq(url, method, body, callback) {
        fetch(`${url}`, { //use /polytris/xyz format
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

    endGame() {
        this.renderer.endSequence(this.stats, this.saved_stats[this.gamemode], this.gamemode_arr[this.gamemode]);
        if (this.stats.fps) {
            delete this.stats.fps;
        }
        if (this.stats.lag) {
            delete this.stats.lag;
        }

        this.pauseMusic();

        if (this.settings.sound) {
            const sound_gameOver = new Audio('../sound/game_over.mp3');
            sound_gameOver.volume = 0.15;
            sound_gameOver.play();
        }
    }

    gameLoop() {
        if (this.status === "end") {
            this.endGame();
            return;
        }
    
        if (this.status === 'play') {
            this.requestNewFrame();
        }
        
        setTimeout(this.gameLoop.bind(this), this.frameFreq);
    }

    requestNewFrame() {
        // Cancel frame req if pending frame count is too high
        if (this.pendingFrameCount >= this.pendingFrameLimit) {
            this.droppedFrames.push(performance.now());
            console.warn(`Frame request cancelled. Pending frames: ${this.pendingFrameCount}`);
            return;
        }

        // Increment pending frame count
        this.pendingFrameCount++;

        // Begin performace test
        const startTime = performance.now();

        // SEND THE REQUEST
        this.sendReq(
            '../polytris/reqFrame',
            'POST',
            JSON.stringify({ id: this.id, key: this.key }),
            // RESULT:
            (data) => {
                // Calculate pending frames & performance metrics
                this.pendingFrameCount--;

                const currentTime = performance.now();
                const processingTime = currentTime - startTime;

                // Update frame log for FPS calculation
                this.frameLog.push(currentTime);

                // Warn if processing time is too high
                if (processingTime > 1000) {
                    console.warn(`Very high frame processing time: ${Math.round(processingTime)} ms per frame`);
                }

                // Calculate buffer
                let buffer = 0;
                if (this.settings.dynamicDelay) {
                    if (processingTime > 800) {
                        buffer = 0.5;
                    } else if (processingTime > 500) {
                        buffer = 0.4;
                    } else if (processingTime > 400) {
                        buffer = 0.3;
                    } else if (processingTime > 300) {
                        buffer = 0.2;
                    } else if (processingTime > 200) {
                        buffer = 0.1;
                    }
                }

                // Calculate dropped frames
                let droppedFrames_1000ms = 0;
                for (let i = this.droppedFrames.length - 1; i >= 0; i--) {
                    if (currentTime - this.droppedFrames[i] <= 1000) {
                        droppedFrames_1000ms++;
                    } else {
                        break;
                    }
                }
                for (let i = 0; i < (this.droppedFrames.length - 1) - droppedFrames_1000ms; i++) {
                    this.droppedFrames.shift();
                }

                // Calculate frame frequency
                if (this.settings.dynamicFPS) {
                    const tentative_frameFreq = processingTime * (1 + buffer); //Give x% extra time as buffer

                    if (tentative_frameFreq < (1000 / this.maxFPS)) { // if tent. frame freq is lower than the max frame freq
                        this.frameFreq = 1000 / this.maxFPS;
                    } else {
                        this.frameFreq = tentative_frameFreq;
                    }
                } else {
                    this.frameFreq = (1000 / this.maxFPS) * (1 + buffer); //Give x% extra time as buffer
                }

                // Calculate lag between req and res
                this.currentLag = Math.round(processingTime); // in ms

                // Calculate FPS by counting the frame logs in the last 1000 ms
                this.currentFPS = 0;
                for (let i = this.frameLog.length - 1; i >= 0; i--) {
                    if (currentTime - this.frameLog[i] <= 1000) {
                        this.currentFPS++;
                    } else {
                        break;
                    }
                }

                //Remove older frame logs
                for (let i = this.frameLog.length - 1; i >= 0; i--) {
                    if (currentTime - this.frameLog[i] > 2000) {
                        this.frameLog.splice(i, 1);
                    }
                }

                // Display frame
                this.displayFrame(data.frame, data.status, data.stats, data.eventLog, data.debug);
                
                // Update status
                this.status = data.status;

                // Play level up audio if level has increased
                if (!this.stats) {
                    
                } else if (data.stats.level > this.stats.level && this.settings.sound) {
                    const audio_levelUp = new Audio('../sound/level_up.mp3');
                    audio_levelUp.play();
                }

                // Update stats & saved stats
                this.stats = data.stats;
                this.updateSavedStats();
            }
        );
    }

    updateSavedStats() {
        this.saved_stats[this.gamemode].hiScore = this.saved_stats[this.gamemode].hiScore < this.stats.score ? this.stats.score: this.saved_stats[this.gamemode].hiScore;
        this.saved_stats[this.gamemode].hiLevel = this.saved_stats[this.gamemode].hiLevel < this.stats.level ? this.stats.level: this.saved_stats[this.gamemode].hiLevel;
        this.saved_stats[this.gamemode].hiLinesCleared = this.saved_stats[this.gamemode].hiLinesCleared < this.stats.linesCleared ? this.stats.linesCleared: this.saved_stats[this.gamemode].hiLinesCleared;

        localStorage.setItem('saved_stats', JSON.stringify(this.saved_stats));
    }

    displayFrame(frame, status, stats, eventLog, debug) {
        if (this.status === "pause") {
            return;
        }
        stats.fps = this.displayFPS;
        stats.lag = `${this.displayLag} ms`;
        this.renderer.displayFrame(frame, status, stats, eventLog, debug);
    }
}

export { Game };