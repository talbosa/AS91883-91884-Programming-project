class Player {
    constructor() {
        this.sprite = new PIXI.Sprite();
        app.stage.addChild(this.sprite);
        this.reset();
    }
    
    reset() {
        this.sprite.width = 50;
        this.sprite.height = 128;
        this.sprite.x = 100;
        this.sprite.y = 100;
        this.animation = [];
        this.animationSpeedMS = 0;
        this.animationInterval;
        this.animationIndex = 0;
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

    //Sets the players animation
    async setAnimation(animation, animationSpeedMS) {
        this.animation = animation;
        this.animationSpeedMS = animationSpeedMS;
        this.animate();
        clearInterval(this.animationInterval);
        this.animationInterval = setInterval(
            function () {
                this.animate();
            }.bind(this),
            this.animationSpeedMS
        );
    }

    //Plays the current animation
    animate() {
        if (this.animationIndex < this.animation.length - 1) {
            this.animationIndex++;
            this.sprite.texture = this.animation[this.animationIndex];
        } else {
            this.animationIndex = 0;
            this.sprite.texture = this.animation[this.animationIndex];
        }
    }

    //Meant to run every frame, updates and draws things related to the player
    update() {
        if (this.health <= 0) {
            gameOverFunc();
        }
    }
}
