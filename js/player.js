class Player {
    constructor(maze, x, y) {
        this.maze = maze;
        this.x = x + 0.5; // Centro de la celda
        this.y = y + 0.5;
        this.direction = 0; // 0 = este, Math.PI/2 = sur
        this.moveSpeed = 0.05;
        this.rotateSpeed = 0.03;
    }

    draw(ctx) {
        // Draw player as a circular character
        ctx.fillStyle = '#4D9DE0';
        ctx.beginPath();
        ctx.arc(
            this.x * this.maze.cellSize,
            this.y * this.maze.cellSize,
            this.maze.cellSize / 2 - 2,
            0,
            Math.PI * 2
        );
        ctx.fill();

        // Posicionar los ojos según la dirección
        let eyeX1, eyeX2, eyeY1, eyeY2;
        const centerX = this.x * this.maze.cellSize;
        const centerY = this.y * this.maze.cellSize;
        const eyeDistance = this.maze.cellSize / 4;
        const eyeSize = this.maze.cellSize / 8;

        switch (Math.round(this.direction / (Math.PI / 2)) % 4) {
            case 0: // Este
                eyeX1 = centerX + eyeDistance;
                eyeY1 = centerY - eyeDistance / 2;
                eyeX2 = centerX + eyeDistance;
                eyeY2 = centerY + eyeDistance / 2;
                break;
            case 1: // Sur
                eyeX1 = centerX - eyeDistance / 2;
                eyeY1 = centerY + eyeDistance;
                eyeX2 = centerX + eyeDistance / 2;
                eyeY2 = centerY + eyeDistance;
                break;
            case 2: // Oeste
                eyeX1 = centerX - eyeDistance;
                eyeY1 = centerY - eyeDistance / 2;
                eyeX2 = centerX - eyeDistance;
                eyeY2 = centerY + eyeDistance / 2;
                break;
            case 3: // Norte
                eyeX1 = centerX - eyeDistance / 2;
                eyeY1 = centerY - eyeDistance;
                eyeX2 = centerX + eyeDistance / 2;
                eyeY2 = centerY - eyeDistance;
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
        // Rotación
        if (controls.left) {
            this.direction -= this.rotateSpeed;
        }
        if (controls.right) {
            this.direction += this.rotateSpeed;
        }

        // Normalizar dirección
        while (this.direction < 0) this.direction += Math.PI * 2;
        while (this.direction >= Math.PI * 2) this.direction -= Math.PI * 2;

        // Movimiento adelante/atrás
        if (controls.up || controls.down) {
            const moveDir = controls.up ? 1 : -1;
            const newX = this.x + Math.cos(this.direction) * this.moveSpeed * moveDir;
            const newY = this.y + Math.sin(this.direction) * this.moveSpeed * moveDir;

            // Comprobar colisión en X
            if (this.canMoveTo(newX, this.y)) {
                this.x = newX;
            }

            // Comprobar colisión en Y
            if (this.canMoveTo(this.x, newY)) {
                this.y = newY;
            }
        }

        // Movimiento lateral (strafe)
        if (controls.strafeLeft || controls.strafeRight) {
            const strafeDir = controls.strafeRight ? 1 : -1;
            const strafeAngle = this.direction + Math.PI / 2 * strafeDir;

            const newX = this.x + Math.cos(strafeAngle) * this.moveSpeed;
            const newY = this.y + Math.sin(strafeAngle) * this.moveSpeed;

            // Comprobar colisión en X
            if (this.canMoveTo(newX, this.y)) {
                this.x = newX;
            }

            // Comprobar colisión en Y
            if (this.canMoveTo(this.x, newY)) {
                this.y = newY;
            }
        }
    }

    canMoveTo(x, y) {
        // Añadir margen para evitar que el jugador se pegue demasiado a las paredes
        const margin = 0.1;
        const cellX = Math.floor(x);
        const cellY = Math.floor(y);

        // Comprobar las celdas circundantes
        if (this.maze.getCell(cellX, cellY) === 1) return false;

        // Comprobar colisiones con los bordes
        if (x - cellX < margin && this.maze.getCell(cellX - 1, cellY) === 1) return false;
        if (cellX + 1 - x < margin && this.maze.getCell(cellX + 1, cellY) === 1) return false;
        if (y - cellY < margin && this.maze.getCell(cellX, cellY - 1) === 1) return false;
        if (cellY + 1 - y < margin && this.maze.getCell(cellX, cellY + 1) === 1) return false;

        return true;
    }
}

