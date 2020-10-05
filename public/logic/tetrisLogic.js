const canvas = document.getElementById('tetrisCanvas');
const ctx = canvas.getContext('2d');

const canvasWidth = canvas.width;
const canvasHeight = canvas.clientHeight;

const numberOfRows = 20;
const numberOfCols = 10;

const cellSize = canvasWidth / numberOfCols;
const borderSize = 0.2;

class  Block {
    constructor(cells, x, y) {
        this.cells = cells
        this.position = {x, y}
        this.isAlive = true
    }
}

const render = (game, block, time) => {

}

const generateField = (rows, cols) => {
    const field = Array.from({length: rows},
        () => Array.from({length: cols}, () => 0))
}

window.onload = () => {
    const game = {
        ctx,
        field: generateField(numberOfRows + 4, numberOfCols),
    }
 render(game)
}