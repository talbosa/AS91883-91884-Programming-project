const WIDTH = 1200;
const HEIGHT = 700;
const SCROLLSPEED = 5;
const MENULAYER = new PIXI.layers.Layer(new PIXI.layers.Group(40, true));
const SCORELAYER = new PIXI.layers.Layer(new PIXI.layers.Group(20, true));
const HEALTHLAYER = new PIXI.layers.Layer(new PIXI.layers.Group(10, true));
const GAMELAYER = new PIXI.layers.Layer(new PIXI.layers.Group(5, true));
const BGLAYER = new PIXI.layers.Layer(new PIXI.layers.Group(1, true));
const GAMESTATES = {
    menu: 0,
    play: 1,
    help: 2,
    pause: 3,
    nofocus: 4,
    lose: 5,
};

let app;
let player;
let hitboxCanvas;
let menuCanvas;
let gameState;
let spriteSheet;
let keyBuffer = [];
let bgImages = [];
let enemies = [];
let powerups = [];
let bgOffset = 0;
let score = 0;
let hasRun = false;

const LOADINGTEXT = new PIXI.Text("Loading Sprite Sheet...", {
    fontFamily: "Arial",
    fontSize: 100,
    fill: 0xff1010,
    align: "center",
});
LOADINGTEXT.x = WIDTH / 2 - LOADINGTEXT.width / 2;
LOADINGTEXT.y = HEIGHT / 2 - LOADINGTEXT.height / 2;

const SCORETEXT = new PIXI.Text(`Score: ${score}`, {
    fontFamily: "Arial",
    fontSize: 32,
    fill: 0x000000,
    align: "center",
});
SCORETEXT.x = WIDTH / 2 - SCORETEXT.width / 2;
SCORETEXT.y = 1;

window.onload = runSetup;
window.addEventListener("keydown", onKeyDown);
window.addEventListener("keyup", onKeyUp);

setInterval(() => {
    const HASFOCUS = document.hasFocus();
    if (HASFOCUS && gameState == GAMESTATES["nofocus"]) {
        gameState = GAMESTATES["play"];
    } else if (!HASFOCUS && gameState == GAMESTATES["play"]) {
        gameState = GAMESTATES["nofocus"];
    }
}, 200);

let stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
//Moves the fps counter to the bottom
stats.dom.style.top = "";
stats.dom.style.bottom = "0px";

//Runs on startup
async function runSetup() {
    if (!hasRun) {
        hasRun = true;
        //Load 2D Canvas
        hitboxCanvas = document.getElementById("hitboxCanvas").getContext("2d");
        hitboxCanvas.canvas.width = WIDTH;
        hitboxCanvas.canvas.height = HEIGHT;
        menuCanvas = document.getElementById("menuCanvas").getContext("2d");
        menuCanvas.canvas.width = WIDTH;
        menuCanvas.canvas.height = HEIGHT;
        //Init PIXIJS
        app = new PIXI.Application({ width: WIDTH, height: HEIGHT });
        PIXI.BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.NEAREST;
        PIXI.settings.ROUND_PIXELS = true;
        app.stage = new PIXI.layers.Stage();
        app.stage.sortableChildren = true;
        document.body.appendChild(app.view);
        document.body.appendChild(stats.dom);
        app.stage.addChild(
            MENULAYER,
            SCORELAYER,
            HEALTHLAYER,
            GAMELAYER,
            BGLAYER
        );

        app.stage.addChild(LOADINGTEXT);
        spriteSheet = await PIXI.Assets.load("assets/spritesheet.json");
        app.stage.removeChild(LOADINGTEXT);

        SCORELAYER.addChild(SCORETEXT);

        for (let i = 0; i < 2; i++) {
            bgImages[i] = PIXI.Sprite.from(
                spriteSheet.textures["background.jpg"]
            );
            bgImages[i].width = WIDTH * 2;
            bgImages[i].height = HEIGHT;
            BGLAYER.addChild(bgImages[i]);
        }

        player = new Player();

        gameState = GAMESTATES["menu"];
        app.ticker.add(mainLoop);
        spawnEnemy();
        spawnPowerup();
        mainMenu();
    }
    score = 0;
    updateScore();
    player.reset();
    for (let i = 0; i < enemies.length; i++) {
        GAMELAYER.removeChild(enemies[i].sprite);
    }
    enemies = [];
    for (let i = 0; i < powerups.length; i++) {
        GAMELAYER.removeChild(powerups[i].sprite);
    }
    powerups = [];
}

