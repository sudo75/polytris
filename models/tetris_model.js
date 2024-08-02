
const fs = require('fs').promises;
const path = require('path');

class Game {
    constructor(id) {
        this.id = id;
        this.board = [];
        this.width = 10; //cols
        this.height = 20; //rows
        this.status = ""; //init, play, pause, end
        this.nextPolyominoId = 0;
        this.currentPol = {id: 0, variation: null, type: null};
    }

    initBoard() {
        this.status = "init";
        let board = [];
        for (let i = 0; i < this.height; i++) {
            let row = [];
            for (let j = 0; j < this.width; j++) {
                row.push({type: 0, pol_id: null});
            }
            board.push(row);
        }
        return board;
    }

    start(width, height) {
        this.board = this.initBoard(width, height);
        this.spawnNewPolyomino();
        this.status = "play";
    }

    async spawnNewPolyomino() {
        const type = Math.ceil(Math.random() * 7);
        //const type = 1;
        this.currentPol.type = type;

        try {
            const data = await fs.readFile(path.join(__dirname, '../polyominoes/tetrominoes.json'), 'utf-8');
            const polyominoes = JSON.parse(data);

            const newPolyomino = polyominoes[type - 1];
            const allVariations = newPolyomino.pos.length;

            const newPolyominoVariation = Math.floor(Math.random() * allVariations);
            this.currentPol.variation = newPolyominoVariation;

            const newPolyominoPos = newPolyomino.pos[newPolyominoVariation];


            if (newPolyominoPos) {
                newPolyominoPos.forEach(pos => {
                    const row = pos[0];
                    const col = pos[1];
                    
                    if (this.board[row][col].type !== 0) {
                        this.status = "end";
                        return;
                    }
                });
                newPolyominoPos.forEach(pos => {
                    const row = pos[0];
                    const col = pos[1];
                    
                    this.board[row][col].type = type;
                    this.board[row][col].pol_id = this.nextPolyominoId;
                });
                this.nextPolyominoId++;
                this.currentPol.id++;
                
            } else {
                console.error('Invalid Polyomino type');
            }
        } catch (error) {
            console.error('Error reading Polyomino data:', error);
        }
    }
    
    getActivePolyomino() {
        let activePolyomino = []
        for (let i = this.height - 1; i >= 0; i--) {
            for (let j = this.width - 1; j >= 0; j--) {
                if (this.board[i][j].pol_id === this.nextPolyominoId - 1) {
                    activePolyomino.push([i, j]);
                }
            }
        }
        return activePolyomino;
    }

    pushFrame() {
        let activePolyomino = this.getActivePolyomino();

        function canMove(board, height, currentPolId) {
            for (let i = 0; i < activePolyomino.length; i++) {
                const cell = activePolyomino[i];
                if (cell[0] + 1 < height) {
                    if (board[cell[0] + 1][cell[1]].type !== 0) {
                        if (board[cell[0] + 1][cell[1]].pol_id !== currentPolId) {
                            return false;
                        }
                    }
                } else {
                    return false;
                }
            }
            return true;
        }

        if (canMove(this.board, this.height, this.nextPolyominoId - 1)) {
            activePolyomino.forEach(cell => {
                const row = cell[0];
                const col = cell[1];

                this.board[row + 1][col] = this.board[row][col];
                this.board[row][col] = {type: 0, pol_id: null};
            });
        } else {
            this.spawnNewPolyomino();
        }

        const frame_preClear = this.deepCopy(this.getBoard_typeOnly());

        //clear line

        for (let i = this.height - 1; i >= 0; i--) {
            if (this.board[i].every(cell => cell.type !== 0)) {
                for (let j = this.width - 1; j >= 0; j--) {
                    this.board[i][j].type = 0;
                }
            }
        }

        const frame = this.getBoard_typeOnly();
        const status = this.status;
        
        return { frame, frame_preClear, status };
    }

    getBoard_typeOnly() {
        let board = [];
        for (let i = 0; i < this.height; i++) {
            let row = [];
            for (let j = 0; j < this.width; j++) {
                row.push(this.board[i][j].type);
            }
            board.push(row);
        }

        return board;
    }

