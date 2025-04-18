class Player {
    constructor(x, y, size, speed, maze) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speed = speed;
        this.maze = maze;
        this.hasWon = false;
        // Añadir dirección inicial (0: arriba, 1: derecha, 2: abajo, 3: izquierda)
        this.direction = 0;
        // Para controlar el movimiento entre celdas
        this.isMoving = false;
        this.targetX = x;
        this.targetY = y;
    }

    draw(ctx) {
        // Draw player as a circular character
        ctx.fillStyle = '#4D9DE0';
        ctx.beginPath();
        ctx.arc(
            this.x + this.size / 2,
            this.y + this.size / 2,
            this.size / 2 - 2,
            0,
            Math.PI * 2
        );
        ctx.fill();

        // Posicionar los ojos según la dirección
        let eyeX1, eyeX2, eyeY1, eyeY2;
        const centerX = this.x + this.size / 2;
        const centerY = this.y + this.size / 2;
        const eyeDistance = this.size / 4;
        const eyeSize = this.size / 8;

        switch (this.direction) {
            case 0: // Arriba
                eyeX1 = this.x + this.size / 3;
                eyeY1 = this.y + this.size / 3;
                eyeX2 = this.x + (this.size * 2) / 3;
                eyeY2 = this.y + this.size / 3;
                break;
            case 1: // Derecha
                eyeX1 = this.x + (this.size * 2) / 3;
                eyeY1 = this.y + this.size / 3;
                eyeX2 = this.x + (this.size * 2) / 3;
                eyeY2 = this.y + (this.size * 2) / 3;
                break;
            case 2: // Abajo
                eyeX1 = this.x + this.size / 3;
                eyeY1 = this.y + (this.size * 2) / 3;
                eyeX2 = this.x + (this.size * 2) / 3;
                eyeY2 = this.y + (this.size * 2) / 3;
                break;
            case 3: // Izquierda
                eyeX1 = this.x + this.size / 3;
                eyeY1 = this.y + this.size / 3;
                eyeX2 = this.x + this.size / 3;
                eyeY2 = this.y + (this.size * 2) / 3;
                break;
        }

        // Dibujar los ojos en la posición calculada
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(eyeX1, eyeY1, eyeSize, 0, Math.PI * 2);
        ctx.arc(eyeX2, eyeY2, eyeSize, 0, Math.PI * 2);
        ctx.fill();

        // Dibujar pupilas para dar más vida al personaje
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(eyeX1, eyeY1, eyeSize / 2, 0, Math.PI * 2);
        ctx.arc(eyeX2, eyeY2, eyeSize / 2, 0, Math.PI * 2);
        ctx.fill();
    }

    update(controls) {
        if (this.hasWon) return;

        // Si el jugador ya está en movimiento, continúa moviéndose hacia la celda objetivo
        if (this.isMoving) {
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.speed) {
                // El jugador ha llegado a la celda objetivo
                this.x = this.targetX;
                this.y = this.targetY;
                this.isMoving = false;
            } else {
                // Continuar movimiento hacia la celda objetivo
                this.x += (dx / distance) * this.speed;
                this.y += (dy / distance) * this.speed;
            }
            return;
        }

        // Si no está en movimiento, procesar las entradas del jugador
        const cellSize = this.maze.cellSize;
        
        // Obtener la celda actual del jugador
        const currentCellX = Math.floor(this.x / cellSize);
        const currentCellY = Math.floor(this.y / cellSize);
        
        let nextCellX = currentCellX;
        let nextCellY = currentCellY;
        
        if (controls.isPressed('ArrowUp')) {
            nextCellY = currentCellY - 1;
            this.direction = 0; // Arriba
        }
        else if (controls.isPressed('ArrowDown')) {
            nextCellY = currentCellY + 1;
            this.direction = 2; // Abajo
        }
        else if (controls.isPressed('ArrowLeft')) {
            nextCellX = currentCellX - 1;
            this.direction = 3; // Izquierda
        }
        else if (controls.isPressed('ArrowRight')) {
            nextCellX = currentCellX + 1;
            this.direction = 1; // Derecha
        }
        else {
            return; // No se presionó ninguna tecla
        }
        
        // Verificar si no hay pared en la celda destino
        if (nextCellY >= 0 && nextCellY < this.maze.grid.length && 
            nextCellX >= 0 && nextCellX < this.maze.grid[0].length && 
            this.maze.grid[nextCellY][nextCellX] === 0) {
            
            // Calcular la posición central de la celda destino
            this.targetX = nextCellX * cellSize + (cellSize - this.size) / 2;
            this.targetY = nextCellY * cellSize + (cellSize - this.size) / 2;
            this.isMoving = true;
        }

        // Check if reached the end
        if (this.maze.checkWin(this.x, this.y, this.size)) {
            this.hasWon = true;
        }
    }
}

