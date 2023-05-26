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
let bgColor = "beige";
let player = new Player();
let playerRunningAnimation = ["assets/Player-1.png", "assets/Player-2.png"];
let keyBuffer = [];
window.onload = runSetup;
window.addEventListener("keydown", onKeyDown);
window.addEventListener("keyup", onKeyUp);

function runSetup() {
    ctx = document.getElementById("gameCanvas").getContext("2d");
    ctx.canvas.width = WIDTH;
    ctx.canvas.height = HEIGHT;
    ctx.imageSmoothingEnabled = false;
    player.setAnimation(playerRunningAnimation, 200);
    mainLoop();
}

function mainLoop() {
    setTimeout(() => {
        requestAnimationFrame(mainLoop);
    }, 1000 / FPS);
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    if (keyDown("d")) {
        player.xPos += 5;
    }
    if (keyDown("a")) {
        player.xPos -= 5;
    }
    player.update();
}

function onKeyDown(keyEvent) {
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
