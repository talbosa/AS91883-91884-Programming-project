// Enemy class
class Enemy {
    // Is run when a new enemy is created
    constructor() {
        // Add enemy to enemies array
        enemies.push(this);
        // Create enemy animated sprite
        this.sprite = new PIXI.AnimatedSprite(
            spriteSheet.animations["enemy"],
            true
        );
        this.sprite.animationSpeed = 0.1;
        // Add sprite to game layer
        GAMELAYER.addChild(this.sprite);
        // Play sprite animation
        this.sprite.play();
        this.sprite.x = WIDTH;
        // Set sprite y to random position
        this.sprite.y = Math.round(Math.random() * HEIGHT);
        this.sprite.width = 64;
        this.sprite.height = 64;
        this.moveSpeedY;
        // Set score given on death
        this.score = 1;
        this.type; // 0 = Does not move; 1 = Moves towards players Y when in front of the player; 2 = Moves towards players X and Y when in front of the player
        // Set type to random index from an array depending on score
        if (score >= 0) {
            this.type = randomIndexFromArray([0, 0, 0, 0, 1, 1, 1, 2]);
        }
        if (score >= 50) {
            this.type = randomIndexFromArray([0, 0, 1, 1, 1, 1, 2, 2]);
        }
        if (score >= 100) {
            this.type = randomIndexFromArray([1, 1, 1, 1, 1, 2, 2, 2, 2]);
        }
        if (this.type == 1) {
            // Increase score given and set moveSpeedY
            this.score = 2;
            if ( score >= 0){
                this.moveSpeedY = 2;
            }
            if ( score >= 50){
                this.moveSpeedY = 3;
            }
            if ( score >= 100){
                this.moveSpeedY = 4;
            }
            if ( score >= 200){
                this.moveSpeedY = 5;
            }
        }
        if (this.type == 2) {
            // Increase score given and set moveSpeedY
            this.score = 4;
            if ( score >= 0){
                this.moveSpeedY = SCROLLSPEED;
            }
            if ( score >= 50){
                this.moveSpeedY = SCROLLSPEED + 0.5;
            }
            if ( score >= 100){
                this.moveSpeedY = SCROLLSPEED + 1;
            }
            if ( score >= 200){
                this.moveSpeedY = SCROLLSPEED + 2;
            }
            if ( score >= 400){
                this.moveSpeedY = SCROLLSPEED + 2.5;
            }
        }
    }

    // Runs every frame
    update() {
        // Moves the enemy back
        this.sprite.x -= SCROLLSPEED;
        // Moves the enemy towards the players y if it is type 1 or 2
        if (this.type == 1 || this.type == 2) {
            if (
                (player.yPos + player.height/3) - this.sprite.y > this.moveSpeedY * 2 &&
                this.sprite.x + this.sprite.width > player.xPos
            ) {
                this.sprite.y += this.moveSpeedY;
            } else if (
                this.sprite.y - (player.yPos + player.height/3) > -this.moveSpeedY * 2 &&
                this.sprite.x + this.sprite.width > player.xPos
            ) {
                this.sprite.y -= this.moveSpeedY;
            }
        }
        // Make the enemy move faster if it is type 2 and above the player
        if (this.type == 2) {
            if (this.sprite.x + this.sprite.width > player.xPos) {
                this.sprite.x -= SCROLLSPEED / 2;
            }
        }
        if (this.sprite.x < -100) {
            score += this.score;
            // Stop drawing this enemy
            GAMELAYER.removeChild(this.sprite);
            // Remove this enemy from the enemies array
            enemies.splice(enemies.indexOf(this), 1);
            // Update score text
            updateScore();
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
            // Stop drawing this enemy
            GAMELAYER.removeChild(this.sprite);
            // Remove this enemy from the enemies array
            enemies.splice(enemies.indexOf(this), 1);
            player.damage(1);
        }
    }
}
