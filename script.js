var CANVAS_WIDTH = window.innerWidth;
var CANVAS_HEIGHT = window.innerHeight;

var canvasElement = $("<canvas width='" + CANVAS_WIDTH + "' height='" + CANVAS_HEIGHT + "'></canvas>");

var canvas = canvasElement.get(0).getContext("2d");
canvasElement.appendTo('body');
var textX = CANVAS_WIDTH/2 - 150;
var textY = 0;
var FPS = 60;
var scene = 0;

var right = false;
var up = false;
var left = false;
var down = false;
var charSize = Math.floor(canvas.canvas.height*0.1);
var blockSize = Math.floor(charSize*1.1);
var blockpics = ["potato2/sprite_5.png","potato2/sprite_6.png","potato2/sprite_7.png"];
var numBlocks = 3;
var xMin = canvas.canvas.width; //The x coordinate that defines the quadrants where blocks are created
var xMax = canvas.canvas.width*2; //The endpoint.
var yMax = canvas.canvas.height-charSize;
var active = true;
var myChar = new Character(canvas.canvas.width/7,50,charSize,charSize,"potato2/sprite_1.png");
var level = 1;
var enemies = createBlocks(numBlocks);

//Check if computer or mobile. Adds relevent event listeners --keyboard or touch. 
if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    window.addEventListener('orientationchange', resizeCanvas, false);
    window.addEventListener('load', function(){ 
        window.scrollTo(0,50); });
    window.addEventListener('touchstart', function(e){
        e.preventDefault();
        /*if (scene === 0){
            scene = "game";
        }*/
        if (scene === "game"){
            if (!jumped){
                up = true;
                //jumped = true;
            } else{up = false;}
        }
    }, false);

    window.addEventListener('touchend', function(e){
        e.preventDefault();
        up = false; //jumped = false;
    }, false);

    window.addEventListener('touchmove', function(e){
        e.preventDefault();
    },false);
}
else {
    window.addEventListener('resize', resizeCanvas, false);

    $(window).keydown(function(e){
        //alert("hi");
        switch(e.which) {
                case 37: left = true; 
                break;

                case 32: up = true;
                break;

                case 39: right = true;
                break;

                case 40: down = true;
                break;

                default: return;

        }
        e.preventDefault();
    });

    $(window).keyup(function(e){
        switch(e.which) {
                case 37: left = false; 
                break;

                case 32: up = false;
                break;

                case 39: right = false;
                break;

                case 40: down = false;
                break;

                default: return;
        }
    });
}
$("#losepage").hide();
$("#play").bind("click touchstart", function(){
        scene = "game";
        $(".scene0").hide();
    });
$("#instruct").bind("click touchstart", function(){
        scene = "instructions";
        $(".scene0").hide();
        $(".scenehelp").show();
    });
$("#return").bind("click touchstart", function(){
        scene = 0;
        $(".scenehelp").hide();
        $(".scene0").show();
    });

$("#restart").bind("click touchstart", function(){
        restart();
        $("#losepage").hide();
    });

function resizeCanvas(){
    canvas.canvas.width = window.innerWidth;
    canvas.canvas.height = window.innerHeight;
    myChar.resize();
    for (index in enemies) {
        enemies[index].resize();
    }
    xMin = canvas.canvas.width;
    xMax = canvas.canvas.width*2;
    yMax = canvas.canvas.height-canvas.canvas.height*0.1;
    charSize = Math.floor(canvas.canvas.height*0.1);
    blockSize = Math.floor(charSize*1.1);
}


function restart(){
    enemies = createBlocks(numBlocks);
    active = true;
    scene = "game";
    //console.log(enemies[0].x||"undefined");
    animloop();
}

function Sprite(x,y,w,h,img_src) {
    this.img = new Image(); 
    this.img.src = img_src || null;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.draw = function(){
        canvas.drawImage(this.img, this.x,this.y,this.w,this.h);
    };
}

