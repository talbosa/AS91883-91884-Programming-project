const WIDTH = 1200;
const HEIGHT = 700;
const SCROLLSPEED = 5;
const HEALTHLAYER = new PIXI.layers.Layer(new PIXI.layers.Group(10, true));
const GAMELAYER = new PIXI.layers.Layer(new PIXI.layers.Group(5, true));
const BGLAYER = new PIXI.layers.Layer(new PIXI.layers.Group(1, true));

let app;
let player;
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

let sheet;

window.onload = runSetup;
window.addEventListener("keydown", onKeyDown);
window.addEventListener("keyup", onKeyUp);

let stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
//Moves the fps counter to the bottom
stats.dom.style.top = "";
stats.dom.style.bottom = "0px";

async function runSetup() {
    app = new PIXI.Application({ width: WIDTH, height: HEIGHT });
    PIXI.BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.NEAREST;
    app.stage = new PIXI.layers.Stage();
    app.stage.sortableChildren = true;
    document.body.appendChild(app.view);
    document.body.appendChild(stats.dom);
    app.stage.addChild(HEALTHLAYER, GAMELAYER, BGLAYER);

    app.stage.addChild(LOADINGTEXT);
    sheet = await PIXI.Assets.load("assets/spritesheet.json");
    app.stage.removeChild(LOADINGTEXT);

    for (let i = 0; i < 2; i++) {
        bgImages[i] = PIXI.Sprite.from("/assets/background.jpg");
        bgImages[i].width = WIDTH * 2;
        bgImages[i].height = HEIGHT;
        BGLAYER.addChild(bgImages[i]);
    }

    player = new Player();

    app.ticker.add(mainLoop);
}

function mainLoop() {
    stats.begin();
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
        if (player.sprite.textures != sheet.animations["idle/playeridle"]) {
            player.sprite.textures = sheet.animations["idle/playeridle"];
            player.sprite.play();
        }
    } else if (player.sprite.textures != sheet.animations["run/playerrun"]) {
        player.sprite.textures = sheet.animations["run/playerrun"];
        player.sprite.play();
    }
    if (keyDown("d")) {
        player.xPos += player.moveSpeedX;
    }
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
            // updateScore();
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
