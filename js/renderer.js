class Renderer {
    constructor(canvas, maze, player) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.maze = maze;
        this.player = player;
        this.viewDist = 14;
        this.fov = 60 * Math.PI / 180;
        
        // Texturas para paredes (podrías usar imágenes reales)
        this.wallTexture = this.createWallTexture();
        this.floorColor = "#444444";
        this.ceilingColor = "#111111";
    }
    
    createWallTexture() {
        // Textura básica para paredes (se podría reemplazar con imágenes)
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = "#884444";
        ctx.fillRect(0, 0, 64, 64);
        
        // Patrón de ladrillos simple
        ctx.fillStyle = "#663333";
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                if ((x + y) % 2 === 0) {
                    ctx.fillRect(x * 8, y * 8, 8, 8);
                }
            }
        }
        
        return canvas;
    }
    
    render() {
        this.ctx.fillStyle = this.ceilingColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height / 2);
        
        this.ctx.fillStyle = this.floorColor;
        this.ctx.fillRect(0, this.canvas.height / 2, this.canvas.width, this.canvas.height / 2);

        // Raycast para cada columna de la pantalla
        const numRays = this.canvas.width;
        const rayWidth = this.canvas.width / numRays;
        
        for (let i = 0; i < numRays; i++) {
            // Calcular dirección del rayo basado en la posición de la columna
            const rayAngle = this.player.direction - this.fov / 2 + (i / numRays) * this.fov;
            const ray = this.castRay(rayAngle);
            
            if (ray.hit) {
                // Aplicar corrección de "ojo de pez"
                const correctDistance = ray.distance * Math.cos(rayAngle - this.player.direction);
                
                // Calcular altura de la pared
                const wallHeight = this.canvas.height / correctDistance;
                
                // Dibujar columna de pared
                const wallTop = (this.canvas.height - wallHeight) / 2;
                
                // Para sombreado basado en dirección
                const brightness = 1 - Math.min(ray.distance / this.viewDist, 0.8);
                
                // Renderizar columna con textura
                this.renderWallSlice(i * rayWidth, wallTop, rayWidth, wallHeight, ray, brightness);
            }
        }
        
        // Dibujar arma/mano en primera persona (opcional)
        this.drawWeapon();
    }
    
    renderWallSlice(x, y, width, height, ray, brightness) {
        const textureX = ray.textureX * this.wallTexture.width;
        
        // Técnica básica de renderizado de textura
        this.ctx.globalAlpha = brightness;
        this.ctx.drawImage(
            this.wallTexture,
            textureX, 0, 1, this.wallTexture.height,
            x, y, width, height
        );
        this.ctx.globalAlpha = 1.0;
    }
    
    castRay(angle) {
        // Inicializar valores para el ray casting
        const rayDir = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        };
        
        let mapX = Math.floor(this.player.x);
        let mapY = Math.floor(this.player.y);
        
        // Calcular distancias para avanzar un cuadro en X o Y
        const deltaDistX = Math.abs(1 / rayDir.x);
        const deltaDistY = Math.abs(1 / rayDir.y);
        
        let sideDistX, sideDistY;
        let stepX, stepY;
        
        // Calcular paso y distancia lateral inicial
        if (rayDir.x < 0) {
            stepX = -1;
            sideDistX = (this.player.x - mapX) * deltaDistX;
        } else {
            stepX = 1;
            sideDistX = (mapX + 1.0 - this.player.x) * deltaDistX;
        }
        
        if (rayDir.y < 0) {
            stepY = -1;
            sideDistY = (this.player.y - mapY) * deltaDistY;
        } else {
            stepY = 1;
            sideDistY = (mapY + 1.0 - this.player.y) * deltaDistY;
        }
        
        // Algoritmo DDA para encontrar la intersección con la pared
        let hit = false;
        let side = 0; // 0 para pared X, 1 para pared Y
        
        while (!hit && 
               mapX >= 0 && mapX < this.maze.width && 
               mapY >= 0 && mapY < this.maze.height) {
            
            // Saltar al siguiente cuadro
            if (sideDistX < sideDistY) {
                sideDistX += deltaDistX;
                mapX += stepX;
                side = 0;
            } else {
                sideDistY += deltaDistY;
                mapY += stepY;
                side = 1;
            }
            
            // Verificar colisión con pared
            if (this.maze.getCell(mapX, mapY) === 1) {
                hit = true;
            }
        }
        
        // Calcular distancia perpendicular a la pared
        let perpWallDist;
        let textureX;
        
        if (side === 0) {
            perpWallDist = (mapX - this.player.x + (1 - stepX) / 2) / rayDir.x;
            textureX = this.player.y + perpWallDist * rayDir.y;
        } else {
            perpWallDist = (mapY - this.player.y + (1 - stepY) / 2) / rayDir.y;
            textureX = this.player.x + perpWallDist * rayDir.x;
        }
        
        textureX -= Math.floor(textureX);
        
        return {
            hit: hit,
            distance: perpWallDist,
            side: side,
            textureX: textureX
        };
    }
    
    drawWeapon() {
        // Dibujar arma simple en la parte inferior de la pantalla
        this.ctx.fillStyle = "#555";
        this.ctx.fillRect(this.canvas.width / 2 - 20, this.canvas.height - 100, 40, 80);
    }
}