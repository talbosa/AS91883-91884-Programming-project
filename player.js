class Player {
    constructor() {
        this.image = new Image();
        this.animation = [];
        this.animationSpeedMS = 0;
        this.animationIndex = 0;
        // lst
    }

    setAnimation(animation, animationSpeedMS) {
        this.animation = animation;
        this.animationSpeedMS = animationSpeedMS;
        this.animate();
        setInterval(
            function () {
                this.animate();
            }.bind(this),
            this.animationSpeedMS
        );
    }

    animate() {
        console.log(this.animationIndex);
        if (this.animationIndex < this.animation.length - 1) {
            this.animationIndex++;
            this.image.src = this.animation[this.animationIndex];
        } else {
            this.animationIndex = 0;
            this.image.src = this.animation[this.animationIndex];
        }
        console.log(this.animationIndex);
    }

    update() {
        ctx.drawImage(this.image, xPos, 100, 128,128);
    }
}
