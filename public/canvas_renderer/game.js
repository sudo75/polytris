import {Menu_Renderer} from 'https://sudo75.github.io/canvas-functions/menu_renderer.js';
import {Renderer} from './polytris_renderer.js';

class Game {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.renderer = new Renderer(width, height);
        this.canvas_menu = document.querySelector('.menu');
        this.ctx_menu = this.canvas_menu.getContext('2d');
        this.btns = [
            {txt: ['Start'], callback: this.start.bind(this)},
            {txt: ['Standard Rendering'], callback: this.useStandardRenderer.bind(this)},
            {txt: ['CC1', 'CC2', 'CC3'], callback: this.default_callback.bind(this)},
        ];
        this.menu = new Menu_Renderer('Polytris', 'Canvas Rendering (alpha)', 'v.0.4.0-dev', this.btns, width, height, this.canvas_menu);
    }
    init() {
        this.openMenu();
    }

    start() {
        console.log(this.renderer)
        
        this.closeMenu();

        this.renderer.init();
        this.renderer.start();
    }

    useStandardRenderer() {
        window.location.href = '../index.html';
    }

    default_callback() {
        console.log('Default callback: not assigned');
    }

    openMenu() {
        document.querySelector('.menu').style.opactiy = '1';

        const btns = [
            {txt: ['Start'], callback: this.start.bind(this)},
            {txt: ['Standard Rendering'], callback: this.useStandardRenderer.bind(this)},
            {txt: ['CC1', 'CC2', 'CC3'], callback: this.default_callback.bind(this)},
        ];
        const canvas_container = document.querySelector('.canvas_container');
        canvas_container.style.width = '300px';
        canvas_container.style.height = '600px';

        this.menu.init();
    }

    closeMenu() {
        this.menu.close();
    }
}

export { Game }