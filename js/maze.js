class Maze {
    constructor(width, height, cellSize) {
        this.width = width;
        this.height = height;
        this.cellSize = cellSize;
        this.grid = [];
        this.startPos = { x: 0, y: 0 };
        this.endPos = { x: 0, y: 0 };
        
        this.generateMaze();
    }
    
    generateMaze() {
        // Number of cells in horizontal and vertical directions
        const cols = Math.floor(this.width / this.cellSize);
        const rows = Math.floor(this.height / this.cellSize);
        
        // Initialize grid with walls (1 = wall, 0 = path)
        for (let y = 0; y < rows; y++) {
            this.grid[y] = [];
            for (let x = 0; x < cols; x++) {
                // Make all cells walls initially
                this.grid[y][x] = 1;
            }
        }
        
        // Use recursive backtracking to generate the maze
        const stack = [];
        const visited = new Set();
        
        // Start at a random cell
        const startX = 1;
        const startY = 1;
        
        // Mark as visited
        visited.add(`${startX},${startY}`);
        this.grid[startY][startX] = 0; // Create a path
        stack.push({ x: startX, y: startY });
        
        // Define directions: up, right, down, left
        const directions = [
            { dx: 0, dy: -2 },
            { dx: 2, dy: 0 },
            { dx: 0, dy: 2 },
            { dx: -2, dy: 0 }
        ];
        
        // Create the maze paths
        while (stack.length > 0) {
            const current = stack[stack.length - 1];
            
            // Get unvisited neighbors
            const neighbors = [];
            for (const dir of directions) {
                const nx = current.x + dir.dx;
                const ny = current.y + dir.dy;
                
                if (
                    nx > 0 && ny > 0 && nx < cols - 1 && ny < rows - 1 &&
                    !visited.has(`${nx},${ny}`)
                ) {
                    neighbors.push({ x: nx, y: ny, dx: dir.dx, dy: dir.dy });
                }
            }
            
            if (neighbors.length > 0) {
                // Choose a random unvisited neighbor
                const next = neighbors[Math.floor(Math.random() * neighbors.length)];
                
                // Remove the wall between current and next
                const wallX = current.x + next.dx / 2;
                const wallY = current.y + next.dy / 2;
                this.grid[wallY][wallX] = 0;
                
                // Mark next as visited
                this.grid[next.y][next.x] = 0;
                visited.add(`${next.x},${next.y}`);
                
                // Add next to stack
                stack.push({ x: next.x, y: next.y });
            } else {
                // No unvisited neighbors, backtrack
                stack.pop();
            }
        }
        
        // Paso 1: Añadir conexiones adicionales para crear ciclos en el laberinto
        this.addAdditionalConnections(cols, rows);
        
        // Paso 2: Crear habitaciones/cámaras en el laberinto
        this.createRooms(cols, rows);
        
        // Asegurar que los bordes del laberinto sean paredes (incluida la columna derecha)
        for (let y = 0; y < rows; y++) {
            // Borde izquierdo
            this.grid[y][0] = 1;
            // Borde derecho
            this.grid[y][cols - 1] = 1;
        }
        
        for (let x = 0; x < cols; x++) {
            // Borde superior
            this.grid[0][x] = 1;
            // Borde inferior
            this.grid[rows - 1][x] = 1;
        }
        
        // Set start position
        this.startPos = { x: this.cellSize, y: this.cellSize };
        
        // Set end position
        this.endPos = this.findAccessibleEndPoint();
        
        // Make sure the start position is a path
        const startCol = Math.floor(this.startPos.x / this.cellSize);
        const startRow = Math.floor(this.startPos.y / this.cellSize);
        this.grid[startRow][startCol] = 0;
    }
    
    // Método para añadir conexiones adicionales entre pasillos
    addAdditionalConnections(cols, rows) {
        // Número de conexiones adicionales a añadir (ajusta según prefieras)
        const numConnections = Math.floor((cols * rows) / 20);
        
        for (let i = 0; i < numConnections; i++) {
            // Selecciona una pared interna aleatoria
            let x = Math.floor(Math.random() * (cols - 2)) + 1;
            let y = Math.floor(Math.random() * (rows - 2)) + 1;
            
            // Si es una pared
            if (this.grid[y][x] === 1) {
                // Verifica si es una pared interna (está entre dos pasillos)
                let isHorizontalWall = this.grid[y-1][x] === 0 && this.grid[y+1][x] === 0;
                let isVerticalWall = this.grid[y][x-1] === 0 && this.grid[y][x+1] === 0;
                
                if (isHorizontalWall || isVerticalWall) {
                    // Elimina la pared para crear una conexión
                    this.grid[y][x] = 0;
                }
            }
        }
    }
    
    // Método para crear habitaciones/cámaras
    createRooms(cols, rows) {
        // Número de habitaciones a crear
        const numRooms = Math.floor((cols * rows) / 100) + 2;
        
        for (let i = 0; i < numRooms; i++) {
            // Tamaño aleatorio de habitación (asegúrate de que no sean demasiado grandes)
            const roomWidth = Math.floor(Math.random() * 2) + 2;
            const roomHeight = Math.floor(Math.random() * 2) + 2;
            
            // Posición aleatoria (alejada de los bordes)
            const roomX = Math.floor(Math.random() * (cols - roomWidth - 4)) + 2;
            const roomY = Math.floor(Math.random() * (rows - roomHeight - 4)) + 2;
            
            // Crea la habitación eliminando todas las paredes dentro del área
            for (let y = roomY; y < roomY + roomHeight; y++) {
                for (let x = roomX; x < roomX + roomWidth; x++) {
                    this.grid[y][x] = 0;
                }
            }
            
            // Asegura que la habitación esté conectada al laberinto
            const side = Math.floor(Math.random() * 4); // 0: arriba, 1: derecha, 2: abajo, 3: izquierda
            
            switch (side) {
                case 0: // Conectar por arriba
                    this.grid[roomY-1][roomX + Math.floor(roomWidth/2)] = 0;
                    break;
                case 1: // Conectar por la derecha
                    this.grid[roomY + Math.floor(roomHeight/2)][roomX + roomWidth] = 0;
                    break;
                case 2: // Conectar por abajo
                    this.grid[roomY + roomHeight][roomX + Math.floor(roomWidth/2)] = 0;
                    break;
                case 3: // Conectar por la izquierda
                    this.grid[roomY + Math.floor(roomHeight/2)][roomX-1] = 0;
                    break;
            }
        }
    }
    
    findAccessibleEndPoint() {
        const cols = this.grid[0].length;
        const rows = this.grid.length;
        
        // Empezamos desde la esquina inferior derecha y buscamos un camino
        for (let distance = 0; distance < Math.max(cols, rows); distance++) {
            // Buscar en un patrón en espiral desde la esquina
            for (let i = 0; i <= distance; i++) {
                // Comprobar puntos alrededor de la esquina inferior derecha
                const checkPoints = [
                    { x: cols - 2 - i, y: rows - 2 - (distance - i) },
                    { x: cols - 2 - (distance - i), y: rows - 2 + i }
                ];
                
                for (const point of checkPoints) {
                    if (point.x > 0 && point.y > 0 && 
                        point.x < cols - 1 && point.y < rows - 1 && 
                        this.grid[point.y][point.x] === 0) {
                        // ¡Encontramos un camino!
                        return { 
                            x: point.x * this.cellSize, 
                            y: point.y * this.cellSize 
                        };
                    }
                }
            }
        }
        
        // Si no encontramos nada, volvemos a la posición predeterminada y la forzamos como camino
        const x = Math.floor((cols - 2) / 2) * this.cellSize;
        const y = Math.floor((rows - 2) / 2) * this.cellSize;
        const gridX = Math.floor(x / this.cellSize);
        const gridY = Math.floor(y / this.cellSize);
        this.grid[gridY][gridX] = 0;
        
        // También asegúrate de que haya al menos un camino adyacente
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        for (const [dx, dy] of directions) {
            const nx = gridX + dx;
            const ny = gridY + dy;
            if (nx > 0 && ny > 0 && nx < cols - 1 && ny < rows - 1) {
                this.grid[ny][nx] = 0;
                break;
            }
        }
        
        return { x, y };
    }
    
    draw(ctx) {
        const cols = this.grid[0].length;
        const rows = this.grid.length;
        
        // Draw the maze
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                if (this.grid[y][x] === 1) {
                    // Draw wall
                    ctx.fillStyle = '#6B5B95';
                    ctx.fillRect(
                        x * this.cellSize,
                        y * this.cellSize,
                        this.cellSize,
                        this.cellSize
                    );
                    
                    // Add some texture to walls
                    ctx.strokeStyle = '#5D4F82';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(
                        x * this.cellSize,
                        y * this.cellSize,
                        this.cellSize,
                        this.cellSize
                    );
                }
            }
        }
        
        // Draw the end position
        ctx.fillStyle = '#77DD77';
        ctx.beginPath();
        ctx.arc(
            this.endPos.x + this.cellSize / 2,
            this.endPos.y + this.cellSize / 2,
            this.cellSize / 2,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        // Add a star effect to the end point
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 4; i++) {
            const angle = (Math.PI / 2) * i;
            ctx.beginPath();
            ctx.moveTo(
                this.endPos.x + this.cellSize / 2,
                this.endPos.y + this.cellSize / 2
            );
            ctx.lineTo(
                this.endPos.x + this.cellSize / 2 + Math.cos(angle) * this.cellSize / 1.5,
                this.endPos.y + this.cellSize / 2 + Math.sin(angle) * this.cellSize / 1.5
            );
            ctx.stroke();
        }
    }
    
    checkCollision(x, y, size) {
        // Check each corner of the player
        const points = [
            { x: x + 2, y: y + 2 },                      // Top-left
            { x: x + size - 2, y: y + 2 },               // Top-right
            { x: x + 2, y: y + size - 2 },               // Bottom-left
            { x: x + size - 2, y: y + size - 2 }         // Bottom-right
        ];
        
        for (const point of points) {
            const gridX = Math.floor(point.x / this.cellSize);
            const gridY = Math.floor(point.y / this.cellSize);
            
            // Check if position is within grid bounds
            if (gridX < 0 || gridY < 0 || gridY >= this.grid.length || gridX >= this.grid[0].length) {
                return true; // Collision with boundary
            }
            
            // Check if position has a wall
            if (this.grid[gridY][gridX] === 1) {
                return true; // Collision with wall
            }
        }
        
        return false; // No collision
    }
    
    checkWin(x, y, size) {
        // Check if the player has reached the end position
        const playerCenterX = x + size / 2;
        const playerCenterY = y + size / 2;
        
        const endCenterX = this.endPos.x + this.cellSize / 2;
        const endCenterY = this.endPos.y + this.cellSize / 2;
        
        // Check if player center is within end circle
        const distance = Math.sqrt(
            Math.pow(playerCenterX - endCenterX, 2) +
            Math.pow(playerCenterY - endCenterY, 2)
        );
        
        return distance < this.cellSize / 2;
    }
}
