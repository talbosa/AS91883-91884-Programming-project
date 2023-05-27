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
        ctx.drawImage(this.image, this.xPos, this.yPos);
    }
}
