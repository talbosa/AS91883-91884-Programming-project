// Player class
class Player {
    constructor() {
        // Create player animated sprite
        this.sprite = new PIXI.AnimatedSprite(
            spriteSheet.animations["playerrun"],
            true
        );
        // Add player animated sprite to game layer
        GAMELAYER.addChild(this.sprite);
        // Initialise player variables
        this.reset();
    }

    // Can be used to manually reset the player
    reset() {
        // Play sprite animation
        this.sprite.play();
        this.sprite.width = 50;
        this.sprite.height = 128;
        this.sprite.animationSpeed = 0.1;
        this.sprite.x = 100;
        this.sprite.y = 100;
        this.health = 3;
        this.maxHealth = 3;
        this.healthSprites = [];
        this.shield = 0;
        this.moveSpeedX = SCROLLSPEED;
        this.moveSpeedY = 10;
        this.showHitbox = false;
        this.drawHealth();
    }

    // Get/Set methods for player attributes held by player.sprite for convenience
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

    // Damages the player a apecified amount
    damage(damage) {
        while (this.shield > 0 && damage > 0) {
            this.shield--;
            damage--;
        }
        while (this.health > 0 && damage > 0) {
            this.health--;
            damage--;
        }
        this.drawHealth();
    }

    // Bypasses the players shield to deal damage directly
    damageIgnoreShield(damage) {
        while (this.health > 0 && damage > 0) {
            this.health--;
            damage--;
        }
        this.drawHealth();
    }

    // Damages sheild but does not affect health
    damageShield(damage) {
        while (this.shield > 0 && damage > 0) {
            this.shield--;
            damage--;
        }
        this.drawHealth();
    }

    // Heals the player a specified amount
    heal(health) {
        while (this.health < this.maxHealth && health > 0) {
            this.health++;
            health--;
        }
        this.drawHealth();
    }

    // Heals the player the specified amount, if the amount to heal is greater then max health, it will fill up health then add shield with the remainder
    overheal(health) {
        while (this.health < this.maxHealth && health > 0) {
            this.health++;
            health--;
        }
        while (health > 0) {
            this.shield++;
            health--;
        }
        this.drawHealth();
    }

    // Directly adds shield to the player
    addShield(shield) {
        this.shield += shield;
        this.drawHealth();
    }

    // Collsion with rectangle
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

        // Hitboxes using 2d canvas
        if (this.showHitbox) {
            hitboxCanvas.strokeStyle = "rgb(0,255,0)";
            hitboxCanvas.lineWidth = 2;
            hitboxCanvas.strokeRect(
                playerHitLeft,
                playerHitTop,
                playerHitWidth,
                playerHitHeight
            );
            hitboxCanvas.strokeRect(
                rectHitLeft,
                rectHitTop,
                rectHitWidth,
                rectHitHeight
            );
        }

        // Part that actually detects collision
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

    // Updates the health display
    drawHealth() {
        // Clear health layer
        HEALTHLAYER.removeChildren();
        for (let i = 0; i < this.maxHealth + this.shield; i++) {
            if (i < this.maxHealth) {
                // Set texture to full heart if i is less than health
                if (i < this.health) {
                    this.healthSprites[i] = PIXI.Sprite.from(
                        spriteSheet.textures["heartfull.png"]
                    );
                    this.healthSprites[i].width = 32;
                    this.healthSprites[i].height = 32;
                    this.healthSprites[i].x = 32 * i;
                    this.healthSprites[i].y = 1;
                }
                // Set texture to empty heart if i is greater than health
                else {
                    this.healthSprites[i] = PIXI.Sprite.from(
                        spriteSheet.textures["heartempty.png"]
                    );
                    this.healthSprites[i].width = 32;
                    this.healthSprites[i].height = 27;
                    this.healthSprites[i].x = 32 * i;
                    this.healthSprites[i].y = 3;
                }
            }
            // Set texture to shield if i is greater than maxhealth
            else {
                this.healthSprites[i] = PIXI.Sprite.from(
                    spriteSheet.textures["heartarmour.png"]
                );
                this.healthSprites[i].width = 32;
                this.healthSprites[i].height = 32;
                this.healthSprites[i].x = 32 * i;
                this.healthSprites[i].y = 1;
            }
            // Add health sprite to health layer
            HEALTHLAYER.addChild(this.healthSprites[i]);
        }
    }

    // Runs every frame
    update() {
        // Ends game if health is 0 or less
        if (this.health <= 0) {
            gameOver();
        }
        // Stops player from going out of bounds
        if (this.xPos < -this.width / 2) {
            this.xPos = -this.width / 2;
        }
        if (this.xPos > WIDTH - this.width / 2) {
            this.xPos = WIDTH - this.width / 2;
        }
        if (this.yPos < -this.height / 2) {
            this.yPos = -this.height / 2;
        }
        if (this.yPos > HEIGHT - this.height / 2) {
            this.yPos = HEIGHT - this.height / 2;
        }
    }
}
