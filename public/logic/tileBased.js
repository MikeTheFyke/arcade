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
var tileSetURL = "./public/images/FO-TileBasedSheet6.png";
var tileSetLoaded = false;

var gameTime = 0;
var gameSpeeds = [
    {name:"Normal", mult: 1},
    // {name:"Slow", mult: 0.3},
    // {name:"Fast", mult: 3},
    {name:"Pause", mult: 0}
];
var currentSpeed = 0;

function Sprite(data){
    this.animated   = data.length > 1;
    this.frameCount = data.length;
    this.duration   = 0;
    this.loop       = true;

    if (data.length > 1){
        for (var i in data){
            if(typeof data[i].d == 'undefined'){
                data[i].d = 100;
            }
            this.duration += data[i].d;

            if (typeof data[i].loop != 'undefined'){
                this.loop = data[i].loop ? true : false;
            }
        }
    }
    this.frames = data;
}

Sprite.prototype.draw = function(t, x, y){
    var frameIdx = 0;

    if (!this.loop && this.animated && t >= this.duration){
        frameIdx = (this.frames.length - 1);
    } else if (this.animated){
        t = t % this.duration;
        var totalD = 0;

        for (var i in this.frames){
            totalD += this.frames[i].d;
            frameIdx = i;

            if (t <= totalD){
                break;
            }
        }
    }
    var offset = (typeof this.frames[frameIdx].offset =='undefined' ? [0,0] : this.frames[frameIdx].offset);

    ctx.drawImage(tileSet, this.frames[frameIdx].x, this.frames[frameIdx].y, this.frames[frameIdx].w, this.frames[frameIdx].h,
                  x + offset[0], y + offset[1], this.frames[frameIdx].w, this.frames[frameIdx].h);
};

var itemTypes = {
    1 : {
        name     : "Star",
        maxStack : 2,
        sprite   : new Sprite ([{x:120, y:160, w:40, h:40}]),
        offset   : [0,0] // setting where item will be placed compared to the top x,y corordinate of the mapTileSet
    }
};

function Stack(id, qty) { // Created for itemTypes
    this.type = id;
    this.qty  = qty;
};

function Inventory(s) {  // Created for itemTypes
    this.spaces = s;
    this.stacks = [];
};

Inventory.prototype.addItems = function (id, qty) {
    for (var i = 0; i < this.spaces; i++){
        if (this.stacks.length <= i){
            var maxHere = (qty > itemTypes[id].maxStack ? itemtypes[id].maxStack : qty);
            this.stacks.push(new Stack(id, maxHere));
            qty -= maxHere;
        } else if (this.stacks[i].type == id && this.stacks[i].qty < itemTypes[id].maxStack){
            var maxHere = (itemTypes[id].maxStack - this.stacks[i].qty);
            if (maxHere > qty){
                maxHere = qty;
            }
            this.stacks[i].qty += maxHere;
            qty -= maxHere;
        }
        if (qty == 0){
            return 0;
        }
    }
    return qty;
};

function PlacedItemStack (id, qty){
    this.type = id;
    this.qty  = qty;
    this.x    = 0;
    this.y    = 0;
};

PlacedItemStack.prototype.placeAt = function (nx, ny){
    if (mapTileData.map[toIndex(this.x, this.y)].itemStack == this){
        mapTileData.map[toIndex(this.x, this.y)].itemStack = null;
    }
    this.x = nx;
    this.y = ny;

    mapTileData.map[toIndex(nx, ny)].itemStack = this;
};

var objectCollision = { // Adding objects to map (crate and tree)
    none    : 0,
    solid   : 1
};

