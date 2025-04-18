# Maze Documentation

## Project Description
Maze Game is a classic puzzle browser-based game where players navigate a character through procedurally generated mazes. Using arrow keys, players must find a path from the starting point (upper-left corner) to the end point (lower-right corner) while avoiding walls. The game features smooth animations, responsive controls, and progressively challenging mazes that test players' spatial reasoning and problem-solving skills.

The project serves as both an entertaining game and a demonstration of maze generation algorithms, canvas-based rendering, and modular JavaScript architecture. It's designed to be lightweight, accessible, and run efficiently in modern web browsers without requiring any additional plugins or installations.

## Detailed Project Structure
```
maze-game/
├── index.html        # Entry point HTML document that loads all resources
├── css/
│   └── style.css     # Game styling, layout and visual presentation
├── js/
│   ├── game.js       # Core game engine, initialization and main loop
│   ├── player.js     # Player entity implementation and interaction logic
│   ├── maze.js       # Maze generation algorithm and structure representation
│   └── controls.js   # Input handling and control mapping system
├── assets/
│   └── sprites/
│       ├── player.svg # Player character visual representation
│       └── wall.svg   # Wall element visual representation
└── README.md         # Project documentation
```

## File Descriptions

### HTML
- **index.html**: The main entry point for the application. Contains the canvas element where the game renders, loads all CSS and JavaScript files in the correct order, and sets up the initial page structure. Includes basic game information, controls description, and the container layout for the game interface.

### CSS
- **style.css**: Contains all styling for the game interface including the canvas positioning, UI elements, buttons, score display, and responsive layout adjustments. Implements a clean, minimalist design that focuses attention on the gameplay area while providing clear visual feedback for player actions.

### JavaScript
- **game.js**: The core engine file responsible for:
  - Initializing the game environment and canvas context
  - Implementing the main game loop using requestAnimationFrame
  - Managing game states (menu, playing, game over)
  - Coordinating interactions between player, maze, and controls modules
  - Handling win/loss conditions and score tracking
  - Managing performance optimization and frame timing

- **player.js**: Handles all player-related functionality:
  - Player object creation and property management
  - Movement mechanics and position updates
  - Animation states for different player directions
  - Collision detection with maze walls
  - Visual rendering of the player character and its dynamic elements (eyes)
  - Player state tracking (position, direction, animation progress)

- **maze.js**: Implements maze generation and representation:
  - Recursive backtracking algorithm for procedural maze creation
  - Grid-based data structure for maze representation
  - Methods for checking valid moves and wall collisions
  - Path validation to ensure maze solvability
  - Rendering functions for walls, paths, and special points (start/end)
  - Difficulty scaling options for maze complexity

- **controls.js**: Manages user input processing:
  - Event listeners for keyboard input (arrow keys)
  - Input buffering for responsive controls
  - Direction mapping and validation
  - Support for both keyboard and touch controls (mobile devices)
  - Custom event dispatching for game state changes

### Assets
- **player.svg**: Vector graphic representation of the player character, designed to be simple yet expressive with directional indicators (eyes) that provide visual feedback on movement direction.

- **wall.svg**: Vector graphic for maze walls with consistent styling that maintains visibility while not overwhelming the visual field, allowing players to easily distinguish pathways from obstacles.

This modular structure enables easy maintenance, feature additions, and component testing while maintaining clean separation of concerns throughout the codebase.

## Technical Details

### Game Engine
The game uses HTML5 Canvas for rendering and vanilla JavaScript for logic. The implementation is based on a main game loop that handles state updates and rendering on each frame.

### Maze Generation
The maze is procedurally generated using a recursive backtracking algorithm with the following characteristics:
- Random generation of walls and paths
- Multiple passages and connections to create a challenging experience
- Fixed starting point (upper-left corner)
- End point marked in green (lower-right corner)

### Rendering System
- Canvas size: 840x600 pixels
- Cell size: 40x40 pixels
- Grid-based rendering with visual distinction between walls and paths
- Smooth animations for player movement

### Player Mechanics
- The player is represented as a blue circle with eyes
- The player's eyes change position based on the direction of movement
- Smooth movement between cells with fluid animation
- Collision detection with maze walls
- Movement limited to cardinal directions (up, down, left, right)

## Controls
- **Up arrow**: Move up
- **Down arrow**: Move down
- **Left arrow**: Move left
- **Right arrow**: Move right

## System Requirements
- Modern web browser with HTML5 Canvas support
- JavaScript enabled
- Recommended browsers: Chrome 80+, Firefox 75+, Edge 80+, Safari 13+

## Code Architecture
The project follows a modular architecture with separation of concerns:
- **game.js**: Game initialization, main loop, and state management
- **maze.js**: Maze generation algorithm and structure representation
- **player.js**: Player character logic, movement, and rendering
- **controls.js**: Keyboard input capture and processing

## How to Contribute
1. Fork this repository
2. Create a new branch (`git checkout -b feature/new-feature`)
3. Make your changes and commit them (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a new Pull Request

## License
This project is under the MIT License - see the LICENSE file for more details.