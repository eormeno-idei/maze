class Player {
    constructor(x, y, size, speed, maze, game) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speed = speed;
        this.maze = maze;
        this.game = game; // Referencia al juego para acceder a items
        this.hasWon = false;
        // Añadir dirección inicial (0: arriba, 1: derecha, 2: abajo, 3: izquierda)
        this.direction = 0;
        // Para controlar el movimiento entre celdas
        this.isMoving = false;
        this.targetX = x;
        this.targetY = y;
        
        // Para notificaciones visuales
        this.notification = null;
        this.notificationTimer = 0;
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
        
        // Dibujar notificación si existe
        if (this.notification) {
            const padding = 10;
            const fontSize = 16;
            
            ctx.font = `bold ${fontSize}px Arial`;
            const textWidth = ctx.measureText(this.notification.message).width;
            
            // Fondo de la notificación
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(
                this.x + this.size / 2 - textWidth / 2 - padding,
                this.y - fontSize - padding * 2,
                textWidth + padding * 2,
                fontSize + padding * 2
            );
            
            // Texto de la notificación
            ctx.fillStyle = this.notification.color;
            ctx.textAlign = 'center';
            ctx.fillText(
                this.notification.message,
                this.x + this.size / 2,
                this.y - padding
            );
            ctx.textAlign = 'left'; // Restaurar alineación predeterminada
        }
    }

    update(controls) {
        if (this.hasWon) return;
        
        // Actualizar el temporizador de notificación si hay una activa
        if (this.notification) {
            this.notificationTimer -= 1;
            if (this.notificationTimer <= 0) {
                this.notification = null;
            }
        }

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
                
                // Verificar si hay una llave en esta posición
                this.checkForKey();
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
        
        // Verificar si el movimiento es válido (sin paredes o con puerta que se puede abrir)
        if (this.canMoveTo(nextCellX, nextCellY)) {
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
    
    // Comprobar si el jugador puede moverse a la celda objetivo
    canMoveTo(targetX, targetY) {
        const cellSize = this.maze.cellSize;
        
        // Verificar límites del laberinto
        if (targetX < 0 || targetX >= this.maze.grid[0].length || 
            targetY < 0 || targetY >= this.maze.grid.length) {
            return false;
        }
        
        // Verificar si hay una pared
        if (this.maze.grid[targetY][targetX] === 1) {
            return false;
        }
        
        // Verificar si hay una puerta
        if (this.game && this.game.items.isDoorAt(targetX, targetY)) {
            // Intentar abrir la puerta si el jugador tiene la llave
            const doorOpened = this.game.items.tryOpenDoor(targetX, targetY);
            
            if (doorOpened) {
                // Mostrar notificación de puerta abierta
                this.showNotification("¡Puerta abierta!", "#38FF38");
                return true;
            } else {
                // Mostrar notificación de llave necesaria
                const doorColor = this.getDoorColor(targetX, targetY);
                if (doorColor) {
                    this.showNotification(`Necesitas una llave ${this.translateColor(doorColor)}`, "#FF3838");
                }
                return false;
            }
        }
        
        return true;
    }
    
    // Obtener el color de una puerta en la posición dada
    getDoorColor(x, y) {
        if (!this.game || !this.game.items || !this.game.items.doors) return null;
        
        const door = this.game.items.doors.find(d => d.x === x && d.y === y && !d.isOpen);
        return door ? door.color : null;
    }
    
    // Traducir colores al español
    translateColor(color) {
        const colorTranslations = {
            'red': 'roja',
            'green': 'verde',
            'blue': 'azul'
        };
        return colorTranslations[color] || color;
    }
    
    // Revisar si hay una llave en la posición actual
    checkForKey() {
        if (!this.game || !this.game.items) return;
        
        const cellSize = this.maze.cellSize;
        const currentCellX = Math.floor(this.x / cellSize);
        const currentCellY = Math.floor(this.y / cellSize);
        
        if (this.game.items.isKeyAt(currentCellX, currentCellY)) {
            const keyColor = this.game.items.collectKey(currentCellX, currentCellY);
            if (keyColor) {
                // Mostrar notificación de llave recogida
                this.showNotification(`¡Llave ${this.translateColor(keyColor)} recogida!`, "#FFFF38");
                console.log(`¡Has recogido una llave ${keyColor}!`);
            }
        }
    }
    
    // Mostrar una notificación temporal
    showNotification(message, color = "#FFFFFF") {
        this.notification = {
            message: message,
            color: color
        };
        this.notificationTimer = 60; // Duración en frames (aprox. 1 segundo a 60 fps)
    }
}

