class Enemy {
    constructor() {
        enemies.push(this);
        this.animationIndex = 0;
        this.image = new Image();
        this.animation = ["assets/Enemy1.png", "assets/Enemy2.png"];
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

    animate() {
        if (this.animationIndex < this.animation.length - 1) {
            this.animationIndex++;
            this.image.src = this.animation[this.animationIndex];
        } else {
            this.animationIndex = 0;
            this.image.src = this.animation[this.animationIndex];
        }
    }

    update() {
        this.xPos -= SCROLLSPEED;
        ctx.drawImage(this.image, this.xPos, this.yPos);
    }
}
