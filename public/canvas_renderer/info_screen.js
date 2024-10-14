
class Info_Screen {
    constructor(canvas, ctx, title, info, y) {
        this.isOpen = false;
        this.canvas = canvas;
        this.ctx = ctx;
        this.width = canvas.width;
        this.height = canvas.height;
        this.info = info;
        this.y = y;
       
        this.font = {
            title: {style: 'bold', size: 20, typeface: 'IBM Plex Serif'},
            head: {style: 'bold', size: 16, typeface: 'Arial'},
            text: {style: 'normal', size: 16, typeface: 'Arial'}
        };

        this.title = title;
    }

    open() {
        if (this.isOpen) {
            return;
        }

        this.isOpen = true;

        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        //Title
        const titleX = this.canvas.width / 2;
        const titleY = this.y + this.font.title.size / 2 + 10;

        this.ctx.font = `${this.font.title.style} ${this.font.title.size}px ${this.font.title.typeface}`;
        this.ctx.fillText(this.title, titleX, titleY);

        //Seperate btns from title
        this.ctx.beginPath();
        this.ctx.moveTo(20, this.y - 10);
        this.ctx.lineTo(this.canvas.width - 20, this.y - 10);
        this.ctx.stroke();

        //Info
        this.ctx.textAlign = 'left';
        for (let i = 0; i < this.info.length; i++) {
            //Get head & txt
            const infoHead = this.info[i].head;            
            const infoTxt = this.info[i].txt;

            //Calculate txt position
            this.ctx.font = `${this.font.head.style} ${this.font.head.size}px ${this.font.head.typeface}`; //Set font to ensure accurate head length calculation
            const infoHeadLength = this.ctx.measureText(infoHead).width;

            const infoX_head = 10;
            const infoX_txt = 10 + infoHeadLength;
            const infoY = 15 + titleY + (20 + this.font.text.size / 2) * (i + 1);

            //Draw Head
            this.ctx.fillText(infoHead, infoX_head, infoY);

            //Draw body txt
            this.ctx.font = `${this.font.text.style} ${this.font.text.size}px ${this.font.text.typeface}`;
            this.ctx.fillText(infoTxt, infoX_txt, infoY);
        }
    }

    close() {
        if (!this.isOpen) {
            return;
        }

        this.isOpen = false;
        this.ctx.clearRect(0, this.y, this.width, this.height - this.y);
    }
}

export { Info_Screen };