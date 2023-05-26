class Player {
    constructor() {
        this.image = new Image();
        this.healthImage = new Image();
        this.healthImages = {
            full: "assets/HeartFull.png",
            empty: "assets/HeartEmpty.png",
            shield: "assets/HeartArmour.png",
        };
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

    damage(damage) {
        while (this.shield > 0 && damage > 0) {
            this.shield--;
            damage--;
        }
        while (this.health > 0 && damage > 0) {
            this.health--;
            damage--;
        }
    }

    heal(health) {
        while (this.health < this.maxHealth && health > 0) {
            this.health++;
            health--;
        }
    }

    overheal(health) {
        while (this.health < this.maxHealth && health > 0) {
            this.health++;
            health--;
        }
        while (health > 0) {
            this.shield++;
            health--;
        }
    }

    addShield(shield) {
        this.shield += shield;
    }

    update() {
        if (this.health > this.maxHealth) {
            this.shield += this.health - this.maxHealth;
            this.health = this.maxHealth;
        }
        ctx.drawImage(
            this.image,
            0, //Offset of pixels from left of source image
            0, //Offset of pixels from top of source image
            22, //Width of pixels taken from source image
            47, //height of pixels taken from source image
            this.xPos,
            this.yPos,
            this.width,
            this.height
        );
        for (let i = 0; i < this.maxHealth + this.shield; i++) {
            if (i < this.maxHealth) {
                if (i < this.health) {
                    this.healthImage.src = this.healthImages["full"];
                    ctx.drawImage(this.healthImage, 32 * i, 0, 32, 32);
                } else {
                    this.healthImage.src = this.healthImages["empty"];
                    ctx.drawImage(this.healthImage, 32 * i, 5, 32, 27);
                }
            } else {
                this.healthImage.src = this.healthImages["shield"];
                ctx.drawImage(this.healthImage, 32 * i, 2, 32, 32);
            }
        }

        if (this.hitBox) {
            ctx.strokeStyle = "lime";
            ctx.strokeRect(this.xPos, this.yPos, this.width, this.height);
        }
    }
}
