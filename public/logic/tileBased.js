var ctx = null;

var tileW = 40;
var tileH = 40;

var mapW = 20;
var mapH = 20;

var currentSecond = 0;
var frameCount = 0;
var framesLastSecond = 0;
var lastFrameTime = 0;

var tileSet = null;
var tileSetURL = "./public/images/FO-TileBasedSheet3.png";
var tileSetLoaded = false;

var gameTime = 0;
var gameSpeeds = [
    {name:"Normal", mult: 1},
    {name:"Pause", mult: 0}
];
var currentSpeed = 0;

// var gameMap = [ // Tile 0 & 3 barriers, Tile 1 & 2 paths, Tile 4 water
//     //  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 
//         0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // Row 1
//         0, 2, 4, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 2, 2, 0, // Row 2
//         0, 2, 3, 4, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 2, 2, 0, // Row 3
//         0, 2, 3, 1, 4, 4, 1, 1, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 0, // Row 4
//         0, 2, 3, 1, 1, 4, 4, 1, 2, 3, 3, 2, 1, 1, 2, 1, 0, 0, 0, 0, // Row 5
//         0, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 2, 2, 2, 2, 1, 1, 1, 1, 0, // Row 6
//         0, 1, 1, 1, 1, 2, 4, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 0, // Row 7
//         0, 1, 1, 1, 1, 2, 4, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 0, // Row 8
//         0, 1, 1, 1, 1, 2, 4, 4, 4, 4, 4, 1, 1, 1, 2, 2, 2, 2, 1, 0, // Row 9
//         0, 1, 1, 1, 1, 2, 3, 2, 1, 1, 4, 1, 1, 1, 1, 3, 3, 2, 1, 0, // Row 10
//         0, 1, 2, 2, 2, 2, 1, 2, 1, 1, 4, 1, 1, 1, 1, 1, 3, 2, 1, 0, // Row 11
//         0, 1, 2, 3, 3, 2, 1, 2, 1, 1, 4, 4, 4, 4, 4, 4, 4, 2, 4, 4, // Row 12
//         0, 1, 2, 3, 3, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 0, // Row 13
//         0, 1, 2, 3, 4, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 0, 1, 2, 1, 0, // Row 14
//         0, 3, 2, 3, 4, 4, 1, 2, 2, 2, 2, 2, 2, 2, 1, 0, 1, 2, 1, 0, // Row 15
//         0, 3, 2, 3, 4, 4, 3, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 3, 0, // Row 16
//         0, 3, 2, 3, 4, 1, 3, 2, 1, 3, 1, 1, 1, 2, 1, 1, 1, 2, 3, 0, // Row 17
//         0, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 1, 1, 2, 2, 2, 2, 2, 3, 0, // Row 18
//         0, 1, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 1, 4, 0, // Row 19
//         0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0  // Row 20
// ];
var gameMap = [ // Map 07 - Tile 0 & 3 barriers, Tile 1 & 2 paths, Tile 4 water
//  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20    
	0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // Row 1
	0, 2, 4, 4, 1, 1, 1, 7, 7, 7, 1, 1, 1, 1, 1, 1, 0, 2, 2, 0, // Row 2
	0, 2, 3, 4, 4, 1, 1, 9, 1, 1, 1, 1, 1, 1, 1, 1, 0, 2, 2, 0, // Row 3
	0, 2, 3, 1, 4, 4, 1, 9, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 0, // Row 4
	0, 2, 3, 1, 1, 4, 4, 9, 2, 3, 3, 2, 1, 1, 2, 1, 0, 0, 0, 0, // Row 5
	0, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 2, 2, 2, 2, 1, 1, 1, 1, 0, // Row 6
	0, 5, 1, 1, 1, 2, 4, 1, 1, 1, 1, 6, 6, 6, 2, 1, 1, 1, 1, 0, // Row 7
	0, 5, 5, 5, 5, 2, 4, 1, 1, 1, 1, 8, 1, 1, 2, 1, 1, 1, 1, 0, // Row 8
	0, 1, 5, 1, 5, 2, 4, 4, 4, 4, 4, 8, 1, 1, 2, 2, 2, 2, 1, 0, // Row 9
	0, 1, 5, 5, 5, 2, 3, 2, 1, 1, 4, 8, 1, 1, 1, 3, 3, 2, 1, 0, // Row 10
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
    solid     : 0,
    path      : 1,
    water     : 2,
    ice       : 3,
    conveyorU : 4, // Conveyor Up
    conveyorD : 5, // Conveyor Down
    conveyorL : 6, // Conveyor Left
    conveyorR : 7, // Conveyor Right
    grass     : 8
};

