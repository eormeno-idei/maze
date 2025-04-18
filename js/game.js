class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // Cambiamos el tamaño de celda de 30 a 40 para que divida exactamente el canvas
        const cellSize = 40; // Size of each cell in the maze
        
        this.maze = new Maze(this.width, this.height, cellSize);
        this.controls = new Controls();
        this.player = new Player(
            this.maze.startPos.x,
            this.maze.startPos.y,
            cellSize - 4, // Slightly smaller than cell size
            4, // Speed
            this.maze
        );
        
        this.gameLoop = this.gameLoop.bind(this);
        this.lastTime = 0;
    }
    
    start() {
        this.gameLoop();
    }
    
    gameLoop(timestamp = 0) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        
        // Clear the canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Update game objects
        this.player.update(this.controls);
        
        // Draw game objects
        this.maze.draw(this.ctx);
        this.player.draw(this.ctx);
        
        // Display win message
        if (this.player.hasWon) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            
            this.ctx.fillStyle = '#FFFF00';
            this.ctx.font = '48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('¡Has ganado!', this.width / 2, this.height / 2);
            
            this.ctx.font = '24px Arial';
            this.ctx.fillText('Presiona F5 para jugar de nuevo', this.width / 2, this.height / 2 + 50);
        }
        
        // Request next frame
        requestAnimationFrame(this.gameLoop);
    }
}

// Initialize the game when the page loads
window.addEventListener('load', () => {
    const game = new Game();
    game.start();
});