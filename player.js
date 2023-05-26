class Player {
    constructor() {
        this.image = new Image();
        this.animation = [];
        this.animationSpeedMS = 0;
        this.animationInterval;
        this.animationIndex = 0;
        this.xPos = 100;
        this.yPos = 100;
        this.width = 128;
        this.height = 128;
        this.health = 3;
        this.hitBox = true;
    }

    setAnimation(animation, animationSpeedMS) {
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
        ctx.drawImage(
            this.image,
            this.xPos,
            this.yPos,
            this.width,
            this.height
        );
        if(this.hitBox){
            ctx.fillStyle = "green";
            ctx.strokeRect(this.xPos, this.yPos, this.width, this.height)
        }
    }
}
