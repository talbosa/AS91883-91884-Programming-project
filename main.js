/**
* Title: AS91883, 91884 Programming project
* Author: Samuel Talbot
* Date: 21/07/2023
* Version: 0.9.1
* Purpose: CSC112 Externals AS91883 & 91884

Scripts used:
stats.js: https://github.com/mrdoob/stats.js
MIT - Use without restriction

pixi.js: https://github.com/pixijs/pixijs
MIT - Use without restriction

@pixi/layers: https://github.com/pixijs/layers
MIT - Use without restriction
**/

// Variables

// Screen width and height
const WIDTH = 1200;
const HEIGHT = 700;
// The speed at which the background and enemies scroll
const SCROLLSPEED = 5;
// The vertical layers that different objects occupy
const MENULAYER = new PIXI.layers.Layer(new PIXI.layers.Group(40, true));
const SCORELAYER = new PIXI.layers.Layer(new PIXI.layers.Group(20, true));
const HEALTHLAYER = new PIXI.layers.Layer(new PIXI.layers.Group(10, true));
const GAMELAYER = new PIXI.layers.Layer(new PIXI.layers.Group(5, true));
const BGLAYER = new PIXI.layers.Layer(new PIXI.layers.Group(1, true));
//  The states that the game can be in
const GAMESTATES = {
    menu: 0,
    play: 1,
    help: 2,
    pause: 3,
    nofocus: 4,
    lose: 5
};
// The variable that displays the score on the screen
const SCORETEXT = new PIXI.Text("Score: 0", {
    fontFamily: "Arial",
    fontSize: 32,
    fill: 0xffffff,
    align: "center",
});
SCORETEXT.x = WIDTH / 2 - SCORETEXT.width / 2;
SCORETEXT.y = 1;
// Adds the score txct the the score layer
SCORELAYER.addChild(SCORETEXT);

let gameScreen; // The PIXI application that all the game is conatined in (except fot the hitboxes)
let player;
let hitboxCanvas;
let gameState;
let spriteSheet;
let keyBuffer = [];
let bgImages = [];
let enemies = [];
let powerups = [];
let bgOffset = 0; // The x offset of the scrolling background
let score = 0;

window.onload = runSetup;
window.addEventListener("keydown", onKeyDown);
window.addEventListener("keyup", onKeyUp);

// Stops game when not in focus
// Runs every 200 ms
setInterval(() => {
    const HASFOCUS = document.hasFocus();
    // Checks if the game has focus and is the state "nofocus"
    if (HASFOCUS && gameState == GAMESTATES["nofocus"]) {
        gameState = GAMESTATES["play"];
        // Plays the player sprite animation
        player.sprite.play();
        // Plays all the enemies animations
        for (let i = 0; i < enemies.length; i++) {
            enemies[i].sprite.play();
        }
    }
    // Checks if the game is focused and in the "play" state
    else if (!HASFOCUS && gameState == GAMESTATES["play"]) {
        gameState = GAMESTATES["nofocus"];
        // Stops the players animation
        player.sprite.stop();
        // Stops all the enemies animations
        for (let i = 0; i < enemies.length; i++) {
            enemies[i].sprite.stop();
        }
        // Clears keybuffer to prevent ghost key presses from keys that were being held when the game lost focus
        keyBuffer = [];
    }
}, 200);

// Fps Counter
if (typeof Stats == "function") {
    // Fps counter (Global variable)
    window.stats = new Stats();
    // Makes the stats variable show the fps
    stats.showPanel(0);
    // Moves the fps counter to the bottom
    stats.dom.style.top = "";
    stats.dom.style.bottom = "0px";
}