var tileTypes = {
    0 : {color: "#685b48", floor:floorTypes.solid, sprite:[{x:0,   y:0, w:40, h:40}]},
    1 : {color: "#5aa457", floor:floorTypes.grass,  sprite:[{x:40,  y:0, w:40, h:40}]},
    2 : {color: "#e8bd7a", floor:floorTypes.path,  sprite:[{x:80,  y:0, w:40, h:40}]},
    3 : {color: "#286625", floor:floorTypes.solid, sprite:[{x:120, y:0, w:40, h:40}]},
    4 : {color: "#678fd9", floor:floorTypes.water, sprite:[{x:160, y:0,  w:40, h:40, d:200}, {x:200, y:0,  w:40, h:40, d:200},
                                                           {x:160, y:40, w:40, h:40, d:200}, {x:200, y:40, w:40, h:40, d:200},
                                                           {x:160, y:40, w:40, h:40, d:200}, {x:200, y:0,  w:40, h:40, d:200}
                                                           ]},
    5 : {color: "#eeeeff", floor:floorTypes.ice,       sprite:[{x:120,   y:120, w:40, h:40}]},
    6 : {color: "#cccccc", floor:floorTypes.conveyorL, sprite:[{x:  0,   y: 40, w:40, h:40, d:200}, {x: 40,   y: 40, w:40, h:40, d:200},
                                                               {x: 80,   y: 40, w:40, h:40, d:200}, {x:120,   y: 40, w:40, h:40, d:200}
                                                              ]},
    7 : {color: "#cccccc", floor:floorTypes.conveyorR, sprite:[{x: 120,   y: 80, w:40, h:40, d:200}, {x: 80,   y: 80, w:40, h:40, d:200},
                                                               {x:  40,   y: 80, w:40, h:40, d:200}, {x:  0,   y: 80, w:40, h:40, d:200}
                                                              ]},
    8 : {color: "#cccccc", floor:floorTypes.conveyorD, sprite:[{x: 160,   y:200, w:40, h:40, d:200}, {x:160,   y:160, w:40, h:40, d:200},
                                                               {x: 160,   y:120, w:40, h:40, d:200}, {x:160,   y: 80, w:40, h:40, d:200}
                                                              ]},
    9 : {color: "#cccccc", floor:floorTypes.conveyorU, sprite:[{x: 200,   y: 80, w:40, h:40, d:200}, {x:200,   y:120, w:40, h:40, d:200},
                                                               {x: 200,   y:160, w:40, h:40, d:200}, {x:200,   y:200, w:40, h:40, d:200}
                                                              ]}                                                              
};

var directions = {
    up:    0,
    right: 1,
    down:  2,
    left:  3
};

var keysDown = {
    37: false,
    38: false,
    39: false,
    40: false
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
};

var player = new Character();

