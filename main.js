/**
 * Title: Game
 * Author:Samuel Talbot
 * Date:19/05/2022
 * Version: 0.0
 * Purpose: AS91883 & 91884 Programming project
 **/

const WIDTH = 600;
const HEIGHT = 500;
const FPS = 60;
let ctx;
let bgImage = new Image();
let player = new Player();
let playerRunningAnimation = ["assets/PlayerRun1.png", "assets/PlayerRun2.png"];
let playerIdleAnimaton = ["assets/PlayerIdle1.png", "assets/PlayerIdle2.png"];
let keyBuffer = [];
let bgOffset = 0;
window.onload = runSetup;
window.addEventListener("keydown", onKeyDown);
window.addEventListener("keyup", onKeyUp);

function runSetup() {
    ctx = document.getElementById("gameCanvas").getContext("2d");
    ctx.canvas.width = WIDTH;
    ctx.canvas.height = HEIGHT;
    ctx.imageSmoothingEnabled = false;
    player.setAnimation(playerRunningAnimation, 200);
    bgImage.src = "assets/background.jpg";
    mainLoop();
}

function mainLoop() {
    setTimeout(() => {
        requestAnimationFrame(mainLoop);
    }, 1000 / FPS);
    ctx.drawImage(bgImage, bgOffset, 0, WIDTH * 2, HEIGHT);
    ctx.drawImage(bgImage, bgOffset + WIDTH * 2, 0, WIDTH * 2, HEIGHT);
    bgOffset -= 5;
    if (bgOffset == -WIDTH * 2) {
        bgOffset = 0;
    }

    if (keyDown("d")) {
        player.xPos += 5;
        if (player.animation != playerRunningAnimation) {
            player.setAnimation(playerRunningAnimation, 200);
        }
    }
    if (keyDown("a")) {
        player.xPos -= 5;
        if (player.animation != playerIdleAnimaton) {
            player.setAnimation(playerIdleAnimaton, 200);
        }
    } else if (player.animation != playerRunningAnimation) {
        player.setAnimation(playerRunningAnimation, 200);
    }
    if (keyDown("s")) {
        player.yPos += 10;
    }
    if (keyDown("w")) {
        player.yPos -= 10;
    }
    player.update();
}

function onKeyDown(keyEvent) {
    if(keyEvent.key === " "){
        player.health--;
    }
    if(keyEvent.key === "Control"){
        player.health++;
    }

    if (keyBuffer.indexOf(keyEvent.key) == -1) {
        keyBuffer.push(keyEvent.key);
    }
}

function onKeyUp(keyEvent) {
    if (keyBuffer.indexOf(keyEvent.key) != -1) {
        keyBuffer.splice(keyBuffer.indexOf(keyEvent.key), 1);
    }
}

function keyDown(key) {
    if (keyBuffer.lastIndexOf(key) != -1) {
        return true;
    } else {
        return false;
    }
}
