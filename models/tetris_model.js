class Game {
    constructor(id) {
        this.id = id;
        this.board = [];
        this.width = 10; //cols
        this.height = 20; //rows
        this.status = ""; //init, play, pause, end
        this.nextPolyominoId = 0;
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
        const fs = require('fs').promises;
        const path = require('path');

        try {
            const data = await fs.readFile(path.join(__dirname, '../polyominoes/tetrominoes.json'), 'utf-8');
            const polyominoes = JSON.parse(data);

            const newPolyomino = polyominoes[type - 1];
            const newPolyominoVariations = newPolyomino.pos.length;
            const newPolyominoPos = newPolyomino.pos[Math.floor(Math.random() * newPolyominoVariations)];


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

    input_up() {

    }

    input_down() {

    }

    input_lateral(offset) {
        // find if input is valid
        const potentialPos = this.deepCopy(this.getActivePolyomino());

        for (let i = 0; i < potentialPos.length; i++) {
            potentialPos[i][1] += offset;
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