class Maze {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.grid = [];
        this.startX = 1;
        this.startY = 1;
        this.endX = width - 2;
        this.endY = height - 2;
        
        // Inicializar el grid con paredes (1 = pared, 0 = camino)
        for (let y = 0; y < height; y++) {
            this.grid[y] = [];
            for (let x = 0; x < width; x++) {
                // Establecer todos como paredes inicialmente
                this.grid[y][x] = 1;
            }
        }
        
        this.generate();
    }
    
    generate() {
        this.generateMaze(this.startX, this.startY);
        
        // Asegurar que el punto final sea un camino
        this.grid[this.endY][this.endX] = 0;
        
        // Añadir algunas conexiones adicionales para hacer el laberinto menos lineal
        this.addAdditionalPaths();
    }
    
    generateMaze(x, y) {
        this.grid[y][x] = 0; // Marcar como camino
        
        // Direcciones: [dx, dy]
        const directions = [
            [0, -2], // Norte
            [2, 0],  // Este
            [0, 2],  // Sur
            [-2, 0]  // Oeste
        ];
        
        // Mezclar direcciones para aleatoriedad
        this.shuffleArray(directions);
        
        for (const [dx, dy] of directions) {
            const nx = x + dx;
            const ny = y + dy;
            
            // Verificar que estamos dentro del grid y la celda aún no ha sido visitada
            if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height && this.grid[ny][nx] === 1) {
                // Derribar la pared entre la celda actual y la nueva
                this.grid[y + dy/2][x + dx/2] = 0;
                
                // Continuar recursivamente
                this.generateMaze(nx, ny);
            }
        }
    }
    
    addAdditionalPaths() {
        // Añadir algunas conexiones adicionales para crear loops
        for (let i = 0; i < this.width * this.height / 10; i++) {
            const x = Math.floor(Math.random() * (this.width - 2)) + 1;
            const y = Math.floor(Math.random() * (this.height - 2)) + 1;
            
            if (this.grid[y][x] === 1) {
                // Contar vecinos que son caminos
                let pathNeighbors = 0;
                if (x > 0 && this.grid[y][x-1] === 0) pathNeighbors++;
                if (x < this.width-1 && this.grid[y][x+1] === 0) pathNeighbors++;
                if (y > 0 && this.grid[y-1][x] === 0) pathNeighbors++;
                if (y < this.height-1 && this.grid[y+1][x] === 0) pathNeighbors++;
                
                // Si tiene al menos 2 vecinos que son caminos, convertimos esta pared en camino
                if (pathNeighbors >= 2) {
                    this.grid[y][x] = 0;
                }
            }
        }
    }
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    getCell(x, y) {
        // Asegurarse de que las coordenadas estén dentro de los límites
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return 1; // Tratar fuera de límites como pared
        }
        return this.grid[y][x];
    }
}
