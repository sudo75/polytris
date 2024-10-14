class Board_Renderer {
    constructor(canvas, ctx, b_width, b_height, r_width, r_height) { //width, height in unit tiles
        this.canvas = canvas;
        this.ctx = ctx;
        this.b_width = b_width;
        this.b_height = b_height;
        this.r_width = r_width;
        this.r_height = r_height;

        this.tileStyle = {
            margin: 2,
            outline: {
                colour: 'black',
                weight: 2
            }
        }
        this.styleMap = {
            0: {colour: 'white'},
            1: {colour: 'blue'},
            2: {colour: 'red'},
            3: {colour: 'green'},
            4: {colour: 'yellow'},
            5: {colour: 'orange'},
            6: {colour: 'purple'},
            7: {colour: 'lightblue'},
            8: {colour: 'pink'},
            9: {colour: 'teal'},
            10: {colour: 'olive'},
            11: {colour: 'brown'},
            12: {colour: 'gold'},
            13: {colour: 'coral'},
            14: {colour: 'forestgreen'},
            15: {colour: 'lightpink'},
            16: {colour: 'lightgreen'},
            17: {colour: 'lightseagreen'},
            18: {colour: 'lightcyan'},
            63: {colour: 'grey'}
        }
    }

    render(frame) {
        for (let i = 0; i < this.b_height; i++) {
            for (let j = 0; j < this.b_width; j++) {
                if (frame[i][j] !== 0) {
                    this.ctx.fillStyle = this.styleMap[frame[i][j]].colour;
                    this.drawTile(i, j);
                }
            }
        }
    }
    
    drawTile(row, col) {
        //No margin-accounting
        const width = this.r_width / this.b_width;
        const height = this.r_height / this.b_height;
        const offsetWidth = col * width;
        const offsetHeight = row * height;
    
        //Calculate margins
        const computedOffsetWidth = offsetWidth + this.tileStyle.margin;
        const computedOffsetHeight = offsetHeight + this.tileStyle.margin;
        const computedWidth = width - this.tileStyle.margin * 2;
        const computedHeight = height - this.tileStyle.margin * 2;

        //Tile
        this.ctx.fillRect(computedOffsetWidth, computedOffsetHeight, computedWidth, computedHeight);

        //Outline
        this.ctx.strokeStyle = this.tileStyle.outline.colour;
        this.ctx.lineWidth = this.tileStyle.outline.weight;
        this.ctx.strokeRect(computedOffsetWidth, computedOffsetHeight, computedWidth, computedHeight);
    }
}

export { Board_Renderer }