
import {Menu_Renderer} from 'https://sudo75.github.io/canvas-functions/menu_renderer.js';

class Game_Option_Menu {
    constructor(canvas, ctx, title, btns, width, height) {
        this.isOpen = false;
        this.canvas = canvas;
        this.ctx = ctx;
        this.width = width;
        this.height = height;
        this.btns = btns;
        this.title = title;
        this.Menu_Renderer = new Menu_Renderer(this.title, null, 'version xyz', this.btns, 300, 600, this.canvas);
    }

    open() {
        if (this.isOpen) {
            return;
        }

        this.isOpen = true;
        this.Menu_Renderer.init();
    }

    close() {
        if (!this.isOpen) {
            return;
        }

        this.isOpen = false;
        this.Menu_Renderer.close();
    }
}

export { Game_Option_Menu };