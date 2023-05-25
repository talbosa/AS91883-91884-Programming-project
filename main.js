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
player = new Player();
let playerRunningAnimation = ["assets/Player-1.png", "assets/Player-2.png"];
window.onload = runSetup;

function runSetup() {
    ctx = document.getElementById("gameCanvas").getContext("2d");
    ctx.imageSmoothingEnabled= false
    setInterval(mainLoop, 16.667);
    player.setAnimation(playerRunningAnimation, 200);
}

function mainLoop() {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    // ctx.fillStyle = "red";
    xPos++;
    player.update();
    // ctx.fillRect(xPos, 100, 30, 30);
}