class UI {
    constructor(game) {
        this.game = game;
        this.scoreElement = document.getElementById('score');
        this.lengthElement = document.getElementById('length');
        this.levelElement = document.getElementById('level');
    }
    
    update() {
        const playerSnake = this.game.snakes.get(this.game.playerId);
        
        this.scoreElement.textContent = `Score: ${this.game.score}`;
        this.lengthElement.textContent = `Longueur: ${playerSnake ? playerSnake.getLength() : 0}`;
        this.levelElement.textContent = `Niveau: ${this.game.level}`;
    }
}