// Runs on startup
async function runSetup() {
    // Load 2D Canvas
    hitboxCanvas = document.getElementById("hitboxCanvas").getContext("2d");
    hitboxCanvas.canvas.width = WIDTH;
    hitboxCanvas.canvas.height = HEIGHT;
    // Init PIXIJS
    gameScreen = new PIXI.Application({ width: WIDTH, height: HEIGHT });
    // Disable image antialiasing
    PIXI.BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.NEAREST;
    // Sets game stage to stage from PIXI layers extension
    gameScreen.stage = new PIXI.layers.Stage();
    // Allows the layers functionality to work by letting the children of the game stage be sortable
    gameScreen.stage.sortableChildren = true;
    // Adds the game screen to the body of the html page
    document.body.appendChild(gameScreen.view);
    if (typeof stats !== "undefined") {
        // Adds the fps counter to the body of the html page
        document.body.appendChild(stats.dom);
    }
    // Adds the game layers to the game screen
    gameScreen.stage.addChild(
        MENULAYER,
        SCORELAYER,
        HEALTHLAYER,
        GAMELAYER,
        BGLAYER
    );

    // The loading screen text
    const LOADINGTEXT = new PIXI.Text("Loading Sprite Sheet...", {
        fontFamily: "Arial",
        fontSize: 100,
        fill: 0xff1010,
        align: "center",
    });
    LOADINGTEXT.x = WIDTH / 2 - LOADINGTEXT.width / 2;
    LOADINGTEXT.y = HEIGHT / 2 - LOADINGTEXT.height / 2;
    // Adds the loading screen text to the game screen
    gameScreen.stage.addChild(LOADINGTEXT);
    // Loads the sprite sheet
    spriteSheet = await PIXI.Assets.load("assets/spritesheet.json");
    // Removes the loading screen text from the game screen
    gameScreen.stage.removeChild(LOADINGTEXT);

    // Adds the scrolling background to the background layer
    for (let i = 0; i < 2; i++) {
        bgImages[i] = PIXI.Sprite.from(spriteSheet.textures["background.jpg"]);
        bgImages[i].width = WIDTH * 2;
        bgImages[i].height = HEIGHT;
        BGLAYER.addChild(bgImages[i]);
    }

    player = new Player();

    gameState = GAMESTATES["menu"];
    // Makes the mainloop run 60 times a second
    gameScreen.ticker.add(mainLoop);
    spawnEnemy();
    spawnPowerup();
    mainMenu();
}

// Restarts the game
function restartGame() {
    score = 0;
    updateScore();
    player.reset();
    // Removes the enemies from the game
    for (let i = 0; i < enemies.length; i++) {
        GAMELAYER.removeChild(enemies[i].sprite);
    }
    enemies = [];
    // Removes the powerups from the game
    for (let i = 0; i < powerups.length; i++) {
        GAMELAYER.removeChild(powerups[i].sprite);
    }
    powerups = [];
}

// Runs every frame
function mainLoop() {
    if (typeof stats !== "undefined") {
        // Starts timing for the fps counter
        stats.begin();
    }
    // Exits the function if the game is not playing
    if (gameState !== GAMESTATES["play"]) return;
    // Moves the backgroud
    bgOffset -= SCROLLSPEED;
    bgImages[0].x = bgOffset;
    bgImages[1].x = bgOffset + WIDTH * 2;
    if (bgOffset < -WIDTH * 2) {
        bgOffset = 0;
    }

    // Player movement
    if (keyDown("w")) {
        player.yPos -= player.moveSpeedY;
    }
    if (keyDown("s")) {
        player.yPos += player.moveSpeedY;
    }
    if (keyDown("a")) {
        player.xPos -= player.moveSpeedX;
        // Changes the player animation to "playeridle"
        if (player.sprite.textures != spriteSheet.animations["playeridle"]) {
            player.sprite.textures = spriteSheet.animations["playeridle"];
            player.sprite.play();
        }
    }
    // Changes the player animation to "playerun"
    else if (player.sprite.textures != spriteSheet.animations["playerrun"]) {
        player.sprite.textures = spriteSheet.animations["playerrun"];
        player.sprite.play();
    }
    if (keyDown("d")) {
        player.xPos += player.moveSpeedX;
    }
    // Clear hitboxes from previous frame
    hitboxCanvas.clearRect(0, 0, WIDTH, HEIGHT);

    player.update();
    for (let i = 0; i < enemies.length; i++) {
        enemies[i].update();
    }
    for (let i = 0; i < powerups.length; i++) {
        powerups[i].update();
    }

    if (typeof stats !== "undefined") {
        // Stop the timing for the fps counter
        stats.end();
    }
}

