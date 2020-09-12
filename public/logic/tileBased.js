var ctx = null;

var tileW = 40;
var tileH = 40;

var mapW = 10;
var mapH = 10;

var currentSecond = 0;
var frameCount = 0;
var framesLastSecond = 0;

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

window.onload = function() {
    var canvas = document.getElementById('tileBasedCanvas');
    ctx = canvas.getContext('2d');
    requestAnimationFrame(drawGame);
    ctx.font = " bold 10pt sans-serif";
}

function drawGame() {
    if (ctx == null) {
        return;
    }
     var sec = Math.round(Date.now()/1000);
     if (sec!=currentSecond){
         currentSecond = sec;
         framesLastSecond = frameCount;
         frameCount = 1;
     } else {
         frameCount++;
         console.log(framesLastSecond);
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
     ctx.fillText("Time : " + framesLastSecond, 10, 20);

     requestAnimationFrame(drawGame);
}