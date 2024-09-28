
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
            tile_margin: 2, //default = 2
            overlay: {
                opaquePeriod: 2000,
                fadePeriod: 500
            }
        }
        this.canvas = document.querySelector('.board');
        this.ctx = this.canvas.getContext("2d");
    }

    init() {
        this.canvas.width = this.r_dimensions.width;
        this.canvas.height = this.r_dimensions.height;

        
    }

    drawTile(row, col) {
        const width = this.r_dimensions.width / this.b_dimensions.width;
        const height = this.r_dimensions.height / this.b_dimensions.height;
        const offsetWidth = col * width;
        const offsetHeight = row * height;

        this.ctx.fillRect(offsetWidth, offsetHeight, width, height);
    }

    openMenu() {
        
    }

}

const game = new Game(300, 600);

game.init();