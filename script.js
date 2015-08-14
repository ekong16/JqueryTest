var CANVAS_WIDTH = 480;
var CANVAS_HEIGHT = 320;

var canvasElement = $("<canvas width='" + CANVAS_WIDTH + 
                      "' height='" + CANVAS_HEIGHT + "'></canvas>");
var canvas = canvasElement.get(0).getContext("2d");
canvasElement.appendTo('body');
var textX = 50;
var textY = 50;
var FPS = 60;

canvas.font = "normal 20pt cursive"

setInterval(function() {
    update();
    draw();
}, 1000/FPS);

function update(){
    textX += 1;
    textY += 1;
}

function draw(){
    canvas.clearRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
    canvas.fillStyle = "#000"; // Set color to black
    canvas.fillText("Sup Bro!", textX, textY);
}