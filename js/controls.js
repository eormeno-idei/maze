class Controls {
    constructor() {
        this.keys = {};
        
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            // Prevent scrolling when using arrow keys
            if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
                e.preventDefault();
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }
    
    isPressed(keyCode) {
        return this.keys[keyCode] === true;
    }
}

function setupControls(player) {
    const controls = new Controls();
    
    function update() {
        if (controls.isPressed('ArrowUp')) {
            player.move(0, -1);
        }
        if (controls.isPressed('ArrowDown')) {
            player.move(0, 1);
        }
        if (controls.isPressed('ArrowLeft')) {
            player.move(-1, 0);
        }
        if (controls.isPressed('ArrowRight')) {
            player.move(1, 0);
        }
        
        requestAnimationFrame(update);
    }
    
    update();
}