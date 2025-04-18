class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        this.maze = new Maze(20, 20); // Ajustar tamaño según necesites
        this.maze.generate();
        
        // Posición inicial del jugador
        this.player = new Player(this.maze, 1, 1);
        
        this.controls = new Controls();
        this.controls.setupPointerLock();
        
        // El nuevo renderer 2.5D
        this.renderer = new Renderer(this.canvas, this.maze, this.player);
        
        // Hacer accesible la instancia del juego globalmente (para los controles del mouse)
        window.gameInstance = this;
        
        this.gameLoop();
    }
    
    gameLoop() {
        // Actualizar
        this.player.update(this.controls);
        
        // Renderizar
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.renderer.render();
        
        // Comprobar victoria (fin del laberinto)
        const playerCellX = Math.floor(this.player.x);
        const playerCellY = Math.floor(this.player.y);
        
        if (playerCellX === this.maze.endX && playerCellY === this.maze.endY) {
            this.showVictory();
            return;
        }
        
        requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    showVictory() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#00FF00';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('¡Victoria!', this.canvas.width / 2, this.canvas.height / 2 - 50);
        
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '24px Arial';
        this.ctx.fillText('Haz clic para jugar de nuevo', this.canvas.width / 2, this.canvas.height / 2 + 20);
        
        this.canvas.addEventListener('click', () => {
            location.reload();
        }, { once: true });
    }
}

// Iniciar el juego cuando la página cargue
window.onload = function() {
    new Game();
};

// Responsive
window.addEventListener('resize', function() {
    const canvas = document.getElementById('gameCanvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Actualizar renderer si es necesario
    if (window.gameInstance) {
        window.gameInstance.renderer.render();
    }
});