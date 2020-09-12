var canvas;
var canvasContext;
var ballX = 50;      // X Coordinate
var ballY = 50;      // Y Coordinate
var ballSpeedX = 10; // X speed
var ballSpeedY = 4;  // Y speed positive numbers go down, negative go up

var player1Score = 0;
var player2Score = 0;
const WINNING_SCORE = 3;

var showingWinScreen = false;

var paddle1Y = 250;    // variable value can change
var paddle2Y = 250;
const PADDLE_HEIGHT = 100; // constant values never change
const PADDLE_THICKNESS = 10;

function calculateMousePos(evt){      // an event fires when mouse moves
  var rect = canvas.getBoundingClientRect();
  var root = document.documentElement;
  var mouseX = evt.clientX - rect.left - root.scrollLeft;
  var mouseY = evt.clientY - rect.top - root.scrollTop;
  return {
    x:mouseX,   // Object Literal
    y:mouseY    // Object Literal
  };
}

function handleMouseClick(evt){
  if(showingWinScreen) {
    player1Score = 0;
    player2Score = 0;
    showingWinScreen = false;
  }
}

window.onload = function() {
  canvas = document.getElementById('pongCanvas');
  canvasContext = canvas.getContext('2d');

  var framesPerSecond = 30;
  setInterval(function() {
  moveEverything ();
  drawEverything();
  },1000/framesPerSecond); // Hundredth of seconds, ballX movement

  canvas.addEventListener ('mousedown', handleMouseClick);

  canvas.addEventListener ('mousemove',   // keypress, mouseclick, mousemove
    function(evt) {
      var mousePos = calculateMousePos(evt);
      paddle1Y = mousePos.y-(PADDLE_HEIGHT/2); // paddle aligns in centre with mouse
    });
}


function ballReset () {     // Ball reset is missed
  if(player1Score >= WINNING_SCORE || // || = or else, && Both
     player2Score >= WINNING_SCORE) {
      showingWinScreen = true;
  }

  ballSpeedX = - ballSpeedX;
  ballX = canvas.width/2;
  ballY = canvas.height/2;
}

function computerMovement() {
  var paddle2YCentre = paddle2Y + (PADDLE_HEIGHT/2);
  if  (paddle2YCentre < ballY - 35) {
    paddle2Y += 6; // Same as ... paddle2Y - paddle2Y + 6
  } else if (paddle2YCentre > ballY +35) {
    paddle2Y -= 6; // Same as ... paddle2Y = paddle2Y - 6
  }
}

function moveEverything() {
  if (showingWinScreen) {
    return;
  }
  computerMovement();

  ballX += ballSpeedX;  // Same as ... ballX = ballX + ballSpeedX
  ballY += ballSpeedY;  // Same as ... ballY = ballY + ballSpeedY

  if(ballX < 0) {         // Left Side Bounce
    if(ballY > paddle1Y &&      // If Below Top Of Paddle - Bounce
       ballY < paddle1Y+PADDLE_HEIGHT) {  // If Above Bottom Of Paddle - Bounce
      ballSpeedX = -ballSpeedX;

      var deltaY = ballY
        -(paddle1Y+PADDLE_HEIGHT/2);
      ballSpeedY = deltaY * 0.35;
  } else {          // If Not ...
    player2Score ++;      // Same as +1, Must Before Ballreset
    ballReset ();       // Resets Ball If Missed
    }
  }
  if(ballX > canvas.width) {        // Right Side Bounce
       if(ballY > paddle2Y &&       // If Below Top Of Paddle - Bounce
          ballY < paddle2Y+PADDLE_HEIGHT) {   // If Above Bottom Of Paddle - Bounce
      ballSpeedX = -ballSpeedX;
      var deltaY = ballY
        -(paddle2Y+PADDLE_HEIGHT/2);
      ballSpeedY = deltaY * 0.35
  } else {          // If Not ...
    player1Score ++;      // Same as +1,Must Before Ballreset
    ballReset ();       // Resets Ball If Missed
    }
  }
  if(ballY < 0) {       // Up Side Bounce
    ballSpeedY = - ballSpeedY;
  }
  if(ballY > canvas.height) {   // Down Side Bounce
    ballSpeedY = - ballSpeedY;
  }
}

function drawNet() {
  for (var i=0; i<canvas.height; i+=40){
    colorRect (canvas.width/2-1,i,2,20,'white');
  }
}


function drawEverything() {
  colorRect(0,0,canvas.width,canvas.height, 'black');       // blanks screen black

  if (showingWinScreen) {
    canvasContext.fillStyle = 'white';
    if(player1Score >= WINNING_SCORE) {
      canvasContext.fillText("Left Player Won",340,200);
    } else if(player2Score >= WINNING_SCORE) {
      canvasContext.fillText("Right Player Won",340,200);
    }
    canvasContext.fillText("Click To Continue",340,500); // text,x,y
    return;
  }

  drawNet(); // draw net

  colorRect(0,paddle1Y,PADDLE_THICKNESS,PADDLE_HEIGHT,"white");         // Paddle - Left
  colorRect(canvas.width - PADDLE_THICKNESS,paddle2Y,PADDLE_THICKNESS,PADDLE_HEIGHT,"white"); // Paddle - Right
  colorCircle (ballX,ballY,10, 'white');                // Ball


  canvasContext.fillText("Player 1 Score",100,90);
  canvasContext.fillText(player1Score,100,100); // text,x,y
  canvasContext.fillText("Player 2 Score",canvas.width-120,90);
  canvasContext.fillText(player2Score,canvas.width-100,100);
}

function colorCircle (centreX, centreY,radius, drawColor) {
  canvasContext.fillStyle = drawColor;
  canvasContext.beginPath();
  canvasContext.arc(centreX,centreY,radius,0,Math.PI*2,true);
  canvasContext.fill();
}


function colorRect(leftX,topY, width,height,drawColor) {
  canvasContext.fillStyle = drawColor;
  canvasContext.fillRect(leftX,topY,width,height);
}