class Player{
    constructor() {
        this.sprite = PIXI.Sprite
        app.stage.addChild(this.sprite);
        this.reset();
    }

    reset() {
        this.animation = [];
        this.animationSpeedMS = 0;
        this.animationInterval;
        this.animationIndex = 0;
        this.xPos = 100;
        this.yPos = 100;
        this.width = 50;
        this.height = 128;
        this.health = 3;
        this.maxHealth = 3;
        this.shield = 0;
        this.hitBox = false;
        this.moveSpeedX = SCROLLSPEED;
        this.moveSpeedY = 10;
    }
}