// Enemy spawn timer
function spawnEnemy() {
    // Rerun spawnEnemy on a timer
    setTimeout(() => {
        requestAnimationFrame(spawnEnemy);
    }, 1000 - score / 100);
    // Exits the function if the game is not playing
    if (gameState != GAMESTATES["play"]) return;
    new Enemy();
}

// Powerup spawn timer
function spawnPowerup() {
    // Rerun spawnPowerup on a timer
    setTimeout(() => {
        requestAnimationFrame(spawnPowerup);
    }, 10000 - score / 100);
    // Exits the function if the game is not playing
    if (gameState != GAMESTATES["play"]) return;
    new PowerUp();
}

// Runs on key down
function onKeyDown(keyEvent) {
    // Add key to key buffer if it is not already in buffer
    if (keyBuffer.indexOf(keyEvent.key.toLowerCase()) == -1) {
        keyBuffer.push(keyEvent.key.toLowerCase());
    }
}

// Runs on key up
function onKeyUp(keyEvent) {
    // Keys that do not need to be held

    // Pause game if escape is released
    if (keyEvent.key === "Escape") {
        togglePause();
    }
    // Return to main menu if q is released while the gamestate is either "pause", "lose", or "help"
    if (
        keyEvent.key.toLowerCase() === "q" &&
        (gameState === GAMESTATES["pause"] ||
            gameState === GAMESTATES["lose"] ||
            gameState === GAMESTATES["help"])
    ) {
        gameState = GAMESTATES["menu"];
        MENULAYER.removeChildren();
        // Clear hitboxes
        hitboxCanvas.clearRect(0, 0, WIDTH, HEIGHT);
        mainMenu();
    }
    // Restart game if gamestate is "lose"
    if (
        keyEvent.key.toLowerCase() === "r" &&
        gameState === GAMESTATES["lose"]
    ) {
        gameState = GAMESTATES["play"];
        MENULAYER.removeChildren();
        restartGame();
    }
    // Play game if gamestate is "menu"
    if (keyEvent.key === "1" && gameState === GAMESTATES["menu"]) {
        gameState = GAMESTATES["play"];
        MENULAYER.removeChildren();
        restartGame();
    }
    // Show help screen if gamestate is "menu"
    if (keyEvent.key === "2" && gameState === GAMESTATES["menu"]) {
        gameState = GAMESTATES["help"];
        MENULAYER.removeChildren();
        helpScreen();
    }
    // Toggle hitboxes
    if (
        keyEvent.key.toLowerCase() === "h" &&
        gameState === GAMESTATES["play"]
    ) {
        if (player.showHitbox == false){
            player.showHitbox = true;
        }else{
            player.showHitbox = false;
        }
    }
    // Remove key from keybuffer if it exists
    if (keyBuffer.indexOf(keyEvent.key.toLowerCase()) != -1) {
        keyBuffer.splice(keyBuffer.indexOf(keyEvent.key.toLowerCase()), 1);
    }
}

// Check if key is held
function keyDown(key) {
    // Check if a key is in keybuffer
    if (keyBuffer.lastIndexOf(key) != -1) {
        return true;
    } else {
        return false;
    }
}

// Return random index of array
function randomIndexFromArray(inputArray) {
    let randomIndexOfInputArray = Math.floor(Math.random() * inputArray.length);
    return inputArray[randomIndexOfInputArray];
}

// Updates score text
function updateScore() {
    SCORETEXT.text = `Score: ${score}`;
}