var objectTypes = {
    1 : {
        name     : "Box",
        sprite   : new Sprite ([{x:240, y:80, w:40, h:40}]),
        offset   : [0,0],
        collision : objectCollision.solid,
        zIndex   : 1
    },
    2 : {
        name     : "Broken Box",
        sprite   : new Sprite ([{x:240, y:120, w:40, h:40}]),
        offset   : [0,0],
        collision : objectCollision.none,
        zIndex   : 1
    },
    3 : {
        name     : "Tree Top",
        sprite   : new Sprite ([{x:280, y:0, w:80, h:80}]),
        offset   : [-20,-20],
        collision : objectCollision.none,
        zIndex   : 3
    }
};

function MapObject(nt){
    this.x    = 0;
    this.y    = 0;
    this.type = nt;
}

MapObject.prototype.placeAt = function (nx, ny){
    if (mapTileData.map[toIndex(this.x, this.y)].object == this){ // removes instance of object if already been placed
        mapTileData.map[toIndex(this.x, this.y)].object = null;
    }
    this.x  = nx;
    this.y  = ny;

    mapTileData.map[toIndex(nx, ny)].object = this;
};

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
// var gameMap = [ // Map 07 - Tile 0 & 3 barriers, Tile 1 & 2 paths, Tile 4 water
// //  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20    
// 	0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // Row 1
// 	0, 2, 4, 4, 1, 1, 1, 7, 7, 7, 1, 1, 1, 1, 1, 1, 0, 2, 2, 0, // Row 2
// 	0, 2, 3, 4, 4, 1, 1, 9, 1, 1, 1, 1, 1, 1, 1, 1, 0, 2, 2, 0, // Row 3
// 	0, 2, 3, 1, 4, 4, 1, 9, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 0, // Row 4
// 	0, 2, 3, 1, 1, 4, 4, 9, 2, 3, 3, 2, 1, 1, 2, 1, 0, 0, 0, 0, // Row 5
// 	0, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 2, 2, 2, 2, 1, 1, 1, 1, 0, // Row 6
// 	0, 5, 1, 1, 1, 2, 4, 1, 1, 1, 1, 6, 6, 6, 2, 1, 1, 1, 1, 0, // Row 7
// 	0, 5, 5, 5, 5, 2, 4, 1, 1, 1, 1, 8, 1, 1, 2, 1, 1, 1, 1, 0, // Row 8
// 	0, 1, 5, 1, 5, 2, 4, 4, 4, 4, 4, 8, 1, 1, 2, 2, 2, 2, 1, 0, // Row 9
// 	0, 1, 5, 5, 5, 2, 3, 2, 1, 1, 4, 8, 1, 1, 1, 3, 3, 2, 1, 0, // Row 10
// 	0, 1, 2, 2, 2, 2, 1, 2, 1, 1, 4, 1, 1, 1, 1, 1, 3, 2, 1, 0, // Row 11
// 	0, 1, 2, 3, 3, 2, 1, 2, 1, 1, 4, 4, 4, 4, 4, 4, 4, 2, 4, 4, // Row 12
// 	0, 1, 2, 3, 3, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 0, // Row 13
// 	0, 1, 2, 3, 4, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 0, 1, 2, 1, 0, // Row 14
// 	0, 3, 2, 3, 4, 4, 1, 2, 2, 2, 2, 2, 2, 2, 1, 0, 1, 2, 1, 0, // Row 15
// 	0, 3, 2, 3, 4, 4, 3, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 3, 0, // Row 16
// 	0, 3, 2, 3, 4, 1, 3, 2, 1, 3, 1, 1, 1, 2, 1, 1, 1, 2, 3, 0, // Row 17
// 	0, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 1, 1, 2, 2, 2, 2, 2, 3, 0, // Row 18
// 	0, 1, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 1, 4, 0, // Row 19
// 	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0  // Row 20
// ];

