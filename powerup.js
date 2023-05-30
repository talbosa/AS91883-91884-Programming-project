class PowerUp {
    constructor() {
        this.xPos = WIDTH;
        this.yPos = Math.random() * HEIGHT;
        this.type = randomWithProbability([0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 3]); // 0 = Damage; 1 = Heal 1; 2 = Add 1 Shield; 3 = Add Max Health
    }
}