function Character(x,y,w,h,img_src) {
    var t = 0;
    Sprite.call(this,x,y,w,h,img_src);
    this.vel = Math.floor(canvas.canvas.height/80); 
    this.yVel = this.vel;
    this.fall = canvas.canvas.height/500;

    this.resize = function (){
        this.w = Math.floor(canvas.canvas.height*0.10);
        this.h = Math.floor(canvas.canvas.height*0.10);
        this.x = Math.floor(canvas.canvas.width/7);
        this.vel = Math.floor(canvas.canvas.height/80);
        this.fall = canvas.canvas.height/500;
    };

    this.move = function(){
        if (up) { 
            this.yVel=this.vel;
            this.y -= this.vel;
            this.img.src="potato2/sprite_3.png";
        }
        /*if (up) {this.y -= 1;}
        if (down) { this.y+=1;}
        if (left) { this.x--}
        if (right) { this.x++}
        */
        if (!up && this.y+this.h<canvas.canvas.height) {
            this.y = Math.round(this.y-this.yVel); 
            this.yVel -= this.fall;
            this.img.src="potato2/sprite_1.png";
        } 
        if (this.y <= 0){
                this.y = 0;
        }
        if (this.y + this.h >= canvas.canvas.height){
            this.y = canvas.canvas.height - this.h;
        }

        else if (this.y <= 0){
            this.y = 0;
        }
    };
}

Character.prototype = Object.create(Sprite.prototype);

function Blocks(x,y,w,h) {
    Sprite.call(this,x,y,w,h);
    this.vel = intRand(canvas.canvas.width/400, canvas.canvas.width/200);
    this.img.src = blockpics[(function(){return Math.floor(Math.random()*3)})()];
    this.velRatio = this.vel/canvas.canvas.width;
    this.yRatio = this.y/canvas.canvas.height;
    this.quad = null;
    this.loops = 0; //No. of times the block reaches the end; level up after this is 2 for all blocks
    this.move = function(){
        this.x = Math.round(this.x-this.vel);
    };

    this.resize = function() {
        this.w = Math.floor(canvas.canvas.height*0.10*1.1);
        this.h = Math.floor(canvas.canvas.height*0.10*1.1);
        this.vel = (function(){
            if (Math.floor(this.velRatio*canvas.canvas.width) === 0) {
                return 1;
            } else {
                return    Math.floor(Math.floor(Math.random()+1)*canvas.canvas.width/300);
            }
        })();
        this.y = Math.floor(this.yRatio*canvas.canvas.height);
    };

    this.checkDone = function() {
        if (this.x + this.w < 0) {
            this.loops += 1;
            coords = spacer(xMin,0,(xMax-xMin),yMax,this.quad);
            this.x = coords[0];
            this.y = coords[1]; 
            this.vel = intRand(canvas.canvas.width/400, canvas.canvas.width/200);
        }
    }
}
//could be useful?     
function intRand(min, max) {
    return Math.random() * (max - min) + min;
}

 //Divides a theoretical area into 4 quadrants, defined by starting (x,y) at top left and a w and h. Gives a random position for a quad as indicated by quadnum. Quad numbers are counted left to right, top to bottom. 

function spacer(x,y,w,h,quadnum){
    var quads = [[0,0],[0,1],[1,0],[1,1]];
    var quad = quads[quadnum];
    var xPos = Math.floor(Math.random()*(w/2)+x+w/2*quad[0]);
    var yPos = Math.floor(Math.random()*(h/2)+y+h/2*quad[1]);
    return [xPos,yPos];
}

//gets the new definitions of a subquad. Might be useful?
function divider(x,y,w,h,quadnum) {
    var quads = [[0,0],[0,1],[1,0],[1,1]];
    quad = quads[quadnum];
    newX = x+w/2*quad[0];
    newY = y+h/2*quad[1];
    newW = w/2;
    newH = h/2;
    return [newX,newY,newW,newH];
}

function createBlocks(numBlocks) {
    var i = 0;
    var blocks = [];
    var num;
    while (i < numBlocks){
        num = i % 4;
        var coords = spacer(xMin,0,(xMax-xMin),yMax,num);
        //var coords = spacer(0,0,xMin,yMax,num);
        var newBlock = new Blocks(coords[0],coords[1],blockSize,blockSize)
        blocks.push(newBlock);
        newBlock.quad = num;
        i++;
    }
    return blocks;
}