// var gameMap = [// Map 10 - Tile 0 & 3 barriers, Tile 1 & 2 paths, Tile 4 water
// //  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20
// 	0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // Row 1
// 	0, 2, 1, 2, 4, 2, 1, 7, 7, 7, 1, 1, 1, 1, 1, 1, 0, 2, 2, 0, // Row 2
// 	0, 2, 1, 0, 4, 0, 1, 9, 1, 1, 1, 1, 1, 1, 1, 1, 0, 2, 2, 0, // Row 3
// 	0, 2, 1, 1, 4, 1, 1, 9, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 0, // Row 4
// 	0, 2, 1, 1, 4, 1, 1, 9, 2, 3, 3, 2, 1, 1, 2, 1, 0, 0, 0, 0, // Row 5
// 	0, 2, 2, 2, 4, 2, 2, 2, 2, 3, 3, 2, 2, 2, 2, 1, 1, 1, 1, 0, // Row 6
// 	0, 2, 1, 1, 4, 2, 4, 1, 1, 1, 1, 6, 6, 6, 2, 1, 1, 1, 1, 0, // Row 7
// 	4, 4, 4, 4, 4, 2, 4, 1, 1, 1, 1, 8, 1, 1, 2, 1, 1, 1, 1, 0, // Row 8
// 	0, 2, 5, 1, 5, 2, 4, 4, 4, 4, 4, 8, 1, 1, 2, 2, 2, 2, 1, 0, // Row 9
// 	0, 1, 5, 5, 5, 2, 3, 2, 1, 1, 4, 8, 1, 1, 1, 3, 3, 2, 1, 0, // Row 10
// 	0, 1, 2, 2, 2, 2, 1, 2, 1, 1, 4, 1, 1, 1, 1, 1, 3, 2, 1, 0, // Row 11
// 	0, 1, 2, 3, 3, 2, 1, 2, 1, 1, 4, 4, 4, 4, 4, 4, 4, 2, 4, 4, // Row 12
// 	0, 1, 2, 3, 3, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 0, // Row 13
// 	0, 1, 2, 3, 4, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 0, 1, 2, 1, 0, // Row 14
// 	0, 3, 2, 3, 4, 4, 1, 2, 2, 2, 2, 2, 2, 2, 1, 0, 1, 2, 1, 0, // Row 15
// 	0, 3, 2, 3, 4, 4, 3, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 3, 0, // Row 16
// 	0, 3, 2, 3, 4, 1, 3, 2, 1, 3, 1, 1, 1, 2, 1, 1, 1, 2, 3, 0, // Row 17
// 	0, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 1, 1, 2, 2, 2, 2, 2, 3, 0, // Row 18
// 	0, 1, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 1, 4, 0, // Row 19
// 	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0  // Row 20
// ];

var gameMap = [ // Map 11 - Tile 0 & 3 barriers, Tile 1 & 2 paths, Tile 4 water
//  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20    
	0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // Row 1
	0, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, // Row 2
	0, 2, 2, 2, 1, 1, 1, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, // Row 3
	0, 1, 1, 2, 1, 0, 0, 0, 0, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, // Row 4
	0, 1, 1, 2, 1, 0, 2, 2, 0, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, // Row 5
	0, 1, 1, 2, 1, 0, 2, 2, 0, 4, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, // Row 6
	0, 1, 1, 2, 2, 2, 2, 2, 0, 4, 4, 4, 1, 1, 1, 0, 2, 2, 2, 0, // Row 7
	0, 1, 1, 2, 1, 0, 2, 2, 0, 1, 1, 4, 1, 1, 1, 0, 2, 2, 2, 0, // Row 8
	0, 1, 1, 2, 1, 0, 2, 2, 0, 1, 1, 4, 1, 1, 1, 0, 2, 2, 2, 0, // Row 9
	0, 1, 1, 2, 1, 0, 0, 0, 0, 1, 1, 4, 1, 1, 0, 0, 0, 2, 0, 0, // Row 10
	0, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 0, 2, 2, 2, 2, 0, // Row 11
	0, 1, 1, 2, 2, 2, 2, 2, 2, 1, 4, 4, 1, 1, 0, 2, 2, 2, 2, 0, // Row 12
	0, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, // Row 13
	0, 1, 1, 1, 1, 1, 1, 1, 1, 4, 4, 1, 1, 1, 0, 2, 2, 2, 2, 0, // Row 14
	0, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 1, 1, 0, 2, 2, 2, 2, 0, // Row 15
	0, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, // Row 16
	0, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, // Row 17
	0, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, // Row 18
	0, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, // Row 19
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0  // Row 20
];

