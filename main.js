const WIDTH = 1200;
const HEIGHT = 700;
const SCROLLSPEED = 5;

let app;
let player;
let keyBuffer = [];
let bgImages = [];
let bgOffset = 0;

let playerRunningAnimation = ["assets/playerrun1.png", "assets/playerrun2.png"];
let playerIdleAnimation = ["assets/playeridle1.png", "assets/playeridle2.png"];

window.onload = runSetup;
window.addEventListener("keydown", onKeyDown);
window.addEventListener("keyup", onKeyUp);

let stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
//Moves the fps counter to the bottom
stats.dom.style.top = "";
stats.dom.style.bottom = "0px";

function runSetup() {
    app = new PIXI.Application({ width: WIDTH, height: HEIGHT });
    PIXI.BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.NEAREST;

    for (let i = 0; i < 2; i++) {
        bgImages[i] = PIXI.Sprite.from("/assets/background.jpg");
        bgImages[i].width = WIDTH * 2;
        bgImages[i].height = HEIGHT;
        app.stage.addChild(bgImages[i]);
    }
    for (let i = 0; i < playerRunningAnimation.length; i++) {
        playerRunningAnimation[i] = PIXI.Texture.from(
            playerRunningAnimation[i]
        );
        playerRunningAnimation[i] = new PIXI.Texture(
            playerRunningAnimation[i],
            new PIXI.Rectangle(0, 0, 22, 47)
        );
    }

    player = new Player();
    player.setAnimation(playerRunningAnimation, 200);

    document.body.appendChild(app.view);
    document.body.appendChild(stats.dom);

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
    }
    if (keyDown("d")) {
        player.xPos += player.moveSpeedX;
    }
    stats.end();
}

//Runs on key press
function onKeyDown(keyEvent) {
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