//Runs every frame
function mainLoop() {
    stats.begin();
    if (gameState !== GAMESTATES["play"]) return;
    bgOffset -= SCROLLSPEED;
    bgImages[0].x = bgOffset;
    bgImages[1].x = bgOffset + WIDTH * 2;
    if (bgOffset < -WIDTH * 2) {
        bgOffset = 0;
    }

    if (keyDown("w")) {
        player.yPos -= player.moveSpeedY;
    }
    if (keyDown("s")) {
        player.yPos += player.moveSpeedY;
    }
    if (keyDown("a")) {
        player.xPos -= player.moveSpeedX;
        if (player.sprite.textures != spriteSheet.animations["playeridle"]) {
            player.sprite.textures = spriteSheet.animations["playeridle"];
            player.sprite.play();
        }
    } else if (player.sprite.textures != spriteSheet.animations["playerrun"]) {
        player.sprite.textures = spriteSheet.animations["playerrun"];
        player.sprite.play();
    }
    if (keyDown("d")) {
        player.xPos += player.moveSpeedX;
    }
    //Clear hitboxes from previous frame
    hitboxCanvas.clearRect(0, 0, WIDTH, HEIGHT);
    //Update Player
    player.update();
    //Update Enemies
    for (let i = 0; i < enemies.length; i++) {
        enemies[i].update();
    }
    //Update Powerups
    for (let i = 0; i < powerups.length; i++) {
        powerups[i].update();
    }

    stats.end();
}

function tutorialScreen() {
    gameState = GAMESTATES["help"];
    MENULAYER.removeChildren();
    const DRAWTOOL = new PIXI.Graphics();
    DRAWTOOL.beginFill(0xf5f5dc);
    DRAWTOOL.drawRect(0, 0, WIDTH, HEIGHT);
    DRAWTOOL.endFill();
    MENULAYER.addChild(DRAWTOOL);
    const HELPTEXT1 = new PIXI.Text('Press "Q" to go back', {
        fontFamily: "Arial",
        fontSize: 50,
        fill: 0x000000,
        align: "center",
    });
    HELPTEXT1.x = 0;
    HELPTEXT1.y = 0;
    const HELPTEXT2 = new PIXI.Text(`Press W,A,S,D to move`, {
        fontFamily: "Arial",
        fontSize: 40,
        fill: 0x000000,
        align: "center",
    });
    HELPTEXT2.x = WIDTH / 2 - HELPTEXT2.width / 2;
    HELPTEXT2.y = HEIGHT / 2 - 90 - HELPTEXT2.height / 2;
    const HELPTEXT3 = new PIXI.Text("Dodge the enemies", {
        fontFamily: "Arial",
        fontSize: 40,
        fill: 0x000000,
        align: "center",
    });
    HELPTEXT3.x = WIDTH / 2 - HELPTEXT3.width / 2;
    HELPTEXT3.y = HEIGHT / 2 - 40 - HELPTEXT3.height / 2;
    const HELPTEXT4 = new PIXI.Text("Collect powerups", {
        fontFamily: "Arial",
        fontSize: 40,
        fill: 0x000000,
        align: "center",
    });
    HELPTEXT4.x = WIDTH / 2 - HELPTEXT4.width / 2;
    HELPTEXT4.y = HEIGHT / 2 + 10 - HELPTEXT4.height / 2;
    MENULAYER.addChild(HELPTEXT1, HELPTEXT2, HELPTEXT3, HELPTEXT4);
}

//Spawns enemies
function spawnEnemy() {
    setTimeout(() => {
        requestAnimationFrame(spawnEnemy);
    }, 1000 - score / 100);
    if (gameState != GAMESTATES["play"]) return;
    new Enemy();
}

//Spawns Powerups
function spawnPowerup() {
    setTimeout(() => {
        requestAnimationFrame(spawnPowerup);
    }, 10000 - score / 100);
    if (gameState != GAMESTATES["play"]) return;
    new PowerUp();
}

