//The player class
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
        this.hitBox = false;
        this.moveSpeedX = SCROLLSPEED;
        this.moveSpeedY = 10;
    }

    //Sets the players animation
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

    //Plays the current animation
    animate() {
        if (this.animationIndex < this.animation.length - 1) {
            this.animationIndex++;
            this.image.src = this.animation[this.animationIndex];
        } else {
            this.animationIndex = 0;
            this.image.src = this.animation[this.animationIndex];
        }
    }

    //Damages the player a apecified amount
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

    //Heals the player a specified amount
    heal(health) {
        while (this.health < this.maxHealth && health > 0) {
            this.health++;
            health--;
        }
    }

    //Heals the player the specified amount, if the amount to heal is greater then max health, it will fill up health then add shield with the remainder
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

    //Collsion with rectangle
    rectCollision(xPos, yPos, width, height) {
        let playerHitLeft = this.xPos;
        let playerHitRight = this.xPos + this.width;
        let playerHitTop = this.yPos;
        let playerHitBottom = this.yPos + this.height;

        let rectHitLeft = xPos;
        let rectHitRight = xPos + width;
        let rectHitTop = yPos;
        let rectHitBottom = yPos + height;

        let playerHitWidth = playerHitRight - playerHitLeft;
        let playerHitHeight = playerHitBottom - playerHitTop;
        let rectHitWidth = rectHitRight - rectHitLeft;
        let rectHitHeight = rectHitBottom - rectHitTop;

        //Hitboxes
        ctx.strokeStyle = "rgb(0,255,0)";
        ctx.strokeRect(
            playerHitLeft,
            playerHitTop,
            playerHitWidth,
            playerHitHeight
        );
        ctx.strokeRect(rectHitLeft, rectHitTop, rectHitWidth, rectHitHeight);

        if (
            playerHitRight > rectHitLeft &&
            playerHitLeft < rectHitRight &&
            playerHitTop < rectHitBottom &&
            playerHitBottom > rectHitTop
        ) {
            return true;
        } else {
            return false;
        }
    }

    //Directly adds shield to the player
    addShield(shield) {
        this.shield += shield;
    }

    //Meant to run every frame, updates and draws things related to the player
    update() {
        //DRAWS PLAYER
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

        //DRAWS HEALTH AND SHIELD
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

        //DRAWS HITBOX, CURRNENTLY USELESS
        if (this.hitBox) {
            ctx.strokeStyle = "lime";
            ctx.strokeRect(this.xPos, this.yPos, this.width, this.height);
        }
    }
}