function Character(){
    this.tileFrom = [1,1];
    this.tileTo =  [1,1];
    this.timeMoved = 0;
    this.dimensions = [30,30];
    this.position = [45,45]; // relative to top x coordinate of map
    
    this.delayMove = {};
    this.delayMove[floorTypes.path]      = 400;
    this.delayMove[floorTypes.grass]     = 800;
    this.delayMove[floorTypes.water]     = 2000;
    this.delayMove[floorTypes.ice]       = 300;
    this.delayMove[floorTypes.conveyorU] = 200;
    this.delayMove[floorTypes.conveyorD] = 200;
    this.delayMove[floorTypes.conveyorL] = 200;
    this.delayMove[floorTypes.conveyorR] = 200;

    this.direction = directions.up;
    this.sprites = {};
    this.sprites[directions.up]       = [{x:0, y:120, w:30, h:30}];
    this.sprites[directions.right]    = [{x:0, y:150, w:30, h:30}];
    this.sprites[directions.down]     = [{x:0, y:180, w:30, h:30}];
    this.sprites[directions.left]     = [{x:0, y:210, w:30, h:30}];
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

    var moveSpeed = this.delayMove[tileTypes[gameMap[toIndex(this.tileFrom[0], this.tileFrom[1])]].floor]; // Adjsted for different types of floor values.
    

    if ((t-this.timeMoved)>=moveSpeed){
        this.placeAt(this.tileTo[0], this.tileTo[1]);
        
        var tileFloor = tileTypes[gameMap[toIndex(this.tileFrom[0], this.tileFrom[1])]].floor; // Ice and Conveyor Movement
        
            if (tileFloor == floorTypes.ice){
                if (this.canMoveDirection(this.direction)){
                    this.moveDirection(this.direction, t);
                }
            }    
            else if (tileFloor == floorTypes.conveyorL && this.canMoveLeft()){
                this.moveLeft(t);
            } else if (tileFloor == floorTypes.conveyorR && this.canMoveRight()){
                this.moveRight(t);
            } else if (tileFloor == floorTypes.conveyorU && this.canMoveUp()){
                this.moveUp(t);
            } else if (tileFloor == floorTypes.conveyorD && this.canMoveDown()){
                this.moveDown(t);
            }

    } else {
        this.position[0] = (this.tileFrom[0] * tileW) + ((tileW - this.dimensions[0]) / 2); // X
        this.position[1] = (this.tileFrom[1] * tileH) + ((tileH - this.dimensions[1]) / 2); // Y
        if (this.tileTo[0] != this.tileFrom[0]){
            var diff = (tileW / moveSpeed) * (t - this.timeMoved);
            this.position[0] += (this.tileTo[0] < this.tileFrom[0] ? 0 - diff : diff);
        }
        if (this.tileTo[1] != this.tileFrom[1]){
            var diff = (tileH / moveSpeed) * (t - this.timeMoved);
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
    if(typeof this.delayMove[tileTypes[gameMap[toIndex(x, y)]].floor] == 'undefined') {
        return false;
    }
    return true;
};

Character.prototype.canMoveUp = function (){
    return this.canMoveTo(this.tileFrom[0], this.tileFrom[1] - 1); 
};

Character.prototype.canMoveDown = function (){
    return this.canMoveTo(this.tileFrom[0], this.tileFrom[1] + 1); 
};

Character.prototype.canMoveLeft = function (){
    return this.canMoveTo(this.tileFrom[0] - 1, this.tileFrom[1]); 
};

Character.prototype.canMoveRight = function (){
    return this.canMoveTo(this.tileFrom[0] + 1, this.tileFrom[1]); 
};

Character.prototype.canMoveDirection = function (d){
    switch (d)
    {
        case directions.up: return this.canMoveUp();
        case directions.down: return this.canMoveDown();
        case directions.left: return this.canMoveLeft();
        default : return this.canMoveRight();
    }
};

Character.prototype.moveLeft = function (t){
    this.tileTo[0] -= 1;
    this.timeMoved = t;
    this.direction = directions.left;
};

Character.prototype.moveRight = function (t){
    this.tileTo[0] += 1;
    this.timeMoved = t;
    this.direction = directions.right;
};

Character.prototype.moveUp = function (t){
    this.tileTo[1] -= 1;
    this.timeMoved = t;
    this.direction = directions.up;
}

Character.prototype.moveDown = function (t){
    this.tileTo[1] += 1;
    this.timeMoved = t;
    this.direction = directions.down;
}

Character.prototype.moveDirection = function (d,t){
    switch (d)
    {
        case directions.up: return this.moveUp(t);
        case directions.down: return this.moveDown(t);
        case directions.left: return this.moveLeft(t);
        default: return this.moveRight(t);
    }
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
        if (e.keyCode == 83){ // 'S' key to change game speed time
            currentSpeed = (currentSpeed>=(gameSpeeds.length - 1) ? 0 : currentSpeed + 1);
            console.log(currentSpeed);
        }
    });

    viewport.screen = [
        document.getElementById('tileBasedCanvas').width,
        document.getElementById('tileBasedCanvas').height
    ];

    tileSet = new Image();
    tileSet.onerror = function (){
        ctx = null;
        alert("Failed loading tileset.");
        console.log("TileSheet not found");
    };
    tileSet.onload = function() {
        tileSetLoaded = true;
    };
        tileSet.src = tileSetURL;
    
    for (x in tileTypes){
        tileTypes[x]['animated'] = tileTypes[x].sprite.length > 1 ? true : false;
        if(tileTypes[x].animated){
            var t = 0;
            for (s in tileTypes[x].sprite){
                tileTypes[x].sprite[s]['start'] = t;

                t+= tileTypes[x].sprite[s].d;
                tileTypes[x].sprite[s]['end'] = t;
            }
            tileTypes[x]['spriteDuration'] = t;
        }
    };
};