    deepCopy(data) {
        return JSON.parse(JSON.stringify(data));
    }

    async getRotatedPolyomino() {
        try {
            const data = await fs.readFile(path.join(__dirname, '../polyominoes/tetrominoes.json'), 'utf-8');
            const polyominoes = JSON.parse(data);
            //polyominoes[type].pos[variation];

            let translation = {row: null, col: null};
            const activePolyomino = this.getActivePolyomino();

            const row = activePolyomino[0][0];
            const col = activePolyomino[0][1];

            const og_row = polyominoes[this.currentPol.type].pos[this.currentPol.variation][0][0];
            const og_col = polyominoes[this.currentPol.type].pos[this.currentPol.variation][0][1];

            translation.row = row - og_row;
            translation.col = col - og_col;

            let rotatedPolyomino;
            if ( this.currentPol.variation >= polyominoes[this.currentPol.type].pos.length - 1) {
                rotatedPolyomino = polyominoes[this.currentPol.type].pos[0];
            } else {
                rotatedPolyomino = polyominoes[this.currentPol.type].pos[this.currentPol.variation + 1];
                this.currentPol.variation++;
            }

            let newPolyominoPos = [];
            for (let i = 0; i < activePolyomino.length; i++) {
                const tile = rotatedPolyomino[i];
                newPolyominoPos.push([tile[0] + translation.row, tile[1] + translation.col]);
            }

            return newPolyominoPos;
       } catch (error) {
            console.error('Error reading Polyomino data:', error);
       }
    }

    async input_up() {
        const activePolyomino = this.getActivePolyomino();

        const potentialPos = await this.getRotatedPolyomino();

        if (!this.isValidMove(potentialPos)) {
            return;
        }

        const type = this.board[activePolyomino[0][0]][activePolyomino[0][1]].type;
        const pol_id = this.board[activePolyomino[0][0]][activePolyomino[0][1]].pol_id;

        //remove current polyomino & add new polyomino
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                if (this.board[i][j].pol_id === this.currentPol.id) {
                    this.board[i][j] = {type: 0, pol_id: null};
                }
                for (let k = 0; k < potentialPos.length; k++) {
                    if (potentialPos[k][0] === i && potentialPos[k][1] === j) {
                        
                        this.board[i][j] = {type: type, pol_id: pol_id};
                    }
                }
            }
        }

    }

    input_down() {
        this.input_move("down");
    }

    input_left() {
        this.input_move("left");
    }

    input_right() {
        this.input_move("right");
    }

    input_move(direction) {
        // find if input is valid
        const potentialPos = this.deepCopy(this.getActivePolyomino());

        for (let i = 0; i < potentialPos.length; i++) {
            switch (direction) {
                case "down":
                    potentialPos[i][0] += 1;
                    break;
                case "left":
                    potentialPos[i][1] -= 1;
                    break;
                case "right":
                    potentialPos[i][1] += 1;
                    break;
            }
        }

        if (!this.isValidMove(potentialPos)) {
            return;
        }

        // move tetromino if valid

        const activePolyomino = this.getActivePolyomino();

        const type = this.board[activePolyomino[0][0]][activePolyomino[0][1]].type;
        const pol_id = this.board[activePolyomino[0][0]][activePolyomino[0][1]].pol_id;

        for (let i = 0; i < activePolyomino.length; i++) {
            this.board[activePolyomino[i][0]][activePolyomino[i][1]] = {type: 0, pol_id: null};
        }
        for (let i = 0; i < potentialPos.length; i++) {
            this.board[potentialPos[i][0]][potentialPos[i][1]] = {type: type, pol_id: pol_id};
        }
    }

    isValidMove(polyminoPos) { //[[r, c], [r, c]...]

        for (let i = 0; i < polyminoPos.length; i++) {
            const row = polyminoPos[i][0];
            const col = polyminoPos[i][1];
            if (row < 0 || row >= this.height || col < 0 || col >= this.width) {
                return false;
            } else if (this.board[row][col].type !== 0 && this.board[row][col].pol_id !== this.nextPolyominoId - 1) {
                return false;
            }
        }
        return true;
    }

    getFrame() {
        const frame = this.getBoard_typeOnly();
        return frame;
    }
}


module.exports = Game;