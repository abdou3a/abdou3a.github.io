class Game {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.snakes = new Map();
        this.foods = [];
        this.gameState = 'menu'; // menu, playing, paused, gameOver
        this.isMultiplayer = false;
        this.playerId = null;
        this.roomCode = null;
        this.score = 0;
        this.level = 1;
        this.gameSpeed = 150; // ms between moves
        this.lastMoveTime = 0;
        this.gridSize = 20;
        this.boundarySize = 15;
        
        this.keys = {
            w: false, a: false, s: false, d: false,
            ArrowUp: false, ArrowLeft: false, ArrowDown: false, ArrowRight: false,
            space: false
        };
        
        this.init();
    }
    
    init() {
        this.setupThreeJS();
        this.setupLighting();
        this.setupEnvironment();
        this.setupEventListeners();
        this.setupUI();
        this.animate();
    }
    
    setupThreeJS() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000510);
        this.scene.fog = new THREE.Fog(0x000510, 50, 200);
        
        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            1000
        );
        this.camera.position.set(0, 25, 25);
        this.camera.lookAt(0, 0, 0);
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: document.getElementById('game-canvas'),
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
    
    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);
        
        // Directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        
        // Point lights for atmosphere
        const pointLight1 = new THREE.PointLight(0x00ff88, 0.5, 50);
        pointLight1.position.set(-10, 10, -10);
        this.scene.add(pointLight1);
        
        const pointLight2 = new THREE.PointLight(0xff4757, 0.5, 50);
        pointLight2.position.set(10, 10, 10);
        this.scene.add(pointLight2);
    }
    
    setupEnvironment() {
        // Game boundaries
        this.createBoundaries();
        
        // Grid floor
        this.createGrid();
        
        // Particle system
        this.createParticles();
    }
    
    createBoundaries() {
        const wallGeometry = new THREE.BoxGeometry(1, 3, 1);
        const wallMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x333333,
            transparent: true,
            opacity: 0.8
        });
        
        // Create walls around the play area
        for (let x = -this.boundarySize; x <= this.boundarySize; x++) {
            for (let z = -this.boundarySize; z <= this.boundarySize; z++) {
                if (x === -this.boundarySize || x === this.boundarySize || 
                    z === -this.boundarySize || z === this.boundarySize) {
                    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
                    wall.position.set(x, 1.5, z);
                    wall.castShadow = true;
                    wall.receiveShadow = true;
                    this.scene.add(wall);
                }
            }
        }
    }
    
    createGrid() {
        const gridHelper = new THREE.GridHelper(
            this.boundarySize * 2, 
            this.boundarySize * 2, 
            0x444444, 
            0x444444
        );
        gridHelper.position.y = 0;
        this.scene.add(gridHelper);
        
        // Floor
        const floorGeometry = new THREE.PlaneGeometry(
            this.boundarySize * 2, 
            this.boundarySize * 2
        );
        const floorMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x111111,
            transparent: true,
            opacity: 0.8
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);
    }
    
    createParticles() {
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 1000;
        const posArray = new Float32Array(particlesCount * 3);
        
        for (let i = 0; i < particlesCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 200;
        }
        
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        
        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.3,
            color: 0xffffff,
            transparent: true,
            opacity: 0.8
        });
        
        this.particles = new THREE.Points(particlesGeometry, particlesMaterial);
        this.scene.add(this.particles);
    }
    
    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (event) => {
            if (event.code in this.keys) {
                this.keys[event.code] = true;
                event.preventDefault();
            }
            
            // Special keys
            switch (event.code) {
                case 'Escape':
                    this.toggleMenu();
                    break;
                case 'KeyP':
                    this.togglePause();
                    break;
            }
        });
        
        document.addEventListener('keyup', (event) => {
            if (event.code in this.keys) {
                this.keys[event.code] = false;
                event.preventDefault();
            }
        });
        
        // Menu buttons
        document.getElementById('single-player-btn').addEventListener('click', () => {
            this.startSinglePlayer();
        });
        
        document.getElementById('multi-player-btn').addEventListener('click', () => {
            this.startMultiplayer();
        });
        
        document.getElementById('create-room-btn').addEventListener('click', () => {
            this.createRoom();
        });
        
        document.getElementById('join-room-btn').addEventListener('click', () => {
            this.joinRoom();
        });
    }
    
    setupUI() {
        this.ui = new UI(this);
        this.multiplayer = new Multiplayer(this);
    }
    
    startSinglePlayer() {
        this.isMultiplayer = false;
        this.gameState = 'playing';
        this.playerId = 'player1';
        
        // Create player snake
        const playerSnake = new Snake(this, this.playerId, 0x00ff88, { x: 0, z: 0 });
        this.snakes.set(this.playerId, playerSnake);
        
        // Generate initial food
        this.generateFood();
        
        // Hide menu, show game UI
        document.getElementById('main-menu').style.display = 'none';
        document.getElementById('game-ui').style.display = 'block';
        
        this.resetGameStats();
    }
    
    startMultiplayer() {
        this.isMultiplayer = true;
        this.multiplayer.connect();
    }
    
    createRoom() {
        const playerName = document.getElementById('player-name').value || 'Joueur';
        this.multiplayer.createRoom(playerName);
    }
    
    joinRoom() {
        const roomCode = document.getElementById('room-code').value;
        const playerName = document.getElementById('player-name').value || 'Joueur';
        
        if (roomCode) {
            this.multiplayer.joinRoom(roomCode, playerName);
        }
    }
    
    generateFood() {
        // Remove old food
        this.foods.forEach(food => food.destroy());
        this.foods = [];
        
        // Generate new food
        const foodCount = this.isMultiplayer ? 3 : 1;
        for (let i = 0; i < foodCount; i++) {
            let position;
            let attempts = 0;
            
            do {
                position = {
                    x: Math.floor(Math.random() * (this.boundarySize * 2 - 2)) - this.boundarySize + 1,
                    z: Math.floor(Math.random() * (this.boundarySize * 2 - 2)) - this.boundarySize + 1
                };
                attempts++;
            } while (this.isPositionOccupied(position) && attempts < 50);
            
            const food = new Food(this, position);
            this.foods.push(food);
        }
    }
    
    isPositionOccupied(position) {
        for (let snake of this.snakes.values()) {
            if (snake.isPositionOccupied(position)) {
                return true;
            }
        }
        return false;
    }
    
    update(deltaTime) {
        if (this.gameState !== 'playing') return;
        
        // Update particles
        if (this.particles) {
            this.particles.rotation.y += 0.001;
        }
        
        // Update snakes
        if (Date.now() - this.lastMoveTime > this.gameSpeed) {
            this.updateSnakes();
            this.lastMoveTime = Date.now();
        }
        
        // Update foods
        this.foods.forEach(food => food.update(deltaTime));
        
        // Check for food collection
        this.checkFoodCollection();
        
        // Update UI
        this.ui.update();
    }
    
    updateSnakes() {
        const playerSnake = this.snakes.get(this.playerId);
        if (playerSnake) {
            // Get player input
            const direction = this.getPlayerDirection();
            if (direction) {
                playerSnake.setDirection(direction);
            }
            
            // Update player snake
            const moved = playerSnake.update();
            
            if (moved && this.isMultiplayer) {
                // Send position to other players
                this.multiplayer.sendPlayerPosition(playerSnake.getHeadPosition());
            }
        }
        
        // Update other snakes (multiplayer)
        for (let [id, snake] of this.snakes) {
            if (id !== this.playerId) {
                snake.update();
            }
        }
    }
    
    getPlayerDirection() {
        if (this.keys.w || this.keys.ArrowUp) return { x: 0, z: -1 };
        if (this.keys.s || this.keys.ArrowDown) return { x: 0, z: 1 };
        if (this.keys.a || this.keys.ArrowLeft) return { x: -1, z: 0 };
        if (this.keys.d || this.keys.ArrowRight) return { x: 1, z: 0 };
        return null;
    }
    
    checkFoodCollection() {
        const playerSnake = this.snakes.get(this.playerId);
        if (!playerSnake) return;
        
        const headPos = playerSnake.getHeadPosition();
        
        for (let i = this.foods.length - 1; i >= 0; i--) {
            const food = this.foods[i];
            if (food.position.x === headPos.x && food.position.z === headPos.z) {
                // Collect food
                playerSnake.grow();
                this.score += 10 * this.level;
                
                // Remove food
                food.destroy();
                this.foods.splice(i, 1);
                
                // Check level up
                if (playerSnake.segments.length % 5 === 0) {
                    this.level++;
                    this.gameSpeed = Math.max(50, this.gameSpeed - 10);
                }
                
                // Generate new food
                if (this.foods.length === 0) {
                    this.generateFood();
                }
                
                if (this.isMultiplayer) {
                    this.multiplayer.sendFoodCollected(food.position);
                }
                
                break;
            }
        }
    }
    
    resetGameStats() {
        this.score = 0;
        this.level = 1;
        this.gameSpeed = 150;
    }
    
    toggleMenu() {
        if (this.gameState === 'menu') {
            return;
        }
        
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            document.getElementById('main-menu').style.display = 'flex';
        } else {
            this.gameState = 'playing';
            document.getElementById('main-menu').style.display = 'none';
        }
    }
    
    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
        }
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        
        if (this.isMultiplayer) {
            this.multiplayer.sendGameOver();
        }
        
        // Show game over menu
        setTimeout(() => {
            alert(`Game Over! Score: ${this.score}`);
            this.resetGame();
        }, 100);
    }
    
    resetGame() {
        // Clear snakes
        for (let snake of this.snakes.values()) {
            snake.destroy();
        }
        this.snakes.clear();
        
        // Clear foods
        this.foods.forEach(food => food.destroy());
        this.foods = [];
        
        // Reset to menu
        this.gameState = 'menu';
        document.getElementById('main-menu').style.display = 'flex';
        document.getElementById('game-ui').style.display = 'none';
        
        this.resetGameStats();
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        const deltaTime = Date.now();
        this.update(deltaTime);
        this.renderer.render(this.scene, this.camera);
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    // Game will be initialized from the main HTML after loading screen
});
