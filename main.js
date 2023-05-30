const WIDTH = 800;
const HEIGHT = 600;

let app;
let player;
let elapsed = 0.0;

document.onload(runSetup);

function runSetup(){
    app = new PIXI.Application({ WIDTH, HEIGHT });
    player = PIXI.Sprite.from("assets/playerrun1.png");

    document.body.appendChild(app.view);
    app.stage.addChild(player);
}

function mainLoop(){
    player.x ++
    app.ticker.add((delta) => {
        elapsed += delta;
        mainLoop();
      });
}