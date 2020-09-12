var ctx = null;

var tileW = 40;
var tileH = 40;

var mapW = 10;
var mapH = 10;

var currentSecond = 0;
var frameCount = 0;
var framesLastSecond = 0;
var lastFrameTime = 0;

var keysDown = {
    37: false,
    38: false,
    39: false,
    40: false
};

var player = new CharacterData();

var gameMap = [ // Tile 0 barrier, Tile 1 path
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // Row 1
                0, 1, 1, 1, 0, 1, 1, 1, 1, 0, // Row 2
                0, 1, 0, 0, 0, 1, 0, 0, 0, 0, // Row 3
                0, 1, 1, 1, 1, 1, 1, 1, 1, 0, // Row 4
                0, 1, 0, 1, 0, 0, 0, 1, 1, 0, // Row 5
                0, 1, 0, 1, 0, 1, 0, 0, 1, 0, // Row 6
                0, 1, 1, 1, 1, 1, 1, 1, 1, 0, // Row 7
                0, 1, 0, 0, 0, 0, 0, 1, 0, 0, // Row 8
                0, 1, 1, 1, 0, 1, 1, 1, 1, 0, // Row 9
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0  // Row 10
];

function Character(){
    this.tileFrom = [1,1];
    this.tileTo =  [1,1];
    this.timeMoved = 0;
    this.dimensions = [30,30];
    this.position = [45,45]; // relative to top x coordinate of map
    this.delayMove = 700;
}

Character.prototype.placeAt = function (x, y){ // Character initial display coordinates
    this.tileFrom = [x,y];
    this.tileTo = [x,y];
    this.position = [((tileW*x) + ((tileW - this.dimensions[0]) / 2)),
                     ((tileH*y) + ((tileH - this.dimensions[1]) / 2))];    
}

Character.prototype.processMovement = function (t){
    if (this.tileFrom[0] == this.tileTo[0] && this.tileFrom[1] == this.tileTo[1]){
        return false;
    } 
    if ((t-this.timeMoved)>=this.delayMove){
        this.placeAt(this.tileTo[0], this.tileTo[1]);
    } else {
        this.position[0] = (this.tileFrom[0] * tileW) + ((tileW - this.dimensions[0]) / 2); // X
        this.position[1] = (this.tileFrom[1] * tileH) + ((tileH - this.dimensions[1]) / 2); // Y
        if (this.tileTo[0] != this.tileFrom[0]){
            var diff = (tileW / this.delayMove) * (t - this.timeMoved);
            this.position[0] += (this.tileTo[0] < this.tileFrom[0] ? 0 - diff : diff);
        }
        if (this.tileTo[1] != this.tileFrom[1]){
            var diff = (thisH / this.delayMove) * (t - this.timeMoved);
            this.position[1] += (this.tileTO[1] < this.tileFrom[1] ? 0 - diff : diff);
        }
        this.position[0] = Math.round(this.position[0]);
        this.position[1] = Math.round(this.position[1]);
    }
    return true;
};

function toIndex(x, y){
    return ((y * mapW) + x);
};

window.onload = function() {
    var canvas = document.getElementById('tileBasedCanvas');
    ctx = canvas.getContext('2d');
    requestAnimationFrame(drawGame);
    ctx.font = "bold 10pt sans-serif";

    window.addEventListener("keydown", function (e) {
        if (e.keyCode >= 37 && e.keyCode <= 40){
            keysDown[e.keyCode] = true;
        }
    });

    window.addEventListener("keyup", function (e){
        if (e.keyCode >= 37 && e.keyCode <= 40){
            keysDown[e.keyCode] = false;
        }
    });
};

function drawGame() {
    if (ctx == null) {
        return;
    }

    var currentFrameTime = Date.now();
    var timeElapsed = currentFrameTime - lastFrameTime;

     var sec = Math.floor(Date.now()/1000);
     if (sec!=currentSecond){
         currentSecond = sec;
         framesLastSecond = frameCount;
         frameCount = 1;
     } else {
         frameCount++;
     }

     if (!player.processMovement (currentFrameTime)){ // check if key is pressed and which way to move & moveTo Tile is moveable 1 of not 0
        if(keysDown[38] && player.tileFrom[1] > 0 && gameMap[toIndex(player.tileFrom[0], player.tileFrom[1]-1)] == 1){
            player.tileTo[1] -= 1; // Up Key / Movement
        } else if (keysDown[40] && player.tileFrom[1] < (mapH-1) && gameMap[toIndex(player.tileFrom[0], player.tileFrom[1]+1)] == 1){
            player.tileTo[1] += 1; // Down Key / Movement
        } else if(keysDown[37] && player.tileFrom[0] > 0 && gameMap[toIndex(player.tileFrom[0] - 1, player.tileFrom[1])] == 1){
            player.tileTo[0] -= 1; // Left Key / Movement
        } else if (keysDown[39] && player.tileFrom[0] < (mapW-1) && gameMap[toIndex(player.tileFrom[0] + 1, player.tileFrom[1])] == 1){
            player.tileTo[0] += 1; // Right Key / Movement
        }

        if (player.tileFrom[0] != player.tileTo[0] || player.tileFrom[1] != player.tileTo[1]){
            player.timeMoved = currentFrameTime;
        }
     }

     for (var y = 0; y < mapH; y++){ // y corresponds to Y coordinate on map
         for (var x = 0; x < mapW; x++){ // x corresponds to X coordinate on map
             switch(gameMap[((y*mapW)+x)]){
                 case 0: ctx.fillStyle = "#A0522D";
                    break;
                default: ctx.fillStyle = "#ccffcc";
             }
             ctx.fillRect(x*tileW, y*tileH, tileW, tileH);

         }
     }
     ctx.fillStyle = "#ff0000";
     ctx.fillText("FPS : " + framesLastSecond, 10, 20);

     requestAnimationFrame(drawGame);
}