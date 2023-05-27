/**
 * Title: Game
 * Author:Samuel Talbot
 * Date:19/05/2022
 * Version: 0.0
 * Purpose: AS91883 & 91884 Programming project
 **/

//CONST
const WIDTH = 1200;
const HEIGHT = 700;
const FPS = 60;
const SCROLLSPEED = 5;
//HTML RELATED
let ctx;
let gui;
let isFocused = true;
//CLASSES
let bgImage = new Image();
let player = new Player();
//ARRAYS
let playerRunningAnimation = ["assets/PlayerRun1.png", "assets/PlayerRun2.png"];
let playerIdleAnimaton = ["assets/PlayerIdle1.png", "assets/PlayerIdle2.png"];
let keyBuffer = [];
let enemies = [];
//INTEGERS
let bgOffset = 0;
//WINDOW
window.onload = runSetup;
window.addEventListener("keydown", onKeyDown);
window.addEventListener("keyup", onKeyUp);
//INTERVAL
setInterval(() => {
    if (document.hasFocus()) {
        isFocused = true;
    } else {
        isFocused = false;
    }
}, 200);

//FPS COUNTER
let stats = new Stats();
stats.add;
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom

//Runs on startup once
function runSetup() {
    document.body.appendChild(stats.dom);
    ctx = document.getElementById("gameCanvas").getContext("2d");
    gui = document.getElementById("guiCanvas").getContext("2d");
    gui.canvas.width = WIDTH;
    gui.canvas.height = HEIGHT;
    gui.imageSmoothingEnabled = false;
    ctx.canvas.width = WIDTH;
    ctx.canvas.height = HEIGHT;
    ctx.imageSmoothingEnabled = false;
    player.setAnimation(playerRunningAnimation, 200);
    bgImage.src = "assets/background.jpg";
    mainLoop();
    spawnEnemy();
}

// runs ${FPS} times a second
function mainLoop() {
    //FPS
    setTimeout(() => {
        requestAnimationFrame(mainLoop);
    }, 1000 / FPS);
    stats.begin();
    if (isFocused) {
        //BACKGROUND
        ctx.drawImage(bgImage, bgOffset, 0, WIDTH * 2, HEIGHT);
        ctx.drawImage(bgImage, bgOffset + WIDTH * 2, 0, WIDTH * 2, HEIGHT);
        bgOffset -= SCROLLSPEED;
        if (bgOffset == -WIDTH * 2) {
            bgOffset = 0;
        }
        //KEYPRESS
        if (keyDown("d")) {
            player.xPos += player.moveSpeedX;
            if (player.animation != playerRunningAnimation) {
                player.setAnimation(playerRunningAnimation, 200);
            }
        }
        if (keyDown("a")) {
            player.xPos -= player.moveSpeedX;
            if (player.animation != playerIdleAnimaton) {
                player.setAnimation(playerIdleAnimaton, 200);
            }
        } else if (player.animation != playerRunningAnimation) {
            player.setAnimation(playerRunningAnimation, 200);
        }
        if (keyDown("s")) {
            player.yPos += player.moveSpeedY;
        }
        if (keyDown("w")) {
            player.yPos -= player.moveSpeedY;
        }
        //UPDATE
        player.update();
        for (let i = 0; i < enemies.length; i++) {
            enemies[i].update();
            if (enemies[i].xPos < -100) {
                enemies.splice(i, 1);
            }
            if (
                player.rectCollision(
                    enemies[i].xPos,
                    enemies[i].yPos,
                    enemies[i].width,
                    enemies[i].height
                )
            ) {
                enemies.splice(i, 1);
                player.damage(1);
            }
        }
    }
    stats.end();
}

//Spawns enemies
function spawnEnemy() {
    setTimeout(() => {
        requestAnimationFrame(spawnEnemy);
    }, 1000);
    if (isFocused) {
        new Enemy();
    }
}

//Runs on key press
function onKeyDown(keyEvent) {
    //DEBUG  HEALTH TEST
    if (keyEvent.key === " ") {
        player.damage(1);
    }
    if (keyEvent.key === "Control") {
        player.overheal(1);
    }

    if (keyBuffer.indexOf(keyEvent.key) == -1) {
        keyBuffer.push(keyEvent.key);
    }
}

//Runs okn key release
function onKeyUp(keyEvent) {
    if (keyBuffer.indexOf(keyEvent.key) != -1) {
        keyBuffer.splice(keyBuffer.indexOf(keyEvent.key), 1);
    }
}

//Checks if key is currently held
function keyDown(key) {
    if (keyBuffer.lastIndexOf(key) != -1) {
        return true;
    } else {
        return false;
    }
}

//Async load image
const loadImage = (path) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = path;
        img.onload = () => {
            resolve(img);
        };
        img.onerror = (e) => {
            reject(e);
        };
    });
};
