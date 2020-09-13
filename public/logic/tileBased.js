var ctx = null;

var tileW = 40;
var tileH = 40;

var mapW = 20;
var mapH = 20;

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

var player = new Character();

var gameMap = [ // Tile 0 barrier, Tile 1 path, Tile 2 water
//  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 
	0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // Row 1
	0, 2, 4, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 2, 2, 0, // Row 2
	0, 2, 3, 4, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 2, 2, 0, // Row 3
	0, 2, 3, 1, 4, 4, 1, 1, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 0, // Row 4
	0, 2, 3, 1, 1, 4, 4, 1, 2, 3, 3, 2, 1, 1, 2, 1, 0, 0, 0, 0, // Row 5
	0, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 2, 2, 2, 2, 1, 1, 1, 1, 0, // Row 6
	0, 1, 1, 1, 1, 2, 4, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 0, // Row 7
	0, 1, 1, 1, 1, 2, 4, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 0, // Row 8
	0, 1, 1, 1, 1, 2, 4, 4, 4, 4, 4, 1, 1, 1, 2, 2, 2, 2, 1, 0, // Row 9
	0, 1, 1, 1, 1, 2, 3, 2, 1, 1, 4, 1, 1, 1, 1, 3, 3, 2, 1, 0, // Row 10
	0, 1, 2, 2, 2, 2, 1, 2, 1, 1, 4, 1, 1, 1, 1, 1, 3, 2, 1, 0, // Row 11
	0, 1, 2, 3, 3, 2, 1, 2, 1, 1, 4, 4, 4, 4, 4, 4, 4, 2, 4, 4, // Row 12
	0, 1, 2, 3, 3, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 0, // Row 13
	0, 1, 2, 3, 4, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 0, 1, 2, 1, 0, // Row 14
	0, 3, 2, 3, 4, 4, 1, 2, 2, 2, 2, 2, 2, 2, 1, 0, 1, 2, 1, 0, // Row 15
	0, 3, 2, 3, 4, 4, 3, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 3, 0, // Row 16
	0, 3, 2, 3, 4, 1, 3, 2, 1, 3, 1, 1, 1, 2, 1, 1, 1, 2, 3, 0, // Row 17
	0, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 1, 1, 2, 2, 2, 2, 2, 3, 0, // Row 18
	0, 1, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 1, 4, 0, // Row 19
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0  // Row 20
];

var floorTypes = {
    solid : 0,
    path  : 1,
    water : 2
};

var tileTypes = {
    0 : {color: "#685b48", floor:floorTypes.solid},
    1 : {color: "#5aa457", floor:floorTypes.path},
    2 : {color: "#e8bd7a", floor:floorTypes.path},
    3 : {color: "#286625", floor:floorTypes.solid},
    4 : {color: "#678fd9", floor:floorTypes.water}
};

var viewport = { // This Object will help to decide what will be viewable to the player
    screen : [0,0],
    startTile : [0,0],
    endTile : [0,0],
    offset: [0,0],
    update : function(px, py){
        this.offset[0] = Math.floor((this.screen[0]/2) - px);
        this.offset[1] = Math.floor((this.screen[1]/2) - py);

        var tile = [ // dead center of viewing tileset
            Math.floor(px / tileW),
            Math.floor(py / tileH)
        ];
        this.startTile[0] = tile[0] - 1 - Math.ceil((this.screen[0]/2) / tileW);
        this.startTile[1] = tile[1] - 1 - Math.ceil((this.screen[1]/2) / tileH);
        
        if(this.startTile[0] < 0) {
            this.startTile[0] = 0;
        }
        if(this.startTile[1] < 0) {
            this.startTile[1] = 0;
        }
        this.endTile[0] = tile[0] + 1 + Math.ceil((this.screen[0]/2)/ tileW);
        this.endTile[1] = tile[1] + 1 + Math.ceil((this.screen[1]/2)/ tileH);

        if(this.endTile[0] >= mapW) {
            this.endTile[0] = mapW - 1;
        }
        if(this.endTile[1] >= mapH) {
            this.endTile[1] = mapH - 1;
        }
    }
}

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
            var diff = (tileH / this.delayMove) * (t - this.timeMoved);
            this.position[1] += (this.tileTo[1] < this.tileFrom[1] ? 0 - diff : diff);
        }
        this.position[0] = Math.round(this.position[0]);
        this.position[1] = Math.round(this.position[1]);
    }
    return true;
};

Character.prototype.canMoveTo = function (x, y){
    if (x < 0 || x >= mapW || y < 0 || y >= mapH ) {
        return false;
    }
    if (tileTypes[gameMap[toIndex(x, y)]].floor != floorTypes.path) {
        return false;
    }
    return true;
}

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

    viewport.screen = [
        document.getElementById('tileBasedCanvas').width,
        document.getElementById('tileBasedCanvas').height
    ];

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

     viewport.update(player.position[0] + (player.dimensions[0]/2),
                     player.position[1] + (player.dimensions[1]/2)
                    );

    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, viewport.screen[0], viewport.screen[1]);

     for (var y = viewport.startTile[1]; y <= viewport.endTile[1]; y++){ // y corresponds to Y coordinate on map
         for (var x = viewport.startTile[0]; x <= viewport.endTile[0]; x++){ // x corresponds to X coordinate on map
             switch(gameMap[((y*mapW)+x)]){
                 case 0: ctx.fillStyle = "#A0522D";
                    break;
                default: ctx.fillStyle = "#ccffcc";
             }
             ctx.fillRect(viewport.offset[0] + x*tileW, viewport.offset[1] + y*tileH, tileW, tileH);
         }
     }

     ctx.fillStyle = "#0000ff"; // Draw Player
     ctx.fillRect(viewport.offset[0] + player.position[0], viewport.offset[1] + player.position[1], player.dimensions[0], player.dimensions[1]);

     ctx.fillStyle = "#ff0000";
     ctx.fillText("FPS : " + framesLastSecond, 10, 20);

     lastFrameTime = currentFrameTime;
     requestAnimationFrame(drawGame);
}