var canvas = document.getElementById('tileBasedCanvas');
var ctx = canvas.getContext('2d');

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