//Runs on key press
function onKeyDown(keyEvent) {
    if (keyBuffer.indexOf(keyEvent.key.toLowerCase()) == -1) {
        keyBuffer.push(keyEvent.key.toLowerCase());
    }
}
//Runs okn key release
function onKeyUp(keyEvent) {
    //Keys that do not need to be held
    if (keyEvent.key === "Escape") {
        togglePause();
    }
    if (
        keyEvent.key.toLowerCase() === "q" &&
        (gameState === GAMESTATES["pause"] ||
            gameState === GAMESTATES["lose"] ||
            gameState === GAMESTATES["help"])
    ) {
        gameState = GAMESTATES["menu"];
        MENULAYER.removeChildren();
        mainMenu();
    }
    if (
        keyEvent.key.toLowerCase() === "r" &&
        gameState === GAMESTATES["lose"]
    ) {
        gameState = GAMESTATES["play"];
        MENULAYER.removeChildren();
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

//Returns a random index from an input list
function randomIndexFromArray(probability) {
    let idx = Math.floor(Math.random() * probability.length);
    return probability[idx];
}

//Updates Score Text
function updateScore() {
    SCORETEXT.text = `Score: ${score}`;
}

//Draws Main menu
function mainMenu() {
    menuCanvas.fillStyle = "beige";
    menuCanvas.fillRect(0, 0, WIDTH, HEIGHT);
    menuCanvas.fillStyle = "black";
    menuCanvas.font = "100px Arial";
    menuCanvas.fillText("Play Game", WIDTH / 2 - 250, HEIGHT / 2 - 200);
    menuCanvas.font = "25px Arial";
    menuCanvas.fillText("Press 1", WIDTH / 2 - 50, HEIGHT / 2 - 175);

    menuCanvas.font = "100px Arial";
    menuCanvas.fillText("Help", WIDTH / 2 - 100, HEIGHT / 2 - 75);
    menuCanvas.font = "25px Arial";
    menuCanvas.fillText("Press 2", WIDTH / 2 - 50, HEIGHT / 2 - 50);
    if (keyDown("1")) {
        gameState = GAMESTATES["play"];
        runSetup();
    }
    if (keyDown("2")) {
        runSetup();
        tutorialScreen();
    }
    if (gameState === GAMESTATES["menu"]) {
        setTimeout(() => {
            requestAnimationFrame(mainMenu);
        }, 1000 / 60);
    } else {
        menuCanvas.clearRect(0, 0, WIDTH, HEIGHT);
    }
}

//Pauses and unpauses the game
function togglePause() {
    if (gameState === GAMESTATES["pause"]) {
        player.sprite.play();
        for (let i = 0; i < enemies.length; i++) {
            enemies[i].sprite.play();
        }
        gameState = GAMESTATES["play"];
        MENULAYER.removeChildren();
    } else if (gameState === GAMESTATES["play"]) {
        player.sprite.stop();
        for (let i = 0; i < enemies.length; i++) {
            enemies[i].sprite.stop();
        }
        gameState = GAMESTATES["pause"];
        MENULAYER.removeChildren();
        const PAUSETEXT1 = new PIXI.Text("Game Paused", {
            fontFamily: "Arial",
            fontSize: 75,
            fill: 0x000000,
            align: "center",
        });
        PAUSETEXT1.x = WIDTH / 2 - PAUSETEXT1.width / 2;
        PAUSETEXT1.y = HEIGHT / 2 - 100 - PAUSETEXT1.height / 2;
        const PAUSETEXT2 = new PIXI.Text('Press "Escape" to unpause', {
            fontFamily: "Arial",
            fontSize: 50,
            fill: 0x000000,
            align: "center",
        });
        PAUSETEXT2.x = WIDTH / 2 - PAUSETEXT2.width / 2;
        PAUSETEXT2.y = HEIGHT / 2 - 40 - PAUSETEXT2.height / 2;
        const PAUSETEXT3 = new PIXI.Text('Press "Q" to quit', {
            fontFamily: "Arial",
            fontSize: 50,
            fill: 0x000000,
            align: "center",
        });
        PAUSETEXT3.x = WIDTH / 2 - PAUSETEXT3.width / 2;
        PAUSETEXT3.y = HEIGHT / 2 + 10 - PAUSETEXT3.height / 2;
        MENULAYER.addChild(PAUSETEXT1, PAUSETEXT2, PAUSETEXT3);
    }
}

function gameOver() {
    gameState = GAMESTATES["lose"];
    MENULAYER.removeChildren();
    const LOSETEXT1 = new PIXI.Text("Game Over", {
        fontFamily: "Arial",
        fontSize: 150,
        fill: 0x000000,
        align: "center",
    });
    LOSETEXT1.x = WIDTH / 2 - LOSETEXT1.width / 2;
    LOSETEXT1.y = HEIGHT / 2 - 200 - LOSETEXT1.height / 2;
    const LOSETEXT2 = new PIXI.Text(`Final Score: ${score}`, {
        fontFamily: "Arial",
        fontSize: 75,
        fill: 0x000000,
        align: "center",
    });
    LOSETEXT2.x = WIDTH / 2 - LOSETEXT2.width / 2;
    LOSETEXT2.y = HEIGHT / 2 - 100 - LOSETEXT2.height / 2;
    const LOSETEXT3 = new PIXI.Text('Press "R" to Restart', {
        fontFamily: "Arial",
        fontSize: 50,
        fill: 0x000000,
        align: "center",
    });
    LOSETEXT3.x = WIDTH / 2 - LOSETEXT3.width / 2;
    LOSETEXT3.y = HEIGHT / 2 - 40 - LOSETEXT3.height / 2;
    const LOSETEXT4 = new PIXI.Text('Press "Q" to quit', {
        fontFamily: "Arial",
        fontSize: 50,
        fill: 0x000000,
        align: "center",
    });
    LOSETEXT4.x = WIDTH / 2 - LOSETEXT4.width / 2;
    LOSETEXT4.y = HEIGHT / 2 + 10 - LOSETEXT4.height / 2;
    MENULAYER.addChild(LOSETEXT1, LOSETEXT2, LOSETEXT3, LOSETEXT4);
}
