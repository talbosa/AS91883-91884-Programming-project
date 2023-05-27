//Enemy class
class Enemy {
    //Is run when a new enemy is created
    constructor() {
        enemies.push(this);
        this.image = new Image();
        this.animation = ["assets/Enemy1.png", "assets/Enemy2.png"];
        this.animationIndex = 0;
        this.xPos = WIDTH;
        this.yPos = Math.random() * HEIGHT;
        this.width = 64;
        this.height = 64;
        this.animationSpeedMS = 200;
        this.moveSpeedY = 2;
        this.type = randomWithProbability([0,0,0,1,1]); // 0 = Does not move; 1 = Moves towards players Y when above the player;
        console.log(this.type);
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
            this.image = await loadImage(this.animation[this.animationIndex]);
        } else {
            this.animationIndex = 0;
            this.image = await loadImage(this.animation[this.animationIndex]);
        }
    }

    //Meant to run every frame, updates and draws things related to the enamy
    update() {
        this.xPos -= SCROLLSPEED;
        if (this.type == 1) {
            if (this.yPos < player.yPos && this.xPos > player.xPos) {
                this.yPos += this.moveSpeedY;
            } else if (this.xPos > player.xPos) {
                this.yPos -= this.moveSpeedY;
            }
        }
        ctx.drawImage(this.image, this.xPos, this.yPos);
    }
}
