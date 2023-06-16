//  █▀▀ █▄ █ █▀▀ █▀▄▀█ █▄█   █▀▀ █   ▄▀█ █▀ █▀
//  ██▄ █ ▀█ ██▄ █ ▀ █  █    █▄▄ █▄▄ █▀█ ▄█ ▄█
// Enemy class
class Enemy {
    // Is run when a new enemy is created
    constructor() {
        enemies.push(this);
        this.sprite = new PIXI.AnimatedSprite(
            spriteSheet.animations["enemy"],
            true
        );
        this.sprite.animationSpeed = 0.1;
        GAMELAYER.addChild(this.sprite);
        this.sprite.play();
        this.sprite.x = WIDTH;
        this.sprite.y = Math.round(Math.random() * HEIGHT);
        this.sprite.width = 64;
        this.sprite.height = 64;
        this.moveSpeedY;
        this.score = 1;
        this.type; // 0 = Does not move; 1 = Moves towards players Y when in front of the player; 2 = Moves towards players X and Y when in front of the player
        if (score >= 0) {
            this.type = randomIndexFromArray([0, 0, 0, 0, 1, 1, 1, 2]);
        }
        if (score >= 50) {
            this.type = randomIndexFromArray([0, 0, 1, 1, 1, 1, 2, 2]);
        }
        if (score >= 100) {
            this.type = randomIndexFromArray([1, 1, 1, 1, 1, 2, 2, 2, 2]);
        }
        if (this.type == 1) {
            this.score = 2;
            this.moveSpeedY = 2 + score / 100;
        }
        if (this.type == 2) {
            this.score = 4;
            this.moveSpeedY = SCROLLSPEED + score / 100;
        }
    }

    // Meant to run every frame, updates and draws things related to the enamy
    update() {
        this.sprite.x -= SCROLLSPEED;
        if (this.type == 1 || this.type == 2) {
            if (
                player.yPos - this.sprite.y > this.moveSpeedY * 2 &&
                this.sprite.x + this.sprite.width > player.xPos
            ) {
                this.sprite.y += this.moveSpeedY;
            } else if (
                this.sprite.y - player.yPos > -this.moveSpeedY * 2 &&
                this.sprite.x + this.sprite.width > player.xPos
            ) {
                this.sprite.y -= this.moveSpeedY;
            }
        }
        if (this.type == 2) {
            if (this.sprite.x + this.sprite.width > player.xPos) {
                this.sprite.x -= SCROLLSPEED / 2;
            }
        }
        if (this.sprite.x < -100) {
            score += this.score;
            GAMELAYER.removeChild(this.sprite);
            enemies.splice(enemies.indexOf(this), 1);
            updateScore();
        }
        if (
            player.rectCollision(
                this.sprite.x,
                this.sprite.y,
                this.sprite.width,
                this.sprite.height
            )
        ) {
            GAMELAYER.removeChild(this.sprite);
            enemies.splice(enemies.indexOf(this), 1);
            player.damage(1);
        }
    }
}