function getFrame(sprite, duration, time, animated){
    if (!animated){
        return sprite[0]; // If no animation associated with sprite load index 0 of sprite
    }
    time = time % duration;
    for (x in sprite){
        if(sprite[x].end >= time){
            return sprite[x];
        };
    };
};

function drawGame() {
    if (ctx == null) {
        return;
    }
    if (!tileSetLoaded) {
        requestAnimationFrame(drawGame);
        return;
    }

    var currentFrameTime = Date.now();
    var timeElapsed = currentFrameTime - lastFrameTime;
    gameTime += Math.floor(timeElapsed * gameSpeeds[currentSpeed].mult); // Adjusts gameSpeed by choosen speed.

     var sec = Math.floor(Date.now()/1000);
     if (sec!=currentSecond){
         currentSecond = sec;
         framesLastSecond = frameCount;
         frameCount = 1;
     } else {
         frameCount++;
     }

     if (!player.processMovement (gameTime) && gameSpeeds[currentSpeed].mult != 0){ // check if key is pressed and which way to move & moveTo Tile is moveable 1 of not 0 && isnt currently paused '0'
        if(keysDown[38] && player.canMoveUp()){
            player.moveUp(gameTime);
        } else if(keysDown[40] && player.canMoveDown()){
            player.moveDown(gameTime);
        } else if(keysDown[37] && player.canMoveLeft()){
            player.moveLeft(gameTime);
        } else if(keysDown[39] && player.canMoveRight()){
            player.moveRight(gameTime);
        }
     }

     viewport.update(player.position[0] + (player.dimensions[0]/2),
                     player.position[1] + (player.dimensions[1]/2)
                    );

    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, viewport.screen[0], viewport.screen[1]);

     for (var y = viewport.startTile[1]; y <= viewport.endTile[1]; y++){ // y corresponds to Y coordinate on map
         for (var x = viewport.startTile[0]; x <= viewport.endTile[0]; x++){ // x corresponds to X coordinate on map
            var tile = tileTypes[gameMap[toIndex(x,y)]];
            // ctx.drawImage(tileSet, tile.sprite[0].x, tile.sprite[0].y, tile.sprite[0].w, tile.sprite[0].h,
            //               viewport.offset[0] + (x*tileW), viewport.offset[1] + (y*tileH), tileW, tileH);
            var sprite = getFrame(tile.sprite, tile.spriteDuration, gameTime, tile.animated);
            ctx.drawImage(tileSet, sprite.x, sprite.y, sprite.w, sprite.h, viewport.offset[0] + (x*tileW), viewport.offset[1] + (y*tileH), tileW, tileH);
         }
     }

    //  ctx.fillStyle = "#0000ff"; // Draw Player
    //  ctx.fillRect(viewport.offset[0] + player.position[0], viewport.offset[1] + player.position[1], player.dimensions[0], player.dimensions[1]);

    var sprite = player.sprites[player.direction]; // new Draw Player with sprite sheet
    ctx.drawImage(tileSet, sprite[0].x, sprite[0].y, sprite[0].w, sprite[0].h, 
                  viewport.offset[0] + player.position[0], viewport.offset[1] + player.position[1],
                  player.dimensions[0], player.dimensions[1]);

     ctx.fillStyle = "#ff0000";
     ctx.fillText("FPS : " + framesLastSecond, 10, 20); // FPS
     ctx.fillText("Game Speed :" + gameSpeeds[currentSpeed].name, 10, 40); // Current Game Speed

     lastFrameTime = currentFrameTime;
     requestAnimationFrame(drawGame);
}