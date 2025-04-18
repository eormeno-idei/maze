class Items {
    constructor(game, maze) {
        this.game = game;
        this.maze = maze;
        this.doors = [];
        this.keys = [];
        this.keyColors = ['red', 'green', 'blue'];
        this.playerInventory = [];
        
        // Cargar imágenes de llaves y puertas
        this.doorImages = {};
        this.keyImages = {};
        this.loadImages();
    }

    loadImages() {
        // Cargar imágenes de puertas
        for (const color of this.keyColors) {
            const doorImg = new Image();
            doorImg.src = `assets/sprites/doors/${color}.svg`;
            this.doorImages[color] = doorImg;
            
            const keyImg = new Image();
            keyImg.src = `assets/sprites/keys/${color}.svg`;
            this.keyImages[color] = keyImg;
        }
    }

    initialize(level) {
        // Clear any existing doors and keys
        this.doors = [];
        this.keys = [];
        this.playerInventory = [];
        
        // Number of door-key pairs increases with level (max 3)
        const pairCount = Math.min(Math.floor(level/2) + 1, 3);
        
        // Generate door and key pairs
        for (let i = 0; i < pairCount; i++) {
            const color = this.keyColors[i];
            this.generateDoorKeyPair(color);
        }
        
        console.log(`Initialized level ${level} with ${this.doors.length} doors and ${this.keys.length} keys`);
    }

    generateDoorKeyPair(color) {
        // Find a suitable location for the door (not blocking the path completely)
        const doorCell = this.findSuitableDoorLocation();
        if (doorCell) {
            this.doors.push({
                x: doorCell.x,
                y: doorCell.y,
                color: color,
                isOpen: false
            });
        }
        
        // Place a key in a location that can be accessed without the door
        const keyCell = this.findSuitableKeyLocation(doorCell);
        if (keyCell) {
            this.keys.push({
                x: keyCell.x,
                y: keyCell.y,
                color: color,
                collected: false
            });
        }
    }

    findSuitableDoorLocation() {
        // Start with empty corridors (not walls)
        const emptyCells = [];
        for (let y = 0; y < this.maze.grid.length; y++) {
            for (let x = 0; x < this.maze.grid[0].length; x++) {
                if (this.maze.grid[y][x] === 0 && 
                    !(x === 0 && y === 0) && 
                    !(x === this.maze.grid[0].length-1 && y === this.maze.grid.length-1)) {
                    emptyCells.push({x, y});
                }
            }
        }

        // Shuffle to get random positions
        this.shuffleArray(emptyCells);
        
        // Find a cell that doesn't block the only path to exit
        for (const cell of emptyCells) {
            // Temporarily block this cell
            const originalValue = this.maze.grid[cell.y][cell.x];
            this.maze.grid[cell.y][cell.x] = 1;
            
            // Check if path still exists from start to end
            const pathExists = this.checkPathExists(0, 0, this.maze.grid[0].length-1, this.maze.grid.length-1);
            
            // Restore original value
            this.maze.grid[cell.y][cell.x] = originalValue;
            
            if (pathExists) {
                return cell;
            }
        }
        
        return null;
    }

    findSuitableKeyLocation(doorCell) {
        if (!doorCell) return null;
        
        // Find all cells accessible from the start without going through the door
        const accessibleCells = this.findAccessibleCells(0, 0, doorCell);
        
        // Filter out start and end positions
        const eligibleCells = accessibleCells.filter(cell => 
            !(cell.x === 0 && cell.y === 0) && 
            !(cell.x === this.maze.grid[0].length-1 && cell.y === this.maze.grid.length-1)
        );
        
        // Shuffle for randomness
        this.shuffleArray(eligibleCells);
        
        // Return first eligible cell, or null if none found
        return eligibleCells.length > 0 ? eligibleCells[0] : null;
    }

    findAccessibleCells(startX, startY, doorToAvoid) {
        const visited = Array(this.maze.grid.length).fill().map(() => Array(this.maze.grid[0].length).fill(false));
        const accessibleCells = [];
        const queue = [{x: startX, y: startY}];
        visited[startY][startX] = true;
        
        const directions = [{x:0,y:-1}, {x:1,y:0}, {x:0,y:1}, {x:-1,y:0}];
        
        while (queue.length > 0) {
            const current = queue.shift();
            accessibleCells.push(current);
            
            for (const dir of directions) {
                const nx = current.x + dir.x;
                const ny = current.y + dir.y;
                
                // Check boundaries and if cell is not a wall
                if (nx >= 0 && nx < this.maze.grid[0].length && 
                    ny >= 0 && ny < this.maze.grid.length && 
                    this.maze.grid[ny][nx] === 0 && 
                    !visited[ny][nx]) {
                    
                    // Don't go through the door we're trying to place a key for
                    if (!(doorToAvoid && nx === doorToAvoid.x && ny === doorToAvoid.y)) {
                        visited[ny][nx] = true;
                        queue.push({x: nx, y: ny});
                    }
                }
            }
        }
        
        return accessibleCells;
    }

    // Check if path exists between two points
    checkPathExists(startX, startY, endX, endY) {
        const visited = Array(this.maze.grid.length).fill().map(() => Array(this.maze.grid[0].length).fill(false));
        const queue = [{x: startX, y: startY}];
        visited[startY][startX] = true;
        
        const directions = [{x:0,y:-1}, {x:1,y:0}, {x:0,y:1}, {x:-1,y:0}];
        
        while (queue.length > 0) {
            const current = queue.shift();
            
            if (current.x === endX && current.y === endY) {
                return true;
            }
            
            for (const dir of directions) {
                const nx = current.x + dir.x;
                const ny = current.y + dir.y;
                
                if (nx >= 0 && nx < this.maze.grid[0].length && 
                    ny >= 0 && ny < this.maze.grid.length && 
                    this.maze.grid[ny][nx] === 0 && 
                    !visited[ny][nx]) {
                    
                    visited[ny][nx] = true;
                    queue.push({x: nx, y: ny});
                }
            }
        }
        
        return false;
    }

    /**
     * Check if a door exists at given coordinates
     */
    isDoorAt(x, y) {
        return this.doors.some(door => door.x === x && door.y === y && !door.isOpen);
    }

    /**
     * Check if a key exists at given coordinates
     */
    isKeyAt(x, y) {
        return this.keys.some(key => key.x === x && key.y === y && !key.collected);
    }

    /**
     * Collect key at the given position
     */
    collectKey(x, y) {
        const keyIndex = this.keys.findIndex(key => key.x === x && key.y === y && !key.collected);
        if (keyIndex !== -1) {
            this.keys[keyIndex].collected = true;
            this.playerInventory.push(this.keys[keyIndex].color);
            return this.keys[keyIndex].color;
        }
        return null;
    }

    /**
     * Try to open a door at the given position
     * @returns {boolean} true if door was opened, false otherwise
     */
    tryOpenDoor(x, y) {
        const doorIndex = this.doors.findIndex(door => door.x === x && door.y === y && !door.isOpen);
        if (doorIndex !== -1) {
            const doorColor = this.doors[doorIndex].color;
            const keyIndex = this.playerInventory.indexOf(doorColor);
            
            if (keyIndex !== -1) {
                // Remove key from inventory
                this.playerInventory.splice(keyIndex, 1);
                // Open the door
                this.doors[doorIndex].isOpen = true;
                return true;
            }
        }
        return false;
    }

    /**
     * Render all doors and keys
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {number} cellSize - Size of each cell in pixels
     */
    render(ctx, cellSize) {
        // Render doors
        for (const door of this.doors) {
            if (!door.isOpen) {
                if (this.doorImages[door.color] && this.doorImages[door.color].complete) {
                    // Usar imagen SVG para la puerta
                    ctx.drawImage(
                        this.doorImages[door.color],
                        door.x * cellSize,
                        door.y * cellSize,
                        cellSize,
                        cellSize
                    );
                } else {
                    // Fallback a representación básica si la imagen no está cargada
                    ctx.fillStyle = door.color;
                    ctx.fillRect(door.x * cellSize, door.y * cellSize, cellSize, cellSize);
                    
                    // Door frame
                    ctx.strokeStyle = '#000';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(door.x * cellSize + 2, door.y * cellSize + 2, cellSize - 4, cellSize - 4);
                    
                    // Door handle
                    ctx.fillStyle = '#000';
                    ctx.beginPath();
                    ctx.arc(door.x * cellSize + cellSize * 0.8, door.y * cellSize + cellSize * 0.5, cellSize * 0.1, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
        
        // Render keys
        for (const key of this.keys) {
            if (!key.collected) {
                if (this.keyImages[key.color] && this.keyImages[key.color].complete) {
                    // Usar imagen SVG para la llave
                    ctx.drawImage(
                        this.keyImages[key.color],
                        key.x * cellSize + cellSize * 0.15,
                        key.y * cellSize + cellSize * 0.15,
                        cellSize * 0.7,
                        cellSize * 0.7
                    );
                } else {
                    // Fallback a representación básica si la imagen no está cargada
                    // Key head
                    ctx.fillStyle = key.color;
                    ctx.beginPath();
                    ctx.arc(key.x * cellSize + cellSize * 0.5, key.y * cellSize + cellSize * 0.3, cellSize * 0.2, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Key stem
                    ctx.fillRect(key.x * cellSize + cellSize * 0.45, key.y * cellSize + cellSize * 0.3, 
                                cellSize * 0.1, cellSize * 0.5);
                    
                    // Key teeth
                    ctx.fillRect(key.x * cellSize + cellSize * 0.45, key.y * cellSize + cellSize * 0.6, 
                                cellSize * 0.25, cellSize * 0.1);
                    ctx.fillRect(key.x * cellSize + cellSize * 0.45, key.y * cellSize + cellSize * 0.7, 
                                cellSize * 0.25, cellSize * 0.1);
                }
            }
        }
    }

    /**
     * Render player inventory on screen
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    renderInventory(ctx, canvasWidth, canvasHeight) {
        const keySize = 30;
        const padding = 10;
        
        if (this.playerInventory.length > 0) {
            // Fondo del inventario
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(padding, canvasHeight - keySize - padding * 2, 
                        this.playerInventory.length * (keySize + padding) + padding + 60, keySize + padding * 2);
            
            // Título del inventario
            ctx.fillStyle = '#FFF';
            ctx.font = 'bold 16px Arial';
            ctx.fillText('Llaves:', padding * 2, canvasHeight - padding * 1.5 - 2);
            
            // Dibujar cada llave en el inventario
            for (let i = 0; i < this.playerInventory.length; i++) {
                const color = this.playerInventory[i];
                const x = padding * 3 + 60 + i * (keySize + padding);
                const y = canvasHeight - keySize - padding * 1.5;
                
                if (this.keyImages[color] && this.keyImages[color].complete) {
                    // Usar imagen SVG para la llave en el inventario
                    ctx.drawImage(
                        this.keyImages[color],
                        x - keySize * 0.1,
                        y,
                        keySize * 1.2,
                        keySize
                    );
                } else {
                    // Key head
                    ctx.fillStyle = color;
                    ctx.beginPath();
                    ctx.arc(x + keySize * 0.3, y + keySize * 0.3, keySize * 0.3, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Key stem
                    ctx.fillRect(x + keySize * 0.25, y + keySize * 0.3, keySize * 0.1, keySize * 0.5);
                    
                    // Key teeth
                    ctx.fillRect(x + keySize * 0.25, y + keySize * 0.6, keySize * 0.45, keySize * 0.1);
                    ctx.fillRect(x + keySize * 0.25, y + keySize * 0.7, keySize * 0.35, keySize * 0.1);
                }
            }
        }
    }

    /**
     * Utility function to shuffle array in place
     * @param {Array} array - Array to shuffle
     */
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}