var mapTileData = new TileMap();

var roofList = [
    { x:5, y:3, w:4, h:7, data: [ // roof 01
        10, 10, 11, 11,
        10, 10, 11, 11,
        10, 10, 11, 11,
        10, 10, 11, 11,
        10, 10, 11, 11,
        10, 10, 11, 11,
        10, 10, 11, 11
    ]},
    { x:15, y:5, w:5, h:4, data: [ // roof 02
        10, 10, 11, 11, 11,
        10, 10, 11, 11, 11,
        10, 10, 11, 11, 11,
        10, 10, 11, 11, 11
    ]},
    { x:14, y:9, w:6, h:7, data: [ // roof 03 x= X start coord, y= Y start cord, roof Width, roof Height
        10, 10, 10, 11, 11, 11,
        10, 10, 10, 11, 11, 11,
        10, 10, 10, 11, 11, 11,
        10, 10, 10, 11, 11, 11,
        10, 10, 10, 11, 11, 11,
        10, 10, 10, 11, 11, 11,
        10, 10, 10, 11, 11, 11
    ]}
];
// var tileEvents = { // tileEvents for Bridge functionality
//     23: drawBridge, // Make bridge across water
//     25: drawBridge, // Make bridge across water
//     121 : function(c) {c.placeAt(1,8); }, // warp across water function
//     161 : function(c) {c.placeAt(1,6); }  // warp across water function
// };

// function drawBridge(){
//     gameMap[toIndex(4,5)] = (gameMap[toIndex(4,5)] == 4 ? 2 : 4);
// };

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
    0 : {color: "#685b48", floor:floorTypes.solid, sprite: new Sprite ([{x:0,   y:0, w:40, h:40}])},
    1 : {color: "#5aa457", floor:floorTypes.grass, sprite: new Sprite ([{x:40,  y:0, w:40, h:40}])},
    2 : {color: "#e8bd7a", floor:floorTypes.path,  sprite: new Sprite ([{x:80,  y:0, w:40, h:40}])},
    3 : {color: "#286625", floor:floorTypes.solid, sprite: new Sprite ([{x:120, y:0, w:40, h:40}])},
    4 : {color: "#678fd9", floor:floorTypes.water, sprite: new Sprite ([{x:160, y:0,  w:40, h:40, d:200}, {x:200, y:0,  w:40, h:40, d:200},
                                                                        {x:160, y:40, w:40, h:40, d:200}, {x:200, y:40, w:40, h:40, d:200},
                                                                        {x:160, y:40, w:40, h:40, d:200}, {x:200, y:0,  w:40, h:40, d:200}
                                                                      ])},
    5 : {color: "#eeeeff", floor:floorTypes.ice,       sprite: new Sprite ([{x:120,   y:120, w:40, h:40}])},
    6 : {color: "#cccccc", floor:floorTypes.conveyorL, sprite: new Sprite ([{x:  0,   y: 40, w:40, h:40, d:200}, {x: 40,   y: 40, w:40, h:40, d:200},
                                                                            {x: 80,   y: 40, w:40, h:40, d:200}, {x:120,   y: 40, w:40, h:40, d:200}
                                                                          ])},
    7 : {color: "#cccccc", floor:floorTypes.conveyorR, sprite: new Sprite ([{x: 120,   y: 80, w:40, h:40, d:200}, {x: 80,   y: 80, w:40, h:40, d:200},
                                                                            {x:  40,   y: 80, w:40, h:40, d:200}, {x:  0,   y: 80, w:40, h:40, d:200}
                                                                           ])},
    8 : {color: "#cccccc", floor:floorTypes.conveyorD, sprite: new Sprite ([{x: 160,   y:200, w:40, h:40, d:200}, {x:160,   y:160, w:40, h:40, d:200},
                                                                            {x: 160,   y:120, w:40, h:40, d:200}, {x:160,   y: 80, w:40, h:40, d:200}
                                                                           ])},
    9 : {color: "#cccccc", floor:floorTypes.conveyorU, sprite: new Sprite ([{x: 200,   y: 80, w:40, h:40, d:200}, {x:200,   y:120, w:40, h:40, d:200},
                                                                            {x: 200,   y:160, w:40, h:40, d:200}, {x:200,   y:200, w:40, h:40, d:200}
                                                                           ])},
    10 : {color: "#ccaa00", floor:floorTypes.solid,  sprite: new Sprite ([{x:240,  y: 0, w:40, h:40}])},
    11 : {color: "#ccaa00", floor:floorTypes.solid,  sprite: new Sprite ([{x:240,  y:40, w:40, h:40}])}
};

