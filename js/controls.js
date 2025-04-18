class Controls {
    constructor() {
        this.up = false;
        this.down = false;
        this.left = false;
        this.right = false;
        this.strafeLeft = false;
        this.strafeRight = false;
        this.shooting = false;
        
        document.addEventListener('keydown', this.onKeyDown.bind(this));
        document.addEventListener('keyup', this.onKeyUp.bind(this));
        
        // Para capturar el movimiento del mouse (opcional)
        document.addEventListener('mousemove', this.onMouseMove.bind(this));
        document.addEventListener('click', this.onMouseClick.bind(this));
        
        // Bloquear puntero para FPS (opcional)
        this.pointerLocked = false;
        this.mouseSpeed = 0.002;
    }
    
    onKeyDown(event) {
        switch(event.code) {
            case 'ArrowUp':
            case 'KeyW':
                this.up = true;
                break;
            case 'ArrowDown':
            case 'KeyS':
                this.down = true;
                break;
            case 'ArrowLeft':
            case 'KeyA':
                this.strafeLeft = true;
                break;
            case 'ArrowRight':
            case 'KeyD':
                this.strafeRight = true;
                break;
            case 'KeyQ':
                this.left = true;
                break;
            case 'KeyE':
                this.right = true;
                break;
            case 'Space':
                this.shooting = true;
                break;
        }
    }
    
    onKeyUp(event) {
        switch(event.code) {
            case 'ArrowUp':
            case 'KeyW':
                this.up = false;
                break;
            case 'ArrowDown':
            case 'KeyS':
                this.down = false;
                break;
            case 'ArrowLeft':
            case 'KeyA':
                this.strafeLeft = false;
                break;
            case 'ArrowRight':
            case 'KeyD':
                this.strafeRight = false;
                break;
            case 'KeyQ':
                this.left = false;
                break;
            case 'KeyE':
                this.right = false;
                break;
            case 'Space':
                this.shooting = false;
                break;
        }
    }
    
    onMouseMove(event) {
        if (this.pointerLocked) {
            // Rotar el jugador según el movimiento del mouse
            // Necesitarás acceder al objeto player desde aquí o emitir un evento
            const player = window.gameInstance?.player;
            if (player) {
                player.direction += event.movementX * this.mouseSpeed;
            }
        }
    }
    
    onMouseClick(event) {
        const canvas = document.querySelector('#gameCanvas');
        
        // Solicitar bloqueo del puntero al hacer clic en el canvas
        if (canvas && !this.pointerLocked) {
            canvas.requestPointerLock = canvas.requestPointerLock || 
                                        canvas.mozRequestPointerLock;
            canvas.requestPointerLock();
        }
        
        this.shooting = true;
        setTimeout(() => { this.shooting = false; }, 100);
    }
    
    setupPointerLock() {
        document.addEventListener('pointerlockchange', this.onPointerLockChange.bind(this));
        document.addEventListener('mozpointerlockchange', this.onPointerLockChange.bind(this));
    }
    
    onPointerLockChange() {
        this.pointerLocked = document.pointerLockElement !== null || 
                           document.mozPointerLockElement !== null;
    }
}

function setupControls(player) {
    const controls = new Controls();
    
    function update() {
        if (controls.up) {
            player.move(0, -1);
        }
        if (controls.down) {
            player.move(0, 1);
        }
        if (controls.strafeLeft) {
            player.move(-1, 0);
        }
        if (controls.strafeRight) {
            player.move(1, 0);
        }
        if (controls.left) {
            player.rotate(-1);
        }
        if (controls.right) {
            player.rotate(1);
        }
        if (controls.shooting) {
            player.shoot();
        }
        
        requestAnimationFrame(update);
    }
    
    update();
}