// Main menu
function mainMenu() {
    // Clear menulayer
    MENULAYER.removeChildren();
    // Fill background with beige
    const DRAWTOOL = new PIXI.Graphics();
    DRAWTOOL.beginFill("beige");
    DRAWTOOL.drawRect(0, 0, WIDTH, HEIGHT);
    DRAWTOOL.endFill();
    MENULAYER.addChild(DRAWTOOL);
    // Initialise text variables
    const MENUTEXT1 = new PIXI.Text("Play Game", {
        fontFamily: "Arial",
        fontSize: 100,
        fill: 0x000000,
        align: "center",
    });
    MENUTEXT1.x = WIDTH / 2 - 250;
    MENUTEXT1.y = HEIGHT / 2 - 200 - MENUTEXT1.height / 1.24;

    const MENUTEXT2 = new PIXI.Text("Press 1", {
        fontFamily: "Arial",
        fontSize: 25,
        fill: 0x000000,
        align: "center",
    });
    MENUTEXT2.x = WIDTH / 2 - MENUTEXT2.width / 2;
    MENUTEXT2.y = HEIGHT / 2 - 175 - MENUTEXT2.height / 1.24;

    const MENUTEXT3 = new PIXI.Text("Help", {
        fontFamily: "Arial",
        fontSize: 100,
        fill: 0x000000,
        align: "center",
    });
    MENUTEXT3.x = WIDTH / 2 - MENUTEXT3.width / 2;
    MENUTEXT3.y = HEIGHT / 2 - 75 - MENUTEXT3.height / 1.24;

    const MENUTEXT4 = new PIXI.Text("Press 2", {
        fontFamily: "Arial",
        fontSize: 25,
        fill: 0x000000,
        align: "center",
    });
    MENUTEXT4.x = WIDTH / 2 - MENUTEXT4.width / 2;
    MENUTEXT4.y = HEIGHT / 2 - 50 - MENUTEXT4.height / 1.24;
    // Add text to menu layer
    MENULAYER.addChild(MENUTEXT1, MENUTEXT2, MENUTEXT3, MENUTEXT4);
}

// Tutorial screen
function helpScreen() {
    gameState = GAMESTATES["help"];
    // Clear menu layer
    MENULAYER.removeChildren();
    // Fill background with beige
    const DRAWTOOL = new PIXI.Graphics();
    DRAWTOOL.beginFill("beige");
    DRAWTOOL.drawRect(0, 0, WIDTH, HEIGHT);
    DRAWTOOL.endFill();
    MENULAYER.addChild(DRAWTOOL);
    // Initialise text variables
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

    const HELPTEXT5 = new PIXI.Text('Press "Escape" to pause', {
        fontFamily: "Arial",
        fontSize: 40,
        fill: 0x000000,
        align: "center",
    });
    HELPTEXT5.x = WIDTH / 2 - HELPTEXT5.width / 2;
    HELPTEXT5.y = HEIGHT / 2 + 60 - HELPTEXT5.height / 2;

    const HELPTEXT6 = new PIXI.Text('Press "H" while game running toggle hitboxes', {
        fontFamily: "Arial",
        fontSize: 40,
        fill: 0x000000,
        align: "center",
    });
    HELPTEXT6.x = WIDTH / 2 - HELPTEXT6.width / 2;
    HELPTEXT6.y = HEIGHT / 2 + 110 - HELPTEXT6.height / 2;

    // Add text to menu layer
    MENULAYER.addChild(HELPTEXT1, HELPTEXT2, HELPTEXT3, HELPTEXT4, HELPTEXT5, HELPTEXT6);
}

