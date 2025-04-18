class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // Tamaño de celda y nivel actual
        this.cellSize = 40; // Size of each cell in the maze
        this.currentLevel = 1;
        
        // Calculate maze dimensions
        this.mazeWidth = Math.floor(this.width / this.cellSize);
        this.mazeHeight = Math.floor(this.height / this.cellSize);
        
        this.maze = new Maze(this.width, this.height, this.cellSize);
        this.controls = new Controls();
        this.player = new Player(
            this.maze.startPos.x,
            this.maze.startPos.y,
            this.cellSize - 4, // Slightly smaller than cell size
            4, // Speed
            this.maze,
            this // Referencia al juego para acceder a items
        );
        
        // Inicializar sistema de puertas y llaves
        this.items = new Items(this, this.maze);
        this.setupRoomDoors();
        
        this.gameLoop = this.gameLoop.bind(this);
        this.lastTime = 0;
    }
    
    start() {
        this.gameLoop();
    }
    
    // Método para configurar puertas en las entradas de habitaciones
    setupRoomDoors() {
        // Inicializar primero el sistema de items
        this.items.initialize(this.currentLevel);
        
        // Asignar puertas de colores a las entradas de las habitaciones
        if (this.maze.rooms && this.maze.rooms.length > 0) {
            const colors = ['red', 'green', 'blue'];
            
            // Asignar un color a cada habitación (hasta el máximo disponible de colores)
            for (let i = 0; i < Math.min(this.maze.rooms.length, colors.length); i++) {
                const room = this.maze.rooms[i];
                
                // Si la habitación tiene una puerta definida
                if (room.doorLocation) {
                    const doorX = room.doorLocation.x;
                    const doorY = room.doorLocation.y;
                    
                    // Crear una puerta de color en la ubicación
                    this.items.doors.push({
                        x: doorX,
                        y: doorY,
                        color: colors[i],
                        isOpen: false
                    });
                    
                    // Asegurarnos de que hay una llave correspondiente
                    // Buscar una ubicación para la llave lejos de la puerta
                    const keyCell = this.findKeyLocation(doorX, doorY);
                    if (keyCell) {
                        this.items.keys.push({
                            x: keyCell.x,
                            y: keyCell.y,
                            color: colors[i],
                            collected: false
                        });
                    }
                }
            }
        }
        
        console.log(`Setup ${this.items.doors.length} room doors and ${this.items.keys.length} keys`);
    }
    
    // Método para encontrar una ubicación adecuada para una llave
    findKeyLocation(doorX, doorY) {
        // Crear una copia de la rejilla del laberinto
        const gridCopy = [];
        for (let y = 0; y < this.maze.grid.length; y++) {
            gridCopy[y] = [...this.maze.grid[y]];
        }
        
        // Bloquear temporalmente la puerta para asegurarnos de que la llave se coloque antes
        gridCopy[doorY][doorX] = 1;
        
        // Lista de celdas vacías donde se podría colocar una llave (excluyendo inicio y fin)
        const emptyCells = [];
        for (let y = 0; y < gridCopy.length; y++) {
            for (let x = 0; x < gridCopy[0].length; x++) {
                // Si es una celda vacía y no es el inicio ni el final
                const isStart = x === 0 && y === 0;
                const isEnd = x === gridCopy[0].length - 1 && y === gridCopy.length - 1;
                if (gridCopy[y][x] === 0 && !isStart && !isEnd) {
                    emptyCells.push({x, y});
                }
            }
        }
        
        // Mezclar las celdas vacías para una selección aleatoria
        this.shuffleArray(emptyCells);
        
        // Verificar cada celda para encontrar una que sea accesible desde el inicio sin pasar por la puerta
        for (const cell of emptyCells) {
            // Verificar si esta celda es accesible desde el inicio sin la puerta
            if (this.isCellAccessibleWithoutDoor(cell.x, cell.y, doorX, doorY, gridCopy)) {
                return cell;
            }
        }
        
        // Si no encontramos un lugar específico, simplemente usar una celda vacía aleatoria
        // Esto garantiza que al menos haya una llave en el laberinto
        if (emptyCells.length > 0) {
            console.log("Fallback: Usando una celda aleatoria para la llave");
            return emptyCells[0];
        }
        
        // Si no hay celdas vacías (caso extremo), crear un espacio para la llave
        console.log("No se encontraron celdas vacías para la llave, creando un espacio");
        const randomX = Math.floor(Math.random() * (gridCopy[0].length - 4)) + 2;
        const randomY = Math.floor(Math.random() * (gridCopy.length - 4)) + 2;
        this.maze.grid[randomY][randomX] = 0;
        return { x: randomX, y: randomY };
    }
    
    // Método auxiliar para verificar si una celda es accesible sin pasar por la puerta
    isCellAccessibleWithoutDoor(cellX, cellY, doorX, doorY, gridCopy) {
        const visited = Array(gridCopy.length).fill().map(() => Array(gridCopy[0].length).fill(false));
        const queue = [{x: 0, y: 0}]; // Empezar desde el inicio
        visited[0][0] = true;
        
        const directions = [{x:0,y:-1}, {x:1,y:0}, {x:0,y:1}, {x:-1,y:0}];
        
        while (queue.length > 0) {
            const current = queue.shift();
            
            // Si llegamos a la celda objetivo, es accesible
            if (current.x === cellX && current.y === cellY) {
                return true;
            }
            
            for (const dir of directions) {
                const nx = current.x + dir.x;
                const ny = current.y + dir.y;
                
                // Verificar límites y que no sea una pared ni la puerta
                if (nx >= 0 && nx < gridCopy[0].length && 
                    ny >= 0 && ny < gridCopy.length && 
                    gridCopy[ny][nx] === 0 && 
                    !visited[ny][nx] &&
                    !(nx === doorX && ny === doorY)) {
                    
                    visited[ny][nx] = true;
                    queue.push({x: nx, y: ny});
                }
            }
        }
        
        return false; // La celda no es accesible sin pasar por la puerta
    }
    
    // Utilidad para mezclar un array
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
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
        
        // Dibujar las puertas y llaves
        this.items.render(this.ctx, this.cellSize);
        
        // Dibujar inventario de llaves
        this.items.renderInventory(this.ctx, this.canvas.width, this.canvas.height);
        
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