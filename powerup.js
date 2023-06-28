// Powerup class
class PowerUp {
    constructor() {
        // Add powerup to powerups array
        powerups.push(this);
        // Randomly select powerup type
        this.type = randomIndexFromArray([0, 0, 0, 0, 1, 1, 1]); // 0 = Shield, 1 = Heal;
        if (this.type == 0) {
            this.sprite = new PIXI.Sprite(
                spriteSheet.textures["powerupshield.png"],
                true
            );
        }
        if (this.type == 1) {
            this.sprite = new PIXI.Sprite(
                spriteSheet.textures["powerupheal.png"],
                true
            );
        }
        // Add sprite to game layer
        GAMELAYER.addChild(this.sprite);
        this.sprite.x = WIDTH;
        // Set y to random position
        this.sprite.y = Math.round(Math.random() * HEIGHT);
        this.sprite.width = 32;
        this.sprite.height = 32;
    }

    // Runs every tick
    update() {
        // Move sprite to the left
        this.sprite.x -= SCROLLSPEED;
        if (this.sprite.x < -100) {
            // Stop drawing sprite
            GAMELAYER.removeChild(this.sprite);
            // Remove powerup from array
            powerups.splice(powerups.indexOf(this), 1);
        }
        // Check for collision with player
        if (
            player.rectCollision(
                this.sprite.x,
                this.sprite.y,
                this.sprite.width,
                this.sprite.height
            )
        ) {
            // Stop drawing sprite
            GAMELAYER.removeChild(this.sprite);
            // Remove powerup from array
            powerups.splice(powerups.indexOf(this), 1);
            // Apply powerup effect
            if (this.type == 0) {
                player.addShield(1);
            }
            if (this.type == 1) {
                player.heal(1);
            }
        }
    }
}
