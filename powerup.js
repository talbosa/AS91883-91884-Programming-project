//  █▀█ █▀█ █ █ █ █▀▀ █▀█ █ █ █▀█   █▀▀ █   ▄▀█ █▀ █▀
//  █▀▀ █▄█ ▀▄▀▄▀ ██▄ █▀▄ █▄█ █▀▀   █▄▄ █▄▄ █▀█ ▄█ ▄█
class PowerUp {
    constructor() {
        powerups.push(this);
        this.type = randomIndexFromArray([0, 0, 0, 0, 1, 1, 1]); //0 = Shield, 1 = Heal;
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
        GAMELAYER.addChild(this.sprite);
        this.sprite.x = WIDTH;
        this.sprite.y = Math.round(Math.random() * HEIGHT);
        this.sprite.width = 32;
        this.sprite.height = 32;
    }

    //Moves the powerup and checks for collision with player
    update() {
        this.sprite.x -= SCROLLSPEED;
        if (this.sprite.x < -100) {
            GAMELAYER.removeChild(this.sprite);
            powerups.splice(powerups.indexOf(this), 1);
        }
        if (
            player.rectCollision(
                this.sprite.x,
                this.sprite.y,
                this.sprite.width,
                this.sprite.height
            )
        ) {
            GAMELAYER.removeChild(this.sprite);
            powerups.splice(powerups.indexOf(this), 1);
            if (this.type == 0) {
                player.addShield(1);
            }
            if (this.type == 1) {
                player.heal(1);
            }
        }
    }
}