//think this should work. did not test.
function addBlock(array,num) {
    var coords = spacer(xMin,0,(xMax-xMin),yMax,num);
    var newBlock = new Blocks(coords[0],coords[1],blockSize,blockSize)
    array.push(newBlock);
    newBlock.quad = num;
}

// Following 2 functions allow for customizable size of rectangle around a sprite. Basically caculates a smaller rectangle and uses that for collision detection instead. Xmarg, yMarg are optional parameters.
function getSmallRect(a,xMarg,yMarg){
    var w1 = a.w*xMarg;
    var h1 = a.h*yMarg;
    var x1 = a.x + (a.w - w1)/2;
    var y1 = a.y + (a.h - h1)/2;
    return [x1,y1,w1,h1];
}

function checkHitRect(a,b,xMarg,yMarg) { 
    var xMarg = xMarg || 1;
    var yMarg = yMarg || 1;
    var newRect = getSmallRect(a,xMarg,yMarg);
    var x1 = newRect[0];
    var y1 = newRect[1];
    var w1 = newRect[2];
    var h1 = newRect[3];
    return (x1 < b.x + b.w &&
    x1 + w1 > b.x &&
    y1 < b.y + b.h &&
    y1 + h1 > b.y);
}

    function checkLevelUp(enemy_array){
        for (index in enemy_array){
            if (enemy_array[index].loops <= 2){
                console.log("A");
                return false;
            }
        }
        console.log("B");
        return true; 
    }

function levelUp(quadnum) {
    level += 1;
    addBlock(enemies, quadnum);
}

//found supposedly more efficient way to animate on internet

window.requestAnimFrame = (function(){
    return window.requestAnimationFrame||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame    ||
    window.oRequestAnimationFrame      || 
    window.msRequestAnimationFrame     || 
    function(callback){
        window.setTimeout(callback, 1000 / 60);
    };
})();

function animloop(){
    if (active){
        requestAnimFrame(animloop);
        update();
        draw();
    }
};

animloop();

function draw(){
    if (scene === 0) {
    $(".scenehelp").hide();
    /*canvas.fillStyle = "#000"; // Set color to black
    canvas.font = "80px Arial";
    canvas.fillText("Hopper Game", textX, textY);*/

    } else if (scene === "game") {
        canvas.clearRect(0,0,canvas.canvas.width,canvas.canvas.height);
        canvas.font = "20px monospace"
        canvas.fillText(level, canvas.canvas.width-20, canvas.canvas.height-20);
        for (var index in enemies) {
            canvas.beginPath();
            //canvas.rect(enemies[index].x,enemies[index].y,
            //            enemies[index].w,enemies[index].h);
            canvas.stroke();
            canvas.closePath();
            enemies[index].draw();
        }
        var newRect = getSmallRect(myChar,0.8,0.75); //testing rectangle that is drawn
        myChar.draw();
        canvas.beginPath();
        canvas.rect(newRect[0],newRect[1],newRect[2],newRect[3]);//testing rectangle
        //canvas.rect(myChar.x,myChar.y,myChar.w,myChar.h);//testing rectangle
        canvas.stroke();
        canvas.clear
        canvas.closePath();

    } else if (scene === "instructions") {
    /*canvas.fillStyle = "#000";
    canvas.font = "30px Arial";
    canvas.fillText("Instructions:", 100, 100);*/
    }
}

var newBlockQuad = 0; //Quad number for each new block

function update(){

    if (scene === 0) {

    } else if (scene === "game") {
        myChar.move();
        console.log(enemies[0].loops, enemies[1].loops, enemies[2].loops)
        console.log("Checklevelup:" + checkLevelUp(enemies));
        for (var index in enemies) {
            enemies[index].move();
            enemies[index].checkDone();

            if (checkHitRect(myChar, enemies[index],0.8,0.75)) {
                active = false;
                $("#losepage").show();
            }
            if (checkLevelUp(enemies)){
                var quadnum = newBlockQuad % 4;
                levelUp(quadnum);
                newBlockQuad += 1;
            }
        }
    }


}      