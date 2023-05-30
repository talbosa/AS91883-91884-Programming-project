//Enemy class
class Enemy {
    //Is run when a new enemy is created
    constructor() {
        enemies.push(this);
        this.image = new Image();
        this.animation = enemyAnimation;
        this.animationIndex = 0;
        this.xPos = WIDTH;
        this.yPos = Math.round(Math.random() * HEIGHT);
        this.width = 64;
        this.height = 64;
        this.animationSpeedMS = 200;
        this.moveSpeedY;
        this.score = 1;
        this.type; // 0 = Does not move; 1 = Moves towards players Y when in front of the player; 2 = Moves towards players X and Y when in front of the player
        if (score >= 0) {
            this.type = randomWithProbability([0, 0, 0, 0, 1, 1, 1, 2]);
        }
        if (score >= 50) {
            this.type = randomWithProbability([0, 0, 1, 1, 1, 1, 2, 2]);
        }
        if (score >= 100) {
            this.type = randomWithProbability([1, 1, 1, 1, 1, 2, 2, 2, 2]);
        }
        if (this.type == 1) {
            this.score = 2;
            this.moveSpeedY = 2 + score / 100;
        }
        if (this.type == 2) {
            this.score = 4;
            this.moveSpeedY = SCROLLSPEED + score / 100;
        }
        setInterval(
            function () {
                this.animate();
            }.bind(this),
            this.animationSpeedMS
        );
    }

    //Runs the enemies animation
    async animate() {
        if (this.animationIndex < this.animation.length - 1) {
            this.animationIndex++;
            this.image = this.animation[this.animationIndex];
        } else {
            this.animationIndex = 0;
            this.image = this.animation[this.animationIndex];
        }
    }

    //Meant to run every frame, updates and draws things related to the enamy
    update() {
        this.xPos -= SCROLLSPEED;
        if (this.type == 1 || this.type == 2) {
            if (
                player.yPos - this.yPos > this.moveSpeedY * 2 &&
                this.xPos + this.width > player.xPos
            ) {
                this.yPos += this.moveSpeedY;
            } else if (
                this.yPos - player.yPos > -this.moveSpeedY * 2 &&
                this.xPos + this.width > player.xPos
            ) {
                this.yPos -= this.moveSpeedY;
            }
        }
        if (this.type == 2) {
            if (this.xPos + this.width > player.xPos) {
                this.xPos -= SCROLLSPEED / 2;
            }
        }
        gameCanvas.drawImage(this.image, Math.round(this.xPos), Math.round(this.yPos));
    }
}
