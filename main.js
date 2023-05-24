/**
 * Title: Game
 * Author:Samuel Talbot
 * Date:19/05/2022
 * Version: 0.0
 * Purpose: AS91883 & 91884 Programming project
 **/

let ctx;
let xPos = 100;
let bgColor = "beige";
const WIDTH = 600;
const HEIGHT = 500;
window.onload = runSetup;
setInterval(mainLoop, 16.667);
let playerRunningAnimation = {
    1: "assets/Player-1.png",
    2: "assets/Player-2.png"
}

function runSetup() {
    ctx = document.getElementById("gameCanvas").getContext("2d");
}

function mainLoop() {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = "red";
    xPos++;
    ctx.fillRect(xPos, 100, 30, 30);
}

class Player{
    constructor(){
        this.image;
        // lst

    }

    playAnimation(animation, animationSpeedMS){
        this.image;
    }

    update(){

    }
}