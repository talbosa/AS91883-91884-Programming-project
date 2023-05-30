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
let loadingCanvas;

let bgImage = new Image();
let player;

let playerRunningAnimation = ["assets/playerrun1.png", "assets/playerrun2.png"];
let playerIdleAnimation = ["assets/playeridle1.png", "assets/playeridle2.png"];
let enemyAnimation = ["assets/enemy1.png", "assets/enemy2.png"];
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
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
//Moves the fps counter to the bottom
stats.dom.style.top = "";
stats.dom.style.bottom = "0px";

//Runs on startup once
async function runSetup() {
    gameFocused = true;
    gamePaused = false;
    gameOver = false;
    mainMenu = false;
    //First Load
    if (!hasRun) {
        hasRun = true;

        loadingCanvas = document
            .getElementById("loadingCanvas")
            .getContext("2d");
        loadingCanvas.canvas.width = WIDTH;
        loadingCanvas.canvas.height = HEIGHT;
        loadingCanvas.font = "25px times-new-roman";

        loadingCanvas.fillStyle = "beige";
        loadingCanvas.fillRect(0, 0, WIDTH, HEIGHT);
        loadingCanvas.fillStyle = "black";
        loadingCanvas.fillText(
            "Loading Canvas Contexts...",
            WIDTH / 2,
            HEIGHT / 2
        );

        gameCanvas = await document
            .getElementById("gameCanvas")
            .getContext("2d");
        healthCanvas = await document
            .getElementById("healthCanvas")
            .getContext("2d");
        menuCanvas = await document
            .getElementById("menuCanvas")
            .getContext("2d");
        scoreCanvas = await document
            .getElementById("scoreCanvas")
            .getContext("2d");

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

        drawLoadingScreen("Loading Image BackGround...");

        bgImage = await loadImage("assets/background.jpg");

        drawLoadingScreen("Initialising Player...");

        player = new Player();

        drawLoadingScreen("Adding FPS Counter...");

        document.body.appendChild(stats.dom);

        drawLoadingScreen("Loading Player Images...");

        for (let i = 0; i < playerIdleAnimation.length; i++) {
            if (typeof playerIdleAnimation[i] === "string") {
                playerIdleAnimation[i] = await loadImage(
                    playerIdleAnimation[i]
                );
            }
        }
        for (let i = 0; i < playerRunningAnimation.length; i++) {
            if (typeof playerRunningAnimation[i] === "string") {
                playerRunningAnimation[i] = await loadImage(
                    playerRunningAnimation[i]
                );
            }
        }

        for (let i = 0; i < Object.keys(player.healthImages).length; i++) {
            Object.values(player.healthImages)[i] = await loadImage(
                Object.values(player.healthImages)[i]
            );
        }

        if (typeof player.healthImages["full"] === "string") {
            player.healthImages["full"] = await loadImage(
                player.healthImages["full"]
            );
        }
        if (typeof player.healthImages["empty"] === "string") {
            player.healthImages["empty"] = await loadImage(
                player.healthImages["empty"]
            );
        }
        if (typeof player.healthImages["shield"] === "string") {
            player.healthImages["shield"] = await loadImage(
                player.healthImages["shield"]
            );
        }

        drawLoadingScreen("Loading Enemy Animations...");

        for (let i = 0; i < enemyAnimation.length; i++) {
            enemyAnimation[i] = await loadImage(enemyAnimation[i]);
        }

        loadingCanvas.clearRect(0, 0, WIDTH, HEIGHT);

        startScreen();
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

    player.reset();

    player.setAnimation(playerRunningAnimation, 200);
    player.drawHealth();

    updateScore();
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
        if (bgOffset <= -WIDTH * 2) {
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
            if (player.animation != playerIdleAnimation) {
                player.setAnimation(playerIdleAnimation, 200);
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
                score += enemies[i].score;
                enemies.splice(i, 1);
                updateScore();
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

    if (keyBuffer.indexOf(keyEvent.key.toLowerCase()) == -1) {
        keyBuffer.push(keyEvent.key.toLowerCase());
    }
}
//Runs okn key release
function onKeyUp(keyEvent) {
    //Keys that do not need to be held down
    if (keyEvent.key === "Escape") {
        pauseGame();
    }
    if (keyEvent.key === "q" && gamePaused) {
        startScreen();
    }
    if (keyEvent.key === "q" && gameOver) {
        startScreen();
    }
    if (keyEvent.key === "r" && gameOver) {
        runSetup();
    }

    if (keyBuffer.indexOf(keyEvent.key.toLowerCase()) != -1) {
        keyBuffer.splice(keyBuffer.indexOf(keyEvent.key.toLowerCase()), 1);
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
        'Press "Q" to Quit',
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
        menuCanvas.fillText(
            'Press "Q" to quit',
            WIDTH / 2 - 125,
            HEIGHT / 2 + 75,
            250
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

function drawLoadingScreen(words) {
    loadingCanvas.fillStyle = "beige";
    loadingCanvas.fillRect(0, 0, WIDTH, HEIGHT);
    loadingCanvas.fillStyle = "black";
    loadingCanvas.font = "100px times-new-roman";
    loadingCanvas.fillText("Loading...", WIDTH / 2 - 200, HEIGHT / 2);
    loadingCanvas.font = "25px times-new-roman";
    loadingCanvas.fillText(words, 0, HEIGHT - 10);
}

function startScreen() {
    mainMenu = true;
    menuCanvas.fillStyle = "white";
    menuCanvas.fillRect(0, 0, WIDTH, HEIGHT);
    menuCanvas.fillStyle = "black";
    menuCanvas.font = "100px times-new-roman";
    menuCanvas.fillText("Play Game", WIDTH / 2 - 250, HEIGHT / 2 - 200);
    menuCanvas.font = "25px times-new-roman";
    menuCanvas.fillText("Press 1", WIDTH / 2 - 50, HEIGHT / 2 - 175);
    if (keyDown("1")) {
        runSetup();
    }
    if (mainMenu) {
        setTimeout(() => {
            requestAnimationFrame(startScreen);
        }, 1000 / 30);
    }
}
