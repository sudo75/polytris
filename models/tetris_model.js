const { clear } = require('console');
const fs = require('fs');
const path = require('path');

class Game {
    constructor(id) {
        this.id = id;
        this.board = [];
        this.width = 10; //cols
        this.height = 20; //rows
        this.status = ""; //init, play, pause, end
        this.currentPol = {id: 0, type: null, pivotIndex: null, pivotPoint: null};
    }

    defaultTile() {
        return {type: 0, pol_id: null};
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

    spawnNewPolyomino() {
        const type = Math.ceil(Math.random() * 7);
        //const type = 6; //for debug
        this.currentPol.type = type;

        try {
            const data = fs.readFileSync(path.join(__dirname, '../polyominoes/tetrominoes.json'), 'utf-8');
            const polyominoes = JSON.parse(data);

            const newPolyomino = polyominoes[type - 1];

            const variation = Math.floor(Math.random() * 4);

            let newPolyominoPos = newPolyomino.pos;

            if (newPolyominoPos) {
                if (newPolyomino.pivotPoint) {
                    for (let i = 0; i < variation; i++) { //Rotate polyomino
                        newPolyominoPos = this.getRotatedPolyomino(newPolyominoPos, newPolyomino.pivotPoint);
                    }
                }
                
                
                newPolyominoPos.forEach(pos => { // If the space is taken, end game
                    const row = pos[0];
                    const col = pos[1];
                    
                    if (this.board[row][col].type !== 0) {
                        this.status = "end";
                        return;
                    }
                });
                newPolyominoPos.forEach(pos => { // Place the polyomino and gve it an id
                    const row = pos[0];
                    const col = pos[1];
                    
                    this.board[row][col].type = type;
                    this.board[row][col].pol_id = this.currentPol.id + 1;
                });
                this.currentPol.pivotPoint = newPolyomino.pivotPoint;
                this.currentPol.id++;
    
            } else {
                console.error('Invalid Polyomino type');
            }
    
        } catch (error) {
            console.error('Error reading Polyomino data:', error);
        }
    }
    
    getActivePolyomino() {
        let activePolyomino = [];
        for (let i = this.height - 1; i >= 0; i--) {
            for (let j = this.width - 1; j >= 0; j--) {
                if (this.board[i][j].pol_id === this.currentPol.id) {
                    activePolyomino.push([i, j]);
                }
            }
        }
        return activePolyomino;
    }

    pushFrame() {
        //Spawn new polyomino
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

        if (canMove(this.board, this.height, this.currentPol.id)) {
            activePolyomino.forEach(cell => {
                const row = cell[0];
                const col = cell[1];

                this.board[row + 1][col] = this.board[row][col];
                this.board[row][col] = {type: 0, pol_id: null};
            });
            if (this.currentPol.pivotPoint) {
                this.currentPol.pivotPoint[0]++;
            }
        } else {
            this.clearLine();
            this.spawnNewPolyomino();
        }

        const frame_preClear = this.deepCopy(this.getBoard_typeOnly());
    
        const frame = this.getBoard_typeOnly();
        const status = this.status;
        
        //Debug
        const debug = {pivotPoint: this.currentPol.pivotPoint};

        return { frame, frame_preClear, status, debug };
    }

    clearLine() {
        let rowsCleared = [];
        for (let i = this.height - 1; i >= 0; i--) {
            if (this.board[i].every(cell => cell.type !== 0)) {
                for (let j = this.width - 1; j >= 0; j--) {
                    this.board[i][j] = this.defaultTile();
                }
                rowsCleared.push(i);
            }
        }

        for (let i = 0; i < rowsCleared.length; i++) {
            this.board.splice(rowsCleared[i], 1);
        }
        for (let i = 0; i < rowsCleared.length; i++) {
            this.board.unshift(this.createEmptyRow());
        }
    }

    createEmptyRow() {
        let row = [];
        for (let i = 0; i < this.width; i++) {
            row.push(this.defaultTile());
        }
        return row;
    }

    boardIsEmpty() {
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                if (this.board[i][j].type !== 0) {
                    return false;
                }
            }
        }
        return true;
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

    getRotatedPolyomino(polyomino, pivotPoint) {
        const pivot = {
            row: pivotPoint[0],
            col: pivotPoint[1]
        }

        let rotatedPolyomino = [];

        for (let j = 0; j < polyomino.length; j++) {
            const row = polyomino[j][0];
            const col = polyomino[j][1];
        
            //position in relation to pivot point
            const row_offset = row - pivot.row; 
            const col_offset = col - pivot.col;

            const new_row_offset = col_offset;
            const new_col_offset = row_offset * -1;

            const new_row = pivot.row + new_row_offset;
            const new_col = pivot.col + new_col_offset;

            rotatedPolyomino.push([new_row, new_col]);
        }

        return rotatedPolyomino;
    }

    input_up() {
        if (this.currentPol.pivotPoint) {
            const activePolyomino = this.getActivePolyomino();

            const potentialPos = this.getRotatedPolyomino(activePolyomino, this.currentPol.pivotPoint);
    
            if (!this.isValidMove(potentialPos)) {
                return;
            }
    
            // Remove current polyomino
            for (let i = 0; i < this.height; i++) {
                for (let j = 0; j < this.width; j++) {
                    if (this.board[i][j].pol_id === this.currentPol.id) {
                        this.board[i][j] = { type: 0, pol_id: null };
                    }
                }
            }
    
            // Add new polyomino
            const type = this.currentPol.type;
            const pol_id = this.currentPol.id;
    
            potentialPos.forEach(([row, col]) => {
                this.board[row][col] = { type: type, pol_id: pol_id };
            });
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

        if (this.currentPol.pivotPoint) {
            switch (direction) {
                case "down":
                    this.currentPol.pivotPoint[0]++;
                    break;
                case "left":
                    this.currentPol.pivotPoint[1]--;
                    break;
                case "right":
                    this.currentPol.pivotPoint[1]++;
                    break;
            }
        }
    }

    isValidMove(polyminoPos) { //[[r, c], [r, c]...]

        for (let i = 0; i < polyminoPos.length; i++) {
            const row = polyminoPos[i][0];
            const col = polyminoPos[i][1];
            if (row < 0 || row >= this.height || col < 0 || col >= this.width) {
                return false;
            } else if (this.board[row][col].type !== 0 && this.board[row][col].pol_id !== this.currentPol.id) {
                return false;
            }
        }
        return true;
    }

    getFrame() {
        const frame = this.getBoard_typeOnly();
        const debug = {pivotPoint: this.currentPol.pivotPoint};
        return { frame: frame, debug: debug };
    }
}


module.exports = Game;