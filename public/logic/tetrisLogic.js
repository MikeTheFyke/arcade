const canvas = document.getElementById('tetrisCanvas');
const ctx = canvas.getContext('2d');

const canvasWidth = canvas.width;
const canvasHeight = canvas.clientHeight;

const numberOfRows = 20;
const numberOfCols = 10;

const cellSize = canvasWidth / numberOfCols;
const borderSize = 0.2;

const zType = [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0]
]

const sType = [
    [0, 2, 2],
    [2, 2, 0],
    [0, 0, 0]
]

const iType = [
    [0, 3, 0, 0],
    [0, 3, 0, 0],
    [0, 3, 0, 0],
    [0, 3, 0, 0]
]

const lType = [
    [4, 0, 0],
    [4, 0, 0],
    [4, 4, 0]
]

const jType = [
    [0, 0, 5],
    [0, 0, 5],
    [0, 5, 5]
]

const oType = [
    [6, 6],
    [6, 6]
]

const tType = [
    [0, 7, 0],
    [7, 7, 7],
    [0, 0, 0]
]

const blockColors = [
    'limegreen',
    'darkorange',
    'mediumorchid',
    'dodgerblue',
    'orangered',
    'cornflowerblue',
    'tomato'
]

const blockTypes = {
    zType,
    sType,
    iType,
    lType,
    jType,
    oType,
    tType
}

const drawField = (field, ctx) => {
    field.forEach ((row, rowIndex) => {
        row.forEach ((cell, columnIndex) => {
            ctx.fillStyle = cell ? blockColors[cell - 1] : 'lightblue'
            ctx.strokeStyle = '#555'
            ctx.lineWidth = borderSize

            const args = [
                columnIndex * cellSize, rowIndex * cellSize, cellSize, cellSize
            ]
            ctx.fillRect(...args)
            ctx.strokeRect(...args)
        })
    })
}
const { requestAnimationFrame } = window;

const fps = 24;
let counterOfF = 0;
let prevTime = 0;
const timeToMoveDown = 500;

let prevPosition = { x: 0, y: 0};
let prevBlockCells = [[]];

class Block {
    constructor(cells, x, y) {
        this.cells = cells
        this.position = {x, y}
        this.isAlive = true
    }

    rotate() {
        const newCells = []
        for (let i = 0; i < this.cells.length; i++){
            newCells[i] = []
            for (let j = 0; j < this.cells.length; j++){
                newCells[i][j] = this.cells[this.cells.length - 1 - j][i]
            }
        }
        this.cells = newCells;
    }

    moveBlockByEvent(e){
        e.preventDefault();
        switch(e.key){
            case 'ArrowLeft': {
                this.position.x--
                break
            }
            case 'ArrowRight': {
                this.position.x++
                break
            }
            case 'ArrowDown': {
                if (this.position.y + this.cells.length < numberOfRows){
                    this.position.y++;
                }
                break
            }
            case 'ArrowUp': {
                this.rotate();
                break
            }
        }
    }

    findCollison(field){
        const { x, y } = this.position
        this.cells.forEach((rows, i) => {
            rows.forEach((cell, j) => {
                if (cell && ((y + i >= numberOfRows) || field [y + i][x + j])){
                    this.isAlive = false
                    return;
                }
            })
        })
    }
}

const checkCanMove = (block, field) => {
    const { cells, position } = block;
    const { x, y } = position;
    return !cells.some((rows, i) => {
        return rows.some((cells, j) => {
            if (
                (cells && x + j < 0) ||
                (cells && x + j >= numberOfCols) ||
                (cells && field[y + i][x+ j])
            ) return true;
        })
    })
    return true;
}

const updateScore = (score) => {
    const scoreElement = document.getElementById('score')
    scoreElement.innerHTML = score;
}

const render = (game, block, time) => {
    if (!block) {
        const arrOfTypes = Object.values(blockTypes)
        const blockType  = arrOfTypes[arrOfTypes.length * Math.random() | 0]
        const x          = ((numberOfCols - blockType.length) /2) | 0
        block = new Block(blockType, x, 0)
        prevPosition = { x, y: 0}
        addEventListener('keydown', (e) => block.moveBlockByEvent.bind(block)(e))
        
    }
    const { ctx, field } = game
    const { position } = block

    if (time - prevTime > 1000 / fps){
        counterOfF++
        if (counterOfF === (fps * timeToMoveDown) / 1000){
            counterOfF = 0
            if (block && block.alive){
                position.y++ ;
            } else {
                block = null;
            }
        }
    }
    prevTime = time;

    insertIntoArray(prevBlockCells, field, prevPosition.y, prevPosition.x, true);

    const canMove = checkCanMove(block, field)
    if (!canMove) {
        position.x = prevPosition.x
        block.cells = prevBlockCells
    }

    if (position.y > prevPosition.y) {
        position.y = prevPosition.y + 1
    }

    block.findCollison(field)
    if (block.isAlive){
        insertIntoArray(block.cells, field, position.y, position.x);
        drawField(field, ctx);
        prevPosition = Object.assign({}, position);
        prevBlockCells = [].concat(block.cells);
    } else if (prevPosition.y > block.cells.length - 1) {
        insertIntoArray(block.cells, field, prevPosition.y, prevPosition.x);
        game.field = findFilledRow(field);
        drawField(game.field, ctx);
        block = null;
    } else {
        insertIntoArray(block.cells, field, prevPosition.y, prevPosition.x);
        const lastBlock = block.cells.filter((row) => !row.every((cell) => !cell)).slice(prevPosition.y)
        insertIntoArray(lastBlock, field, 0, position.x);
        drawField(game.field, ctx);
        setTimeout(() => { alert('Game Over') }, 0)
        game.field = generateField(numberOfRows + 4, numberOfCols)
        updateScore(0);
        block = null;
    }


    requestAnimationFrame((time) => render(game, block, time));
}

const insertIntoArray = (childArr, parrentArr, row, col, clearMode) => {
    let i = 0;
    while (i < childArr.length){
        let j = 0;
            while (j < childArr[i].length){
                parrentArr[row + i][col + j] = !clearMode
                ? childArr[i][j]
                ? childArr[i][j]
                : parrentArr[row + i][col + j]
                : childArr[i][j]
                ? 0
                : parrentArr[row + i][col + j]
            j++;
            }
    i++;
    }
};

let score = 0;
const generateFilledRow = (field) => {
    const filteredField = field.filter((row) => row.some((cell) => (cell === 0)))
    const diff = field.length - filteredField.length;
    score += diff * 100;
    updateScore(score);
    const filledArr = generateField(diff, numberOfCols);
    return [...filledArr, ...filteredField];
}

const generateField = (rows, cols) => {
    const field = Array.from({length: rows},
        () => Array.from({length: cols}, () => 0))
        return field;
}

window.onload = () => {
    const game = {
        ctx,
        field: generateField(numberOfRows + 4, numberOfCols),
    }
 render(game)
}