// Toggles game pause and draws pause sceen
function togglePause() {
    if (gameState === GAMESTATES["pause"]) {
        // Play player animation
        player.sprite.play();
        // Play enemies animatoins
        for (let i = 0; i < enemies.length; i++) {
            enemies[i].sprite.play();
        }
        gameState = GAMESTATES["play"];
        // Clear menulayer
        MENULAYER.removeChildren();
    } else if (gameState === GAMESTATES["play"]) {
        // Stop player animation
        player.sprite.stop();
        // Stop enemies animations
        for (let i = 0; i < enemies.length; i++) {
            enemies[i].sprite.stop();
        }
        gameState = GAMESTATES["pause"];
        // Clear menulayer
        MENULAYER.removeChildren();
        // Initialise text variables
        const PAUSETEXT1 = new PIXI.Text("Game Paused", {
            fontFamily: "Arial",
            fontSize: 75,
            fill: 0xffffff,
            align: "center",
        });
        PAUSETEXT1.x = WIDTH / 2 - PAUSETEXT1.width / 2;
        PAUSETEXT1.y = HEIGHT / 2 - 100 - PAUSETEXT1.height / 2;

        const PAUSETEXT2 = new PIXI.Text('Press "Escape" to unpause', {
            fontFamily: "Arial",
            fontSize: 50,
            fill: 0xffffff,
            align: "center",
        });
        PAUSETEXT2.x = WIDTH / 2 - PAUSETEXT2.width / 2;
        PAUSETEXT2.y = HEIGHT / 2 - 40 - PAUSETEXT2.height / 2;

        const PAUSETEXT3 = new PIXI.Text('Press "Q" to quit', {
            fontFamily: "Arial",
            fontSize: 50,
            fill: 0xffffff,
            align: "center",
        });
        PAUSETEXT3.x = WIDTH / 2 - PAUSETEXT3.width / 2;
        PAUSETEXT3.y = HEIGHT / 2 + 10 - PAUSETEXT3.height / 2;

        // Add text to menu layer
        MENULAYER.addChild(PAUSETEXT1, PAUSETEXT2, PAUSETEXT3);
    }
}

// Game over screen
function gameOver() {
    // Stop player animation
    player.sprite.stop();
    // Stop enemies animations
    for (let i = 0; i < enemies.length; i++) {
        enemies[i].sprite.stop();
    }
    gameState = GAMESTATES["lose"];
    // Clear menulayer
    MENULAYER.removeChildren();
    // Initialise text variables
    const LOSETEXT1 = new PIXI.Text("Game Over", {
        fontFamily: "Arial",
        fontSize: 150,
        fill: 0xffffff,
        align: "center",
    });
    LOSETEXT1.x = WIDTH / 2 - LOSETEXT1.width / 2;
    LOSETEXT1.y = HEIGHT / 2 - 200 - LOSETEXT1.height / 2;

    const LOSETEXT2 = new PIXI.Text(`Final Score: ${score}`, {
        fontFamily: "Arial",
        fontSize: 75,
        fill: 0xffffff,
        align: "center",
    });
    LOSETEXT2.x = WIDTH / 2 - LOSETEXT2.width / 2;
    LOSETEXT2.y = HEIGHT / 2 - 100 - LOSETEXT2.height / 2;

    const LOSETEXT3 = new PIXI.Text('Press "R" to Restart', {
        fontFamily: "Arial",
        fontSize: 50,
        fill: 0xffffff,
        align: "center",
    });
    LOSETEXT3.x = WIDTH / 2 - LOSETEXT3.width / 2;
    LOSETEXT3.y = HEIGHT / 2 - 40 - LOSETEXT3.height / 2;

    const LOSETEXT4 = new PIXI.Text('Press "Q" to quit', {
        fontFamily: "Arial",
        fontSize: 50,
        fill: 0xffffff,
        align: "center",
    });
    LOSETEXT4.x = WIDTH / 2 - LOSETEXT4.width / 2;
    LOSETEXT4.y = HEIGHT / 2 + 10 - LOSETEXT4.height / 2;

    // Add text to menu layer
    MENULAYER.addChild(LOSETEXT1, LOSETEXT2, LOSETEXT3, LOSETEXT4);
}
