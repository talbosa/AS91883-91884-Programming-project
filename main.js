const WIDTH = 1200;
const HEIGHT = 700;
const SCROLLSPEED = 5;
const SCORELAYER = new PIXI.layers.Layer(new PIXI.layers.Group(20, true));
const HEALTHLAYER = new PIXI.layers.Layer(new PIXI.layers.Group(10, true));
const GAMELAYER = new PIXI.layers.Layer(new PIXI.layers.Group(5, true));
const BGLAYER = new PIXI.layers.Layer(new PIXI.layers.Group(1, true));
const GAMESTATES = {
    menu: 0,
    play: 1,
    pause: 2,
    nofocus: 3,
};

let app;
let player;
let hitboxCanvas;
let gameState;
let spriteSheet;
let keyBuffer = [];
let bgImages = [];
let enemies = [];
let bgOffset = 0;
let score = 0;

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
    fontSize: 25,
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

async function runSetup() {
    //Load hitbox canvas
    hitboxCanvas = document.getElementById("hitboxCanvas").getContext("2d");
    hitboxCanvas.canvas.width = WIDTH;
    hitboxCanvas.canvas.height = HEIGHT;
    //Init PIXIJS
    app = new PIXI.Application({ width: WIDTH, height: HEIGHT });
    PIXI.BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.NEAREST;
    app.stage = new PIXI.layers.Stage();
    app.stage.sortableChildren = true;
    document.body.appendChild(app.view);
    document.body.appendChild(stats.dom);
    app.stage.addChild(SCORELAYER, HEALTHLAYER, GAMELAYER, BGLAYER);

    app.stage.addChild(LOADINGTEXT);
    spriteSheet = await PIXI.Assets.load("assets/spritesheet.json");
    app.stage.removeChild(LOADINGTEXT);

    SCORELAYER.addChild(SCORETEXT);

    for (let i = 0; i < 2; i++) {
        bgImages[i] = PIXI.Sprite.from(spriteSheet.textures["background.jpg"]);
        bgImages[i].width = WIDTH * 2;
        bgImages[i].height = HEIGHT;
        BGLAYER.addChild(bgImages[i]);
    }

    player = new Player();

    app.ticker.add(mainLoop);
    spawnEnemy();
    gameState = GAMESTATES["play"];
}

function mainLoop() {
    stats.begin();
    if (gameState != GAMESTATES["play"]) return;
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
    hitboxCanvas.clearRect(0, 0, WIDTH, HEIGHT);
    //Check For enemy collision/enemy leaving screen
    for (let i = 0; i < enemies.length; i++) {
        //Workaround for problem that randomly appeared
        if (i >= enemies.length) i--;
        if (enemies.length == 0) break;
        //
        enemies[i].update();
        if (enemies[i].sprite.x < -100) {
            score += enemies[i].score;
            GAMELAYER.removeChild(enemies[i].sprite);
            enemies.splice(i, 1);
            updateScore();
        }
        //Workaround for problem that randomly appeared
        if (i >= enemies.length) i--;
        if (enemies.length == 0) break;
        //
        if (
            player.rectCollision(
                enemies[i].sprite.x,
                enemies[i].sprite.y,
                enemies[i].sprite.width,
                enemies[i].sprite.height
            )
        ) {
            GAMELAYER.removeChild(enemies[i].sprite);
            enemies.splice(i, 1);
            player.damage(1);
        }
    }

    stats.end();
}

//Spawns enemies
function spawnEnemy() {
    setTimeout(() => {
        requestAnimationFrame(spawnEnemy);
    }, 1000 - score / 100);
    if (gameState != GAMESTATES["play"]) return;
    new Enemy();
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
function randomWithProbability(probability) {
    let idx = Math.floor(Math.random() * probability.length);
    return probability[idx];
}

//Updates Score Text
function updateScore() {
    SCORETEXT.text = `Score: ${score}`;
}
