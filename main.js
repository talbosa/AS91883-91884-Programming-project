const WIDTH = 1200;
const HEIGHT = 700;

let app;
let player;
let keyBuffer = [];

window.onload = runSetup;
window.addEventListener("keydown", onKeyDown);
window.addEventListener("keyup", onKeyUp);

let stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
//Moves the fps counter to the bottom
stats.dom.style.top = "";
stats.dom.style.bottom = "0px";

function runSetup() {
    app = new PIXI.Application({ width:WIDTH, height:HEIGHT });
    PIXI.BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.NEAREST;
    player = PIXI.Sprite.from("assets/playerrun1.png");
    player.width = 128;
    player.height = 128;

    document.body.appendChild(app.view);
    document.body.appendChild(stats.dom);
    app.stage.addChild(player);

    app.ticker.add(mainLoop);
}

function mainLoop() {
    stats.begin();
    if(keyDown("w")){
        player.y -= 5;
    }
    if(keyDown("s")){
        player.y += 5;
    }
    if(keyDown("a")){
        player.x -= 5;
    }
    if(keyDown("d")){
        player.x += 5;
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