function Tile (tx, ty, tt){
    this.x          = tx;
    this.y          = ty;
    this.type       = tt;
    this.roof       = null;
    this.roofType   = 0;
    this.eventEnter = null;
    this.object     = null; // ObjectMap
    this.itemStack  = null; // ItemMap
}

function TileMap (){
    this.map    = [];
    this.w      =  0;
    this.h      =  0;
    this.levels =  4; // ObjectMap hardcoded - Should be created dynamically
}

TileMap.prototype.buildMapFromData = function(d, w, h){
    this.w      = w;
    this.h      = h;

    if(d.length!=(w*h)) {
        return false;
    }
    
    this.map.length = 0;

    for(var y = 0; y < h; y++){
        for(var x = 0; x < w; x++){
            this.map.push( new Tile(x, y, d[ ((y*w)+x) ] ) );
        }
    }
    return true;
};

TileMap.prototype.addRoofs = function(roofs){
    for (var i in roofs) {

        var r = roofs[i];

        if(r.x < 0 || r.y < 0 || r.x >= this.w || r.y >= this.h || (r.x + r.w) > this.w || (r.y + r.h) > this.h || r.data.length != (r.w*r.h)){
            continue;
        }
        for (var y = 0; y < r.h; y++){
            for (var x = 0; x < r.w; x++){
                var tileIdx = (((r.y+y)*this.w)+r.x+x);

                this.map[tileIdx].roof = r;
                this.map[tileIdx].roofType = r.data[((y*r.w)+x)];
            }
        }
    }
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
    screen :    [0,0],
    startTile : [0,0],
    endTile :   [0,0],
    offset:     [0,0],
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
    this.delayMove[floorTypes.grass]     = 600;
    // this.delayMove[floorTypes.water]     = 2000;
    this.delayMove[floorTypes.ice]       = 300;
    this.delayMove[floorTypes.conveyorU] = 200;
    this.delayMove[floorTypes.conveyorD] = 200;
    this.delayMove[floorTypes.conveyorL] = 200;
    this.delayMove[floorTypes.conveyorR] = 200;

    this.direction = directions.down;
    this.sprites = {};
    this.sprites[directions.up]       =  new Sprite ([{x:0, y:120, w:30, h:30, d:100}], [{x:30, y:120, w:30, h:30, d:100}], [{x:60, y:120, w:30, h:30, d:100}], [{x:90, y:120, w:30, h:30, d:100}]);
    this.sprites[directions.right]    =  new Sprite ([{x:0, y:150, w:30, h:30, d:100}], [{x:30, y:150, w:30, h:30, d:100}], [{x:60, y:150, w:30, h:30, d:100}], [{x:90, y:150, w:30, h:30, d:100}]);
    this.sprites[directions.down]     =  new Sprite ([{x:0, y:180, w:30, h:30, d:100}], [{x:30, y:180, w:30, h:30, d:100}], [{x:60, y:180, w:30, h:30, d:100}], [{x:90, y:180, w:30, h:30, d:100}]);
    this.sprites[directions.left]     =  new Sprite ([{x:0, y:210, w:30, h:30, d:100}], [{x:30, y:210, w:30, h:30, d:100}], [{x:60, y:210, w:30, h:30, d:100}], [{x:90, y:210, w:30, h:30, d:100}]);

    this.inventory = new Inventory(3); // Three inventory storage locations for Items
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

    var moveSpeed = this.delayMove[tileTypes[mapTileData.map[toIndex(this.tileFrom[0], this.tileFrom[1])].type].floor]; // Adjsted for different types of floor values.
    

    if ((t-this.timeMoved)>=moveSpeed){
        this.placeAt(this.tileTo[0], this.tileTo[1]);

        // if(typeof tileEvents[toIndex(this.tileTo[0], this.tileTo[1])]!= 'undefined') { // Added For Bridge movement
        //     tileEvents[toIndex(this.tileTo[0], this.tileTo[1])](this);
        // }

        if (mapTileData.map[toIndex(this.tileTo[0], this.tileTo[1])].eventEnter!=null) { // Added for roof event
            mapTileData.map[toIndex(this.tileTo[0], this.tileTo[1])].eventEnter(this);
        }

        var tileFloor = tileTypes[mapTileData.map[toIndex(this.tileFrom[0], this.tileFrom[1])].type].floor; // Ice and Conveyor Movement
        
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
    if(typeof this.delayMove[tileTypes[mapTileData.map[toIndex(x, y)].type].floor] == 'undefined') {
        return false;
    }
    
    if (mapTileData.map[toIndex(x, y)].object != null){
        var o = mapTileData.map[toIndex(x, y)].object;
        if (objectTypes[o.type].collision==objectCollision.solid){ // if object type is solid the player will not be able to traverse
            return false;
        }
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

Character.prototype.pickup = function (){
    if (this.tileTo[0] != this.tileFrom[0] || this.tileTo[1] != this.tileFrom[1]){
        return false;
    }
    var is = mapTileData.map[toIndex(this.tileFrom[0], this.tileFrom[1])].itemStack;

    if (is != null){
        var remains = this.inventory.addItems(is.type, is.qty);

        if (remains){
            is.type = remains;
        } else {
            mapTileData.map[toIndex(this.tileFrom[0], this.tileFrom[1])].itemStack = null;
        }
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
        if (e.keyCode == 80){ // Item PickUp
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
        if (e.keyCode == 80){ // Item Pickup
            keysDown[e.keyCode] = false;
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

    // for (x in tileTypes){ //02
    //     tileTypes[x]['animated'] = tileTypes[x].sprite.length > 1 ? true : false;
    //     if(tileTypes[x].animated){
    //         var t = 0;
    //         for (s in tileTypes[x].sprite) {
    //             tileTypes[x].sprite[s]['start'] = t;

    //             t+= tileTypes[x].sprite[s].d;
    //             tileTypes[x].sprite[s]['end'] = t;
    //         }
    //         tileTypes[x]['spriteDuration'] = t;
    //     }
    // }
    mapTileData.buildMapFromData(gameMap, mapW, mapH);
    mapTileData.addRoofs(roofList);

    mapTileData.map[((2*mapW)+2)].eventEnter = function() {
        console.log("Welcome to tile 2 X 2");
    };

    var mo1 = new MapObject(1);  mo1.placeAt(2, 4); // Creating and placing item on map
    var mo2 = new MapObject(2);  mo2.placeAt(2, 3);

    var mo11 = new MapObject(1); mo11.placeAt(6, 4);
    var mo12 = new MapObject(2); mo12.placeAt(7, 4);
    
    var mo4 = new MapObject(3);  mo4.placeAt(4,  5);
    var mo5 = new MapObject(3);  mo5.placeAt(4,  8);
    var mo6 = new MapObject(3);  mo6.placeAt(4, 11);

    var mo7 = new MapObject(3);  mo7.placeAt(2,  6);
    var mo8 = new MapObject(3);  mo8.placeAt(2,  9);
    var mo9 = new MapObject(3);  mo9.placeAt(2, 12);

    for (var i = 3; i < 8; i++){ // Item Loops for Star Items
        var ps = new PlacedItemStack(1,1); ps.placeAt(i, 1);
    };

    for (var i = 3; i < 8; i++){ // Item Loops for Star Items
        var ps = new PlacedItemStack(1,1); ps.placeAt(3, i); // PlacedItemStack (id, qty), placeAt(x,y)
    };
};

// function getFrame(sprite, duration, time, animated){ //SpriteDraw method makes this obsolete
//     if (!animated){
//         return sprite[0]; // If no animation associated with sprite load index 0 of sprite
//     }
//     time = time % duration;
//     for (x in sprite){
//         if(sprite[x].end >= time){
//             return sprite[x];
//         };
//     };
// };

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
        } else if(keysDown[80]){ // 'P' key for Item Pickup
            player.pickup();
        }
     }

     viewport.update(player.position[0] + (player.dimensions[0]/2),
                     player.position[1] + (player.dimensions[1]/2)
                    );

    var playerRoof1 = mapTileData.map[toIndex(player.tileFrom[0], player.tileFrom[1])].roof;
    var playerRoof2 = mapTileData.map[toIndex(player.tileTo[0],   player.tileTo[1])].roof;

    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, viewport.screen[0], viewport.screen[1]);

    for (var z = 0; z < mapTileData.levels; z++){ // zIndex introduced for MapObjects

    

    for (var y = viewport.startTile[1]; y <= viewport.endTile[1]; y++){ // y corresponds to Y coordinate on map
        for (var x = viewport.startTile[0]; x <= viewport.endTile[0]; x++){ // x corresponds to X coordinate on map

            if (z==0) { // MapObjects zIndex

            tileTypes[mapTileData.map[toIndex(x, y)].type].sprite.draw(gameTime, viewport.offset[0] + (x*tileW), viewport.offset[1] + (y*tileH));

            // ctx.drawImage(tileSet, tile.sprite[0].x, tile.sprite[0].y, tile.sprite[0].w, tile.sprite[0].h, // 01
            //               viewport.offset[0] + (x*tileW), viewport.offset[1] + (y*tileH), tileW, tileH);

            // var tile = tileTypes[mapTileData.map[toIndex(x,y)].type]; // 02
            // var sprite = getFrame(tile.sprite, tile.spriteDuration, gameTime, tile.animated);
            // ctx.drawImage(tileSet, sprite.x, sprite.y, sprite.w, sprite.h, viewport.offset[0] + (x*tileW), viewport.offset[1] + (y*tileH), tileW, tileH);

            } // MapObjects zIndex

            else if (z==1){ // ItemMap Placement
                var is = mapTileData.map[toIndex(x, y)].itemStack;
                if (is != null){

                    itemTypes[is.type].sprite.draw(gameTime, viewport.offset[0] + (x*tileW) + itemTypes[is.type].offset[0],
                                                             viewport.offset[1] + (y*tileH) + itemTypes[is.type].offset[1]);

                    // var sprite = itemTypes[is.type].sprite; // 02

                    // ctx.drawImage(tileSet, sprite[0].x, sprite[0].y, sprite[0].w, sprite[0].h,
                    //     viewport.offset[0] + (x*tileW) + itemTypes[is.type].offset[0], viewport.offset[1] + (y*tileH) + itemTypes[is.type].offset[1],
                    //     sprite[0].w, sprite[0].h
                    //     );
                };
            };

            var o = mapTileData.map[toIndex(x, y)].object; // MapObjects Draw Loop

            if (o!=null && objectTypes[o.type].zIndex==z) {
                var ot = objectTypes[o.type];

                ot.sprite.draw(gameTime, viewport.offset[0] + (x*tileW) + ot.offset[0],
                                         viewport.offset[1] + (y*tileH) + ot.offset[1]);

                // ctx.drawImage(tileSet, ot.sprite[0].x, ot.sprite[0].y, ot.sprite[0].w, ot.sprite[0].h, // 02
                //               viewport.offset[0] + (x*tileW) + ot.offset[0], viewport.offset[1] + (y*tileH) + ot.offset[1],
                //               ot.sprite[0].w, ot.sprite[0].h );
            }

            if (z == 2 && // MapObjects added zIndex to roof of 2
                mapTileData.map[toIndex(x, y)].roofType != 0       && 
                mapTileData.map[toIndex(x, y)].roof != playerRoof1 && 
                mapTileData.map[toIndex(x, y)].roof != playerRoof2)  {

                    tileTypes[mapTileData.map[toIndex(x, y)].roofType].sprite.draw(gameTime, viewport.offset[0] + (x*tileW), 
                                                                                             viewport.offset[1] + (y*tileH));

                    // tile = tileTypes[mapTileData.map[toIndex(x, y)].roofType];
                    // sprite = getFrame(tile.sprite, tile.spriteDuration, gameTime, tile.animated);
                    // ctx.drawImage(tileSet, sprite.x, sprite.y, sprite.w, sprite.h, viewport.offset[0] + (x*tileW), viewport.offset[1] + (y*tileH), tileW, tileH);
            }
        };
    };

    //  ctx.fillStyle = "#0000ff"; // Draw Player
    //  ctx.fillRect(viewport.offset[0] + player.position[0], viewport.offset[1] + player.position[1], player.dimensions[0], player.dimensions[1]);

        if (z==1){ // MapObjects Added a zIndex to player of 1

            player.sprites[player.direction].draw(gameTime, viewport.offset[0] + player.position[0],
                                                           viewport.offset[1] + player.position[1]);

                    // var sprite = player.sprites[player.direction]; // new Draw Player with sprite sheet // 02
                    // ctx.drawImage(tileSet, sprite[0].x, sprite[0].y, sprite[0].w, sprite[0].h, 
                    //             viewport.offset[0] + player.position[0], viewport.offset[1] + player.position[1],
                    //             player.dimensions[0], player.dimensions[1]);
        }
    } // Closing of Z loop

    for (var i = 0; i < player.inventory.spaces; i++){ // Drawing Inventory to screen
        ctx.fillStyle = "#ddccaa";
        ctx.fillRect(10 + (i * 50), 350, 40, 40);

        if (typeof player.inventory.stacks[i] != 'undefined'){
            var it = itemTypes[player.inventory.stacks[i].type];
            
            it.sprite.draw(gameTime, 10 + (i*50) + it.offset[0], 350 + it.offset[1]);

            // var sprite = it.sprite; //02

            // ctx.drawImage(tileSet, sprite[0].x, sprite[0].y, sprite[0].w, sprite[0].h, 10 + (i * 50) + it.offset[0],
            //                350 + it.offset[1], sprite[0].w, sprite[0].h );
            
            if (player.inventory.stacks[i].qty > 1){
                ctx.fillStyle = "#000000";
                ctx.fillText(" " + player.inventory.stacks[i].qty, 10 + (i * 50) + 38, 350 + 38);
            }
        }
    }

    ctx.textAlign = "Left"; // Added for inventory display

    ctx.fillStyle = "#ff0000";
    ctx.fillText("FPS : " + framesLastSecond, 10, 20); // FPS
    
     if (gameSpeeds[currentSpeed].mult == 0){
        ctx.fillText("Game " + gameSpeeds[currentSpeed].name, 165, 20); // Current Game Speed
    }

    lastFrameTime = currentFrameTime;
    requestAnimationFrame(drawGame);
}