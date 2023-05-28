/**
 * Title: Game
 * Author:Samuel Talbot
 * Date:19/05/2022
 * Version: 0.0
 * Purpose: AS91883 & 91884 Programming project
 **/

const WIDTH = 1200;
const HEIGHT = 700;
const FPS = 60;
const SCROLLSPEED = 5;

let gameCanvas;
let healthCanvas;
let menuCanvas;
let scoreCanvas;

let bgImage = new Image();
let player;

let playerRunningAnimation = ["assets/PlayerRun1.png", "assets/PlayerRun2.png"];
let playerIdleAnimaton = ["assets/PlayerIdle1.png", "assets/PlayerIdle2.png"];
let keyBuffer = [];
let enemies = [];

let bgOffset = 0;
let score = 0;

let gameFocused;
let gamePaused;
let gameOver;
let mainMenu;

let hasRun = false;

window.onload = runSetup;
window.addEventListener("keydown", onKeyDown);
window.addEventListener("keyup", onKeyUp);

setInterval(() => {
    if (document.hasFocus()) {
        gameFocused = true;
    } else {
        gameFocused = false;
    }
}, 200);

//FPS COUNTER
let stats = new Stats();
stats.add;
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom

//Runs on startup once
async function runSetup() {
    if (!hasRun) {
        hasRun = true;

        document.body.appendChild(stats.dom);
        gameCanvas = document.getElementById("gameCanvas").getContext("2d");
        healthCanvas = document.getElementById("healthCanvas").getContext("2d");
        menuCanvas = document.getElementById("menuCanvas").getContext("2d");
        scoreCanvas = document.getElementById("scoreCanvas").getContext("2d");

        scoreCanvas.canvas.width = WIDTH;
        scoreCanvas.canvas.height = HEIGHT;
        menuCanvas.canvas.width = WIDTH;
        menuCanvas.canvas.height = HEIGHT;
        healthCanvas.canvas.width = WIDTH;
        healthCanvas.canvas.height = HEIGHT;
        healthCanvas.imageSmoothingEnabled = false;
        gameCanvas.canvas.width = WIDTH;
        gameCanvas.canvas.height = HEIGHT;
        gameCanvas.imageSmoothingEnabled = false;

        bgImage = await loadImage("assets/background.jpg");

        player = new Player();

        mainLoop();
        spawnEnemy();
    }
    gameCanvas.clearRect(0, 0, WIDTH, HEIGHT);
    healthCanvas.clearRect(0, 0, WIDTH, HEIGHT);
    menuCanvas.clearRect(0, 0, WIDTH, HEIGHT);
    scoreCanvas.clearRect(0, 0, WIDTH, HEIGHT);

    keyBuffer = [];
    enemies = [];
    score = 0;

    player = new Player();

    player.setAnimation(playerRunningAnimation, 200);
    player.drawHealth();

    updateScore();

    gameFocused = true;
    gamePaused = false;
    gameOver = false;
    mainMenu = false;
}

// runs ${FPS} times a second
function mainLoop() {
    //FPS
    setTimeout(() => {
        requestAnimationFrame(mainLoop);
    }, 1000 / FPS);
    stats.begin();
    if (gameFocused && !gamePaused && !gameOver && !mainMenu) {
        //BACKGROUND
        gameCanvas.drawImage(bgImage, bgOffset, 0, WIDTH * 2, HEIGHT);
        gameCanvas.drawImage(
            bgImage,
            bgOffset + WIDTH * 2,
            0,
            WIDTH * 2,
            HEIGHT
        );
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
                if (enemies[i].type == 0) {
                    score += 1;
                    updateScore();
                } else if (enemies[i].type == 1) {
                    score += 2;
                    updateScore();
                }
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
    }, 1000 - score / 100);
    if (gameFocused && !gamePaused && !gameOver && !mainMenu) {
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
    //Keys that do not need to be held down
    if (keyEvent.key === "Escape") {
        pauseGame();
    }
    if (keyEvent.key === "e" && gameOver) {
        mainMenu = true;
    }
    if (keyEvent.key === "r" && gameOver) {
        runSetup();
    }

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

//Generates a random number with a set probability, eg: [0,0,1,2,2,2] where out of 6 runs there will likely be 3 2s, 1 1, and 2 0s.
function randomWithProbability(probability) {
    let idx = Math.floor(Math.random() * probability.length);
    return probability[idx];
}

function gameOverFunc() {
    gameOver = true;
    menuCanvas.clearRect(0, 0, WIDTH, HEIGHT);
    menuCanvas.font = "100px times-new-roman";
    menuCanvas.fillText("Game Over", WIDTH / 2 - 200, HEIGHT / 2 - 25, 400);
    menuCanvas.font = "50px times-new-roman";
    menuCanvas.fillText(
        'Press "E" to exit',
        WIDTH / 2 - 175,
        HEIGHT / 2 + 25,
        350
    );
    menuCanvas.fillText(
        'Press "R" to restart',
        WIDTH / 2 - 175,
        HEIGHT / 2 + 75,
        350
    );
}

function pauseGame() {
    if (!gamePaused) {
        gamePaused = true;
        menuCanvas.clearRect(0, 0, WIDTH, HEIGHT);
        menuCanvas.font = "100px times-new-roman";
        menuCanvas.fillText(
            "Game Paused",
            WIDTH / 2 - 200,
            HEIGHT / 2 - 25,
            400
        );
        menuCanvas.font = "50px times-new-roman";
        menuCanvas.fillText(
            'Press "Escape" to unpause',
            WIDTH / 2 - 175,
            HEIGHT / 2 + 25,
            350
        );
    } else {
        gamePaused = false;
        menuCanvas.clearRect(0, 0, WIDTH, HEIGHT);
        console.log("e");
    }
}

function updateScore() {
    scoreCanvas.clearRect(0, 0, WIDTH, HEIGHT);
    scoreCanvas.font = "25px times-new-roman";
    scoreCanvas.fillText(`Score: ${score}`, WIDTH / 2, 25, 100);
}
