
    var canvas;
    var c;

    var chipX;
    var chipY;
    
    var currentPlayer = "one";
    var chipColour = "red";

    var chipSpeed = 300;


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
        if(currentPlayer = "two") {
            playerTwoMove();
        }
        if(currentPlayer = "one") {
            playerOneMove();
        }
    }

    function playerOneMove(){
        for ( y = 0; y <= 1000; y ++) {
            chipY += 100 / chipSpeed;
            c.fillStyle = "red";
            c.beginPath();
            c.arc(chipX,chipY,40,0,Math.PI*2,true);
            c.fill();
            }
            currentPlayer = "two";
            console.log("The current player is : " + currentPlayer);
    }

    function playerTwoMove(){
            for ( y = 0; y <= 1000; y ++) {
            chipY += 100 / chipSpeed;
            c.fillStyle = "black";
            c.beginPath();
            c.arc(chipX,chipY,40,0,Math.PI*2,true);
            c.fill();
            }
        currentPlayer = "one";
        console.log("The current player is : " + currentPlayer);
    }

    window.onload = function() {
        canvas = document.getElementById('connectCanvas');
        c = canvas.getContext('2d');

        var framesPerSecond = 30;

        console.log("The current player to start is :  " + currentPlayer);

        setInterval(function() {
            drawEverything();
        },1000/framesPerSecond);

        canvas.addEventListener ('mousedown', handleMouseClick);

        canvas.addEventListener ('mousemove',   // keypress, mouseclick, mousemove
            function(evt) {
            var mousePos = calculateMousePos(evt);
            chipX = mousePos.x;
            chipY = mousePos.y;
        });
    }

    function drawEverything() {
        c.fillStyle = '#80ced6';
        c.fillRect(0,0,canvas.width,canvas.height);
        c.fill();

        drawChip ();
    }

    function drawChip () {

        if (chipX <= 100) {
            chipX = 100;
        }
        if (chipX >= 700) {
            chipX = 700;
        }
        if (chipY <= 60) {
            chipY = 60;
        }
        if (chipY >= 400) {
            chipY = 400;
        }


        c.fillStyle = "red";
        c.beginPath();
        c.arc(chipX,chipY,40,0,Math.PI*2,true);
        c.fill();
    }

