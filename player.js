class Player {
    constructor() {
        this.sprite = new PIXI.AnimatedSprite(
            sheet.animations["run/playerrun"],
            true
        );
        app.stage.addChild(this.sprite);
        this.sprite.play()
        this.reset();
    }

    reset() {
        this.sprite.width = 50;
        this.sprite.height = 128;
        this.sprite.animationSpeed = 0.1;
        this.sprite.x = 100;
        this.sprite.y = 100
        this.health = 3;
        this.maxHealth = 3;
        this.shield = 0;
        this.moveSpeedX = SCROLLSPEED;
        this.moveSpeedY = 10;
    }

    get xPos() {
        return this.sprite.x;
    }
    set xPos(xPos) {
        this.sprite.x = xPos;
    }
    get yPos() {
        return this.sprite.y;
    }
    set yPos(yPos) {
        this.sprite.y = yPos;
    }
    get width() {
        return this.sprite.width;
    }
    set width(width) {
        this.sprite.width = width;
    }
    get height() {
        return this.sprite.height;
    }
    set height(height) {
        this.sprite.height = height;
    }

    //Meant to run every frame, updates and draws things related to the player
    update() {
        if (this.health <= 0) {
            gameOverFunc();
        }
    }
}
