// Quantum Maze Runner - Jeu Innovant 3D
class QuantumMazeRunner {
    constructor() {
        // Core game properties
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.player = null;
        this.maze = [];
        this.crystals = [];
        this.portals = [];
        this.gameRunning = false;
        
        // Game state
        this.score = 0;
        this.level = 1;
        this.crystalsCollected = 0;
        this.startTime = 0;
        this.quantumCoherence = 100;
        this.currentDimension = 0;
        this.mazeSize = 15;
        
        // Player properties
        this.playerPosition = { x: 0, y: 1, z: 0 };
        this.playerVelocity = { x: 0, y: 0, z: 0 };
        this.isJumping = false;
        this.canTeleport = true;
        this.quantumVisionActive = false;
        this.phaseShiftActive = false;
        
        // Physics
        this.gravity = -0.02;
        this.jumpPower = 0.3;
        this.moveSpeed = 0.15;
        this.teleportCooldown = 0;
        this.segmentSize = 0.9;
        
        // Quantum mechanics
        this.dimensions = [
            { name: "Réalité Alpha", color: 0x00ffff, walls: 0x0099cc },
            { name: "Dimension Beta", color: 0xff00ff, walls: 0xcc0099 },
            { name: "Univers Gamma", color: 0xffff00, walls: 0xcccc00 },
            { name: "Phase Delta", color: 0x00ff00, walls: 0x009900 }
        ];
        
        // Input handling
        this.keysPressed = new Set();
        this.lastInputTime = 0;
        
        // Settings
        this.settings = {
            volume: 75,
            graphics: 'medium',
            effects: 'standard'
        };
        
        // Audio
        this.audioContext = null;
        this.sounds = {};
        
        // Initialize
        this.init();
    }
    
    init() {
        this.showLoading();
        this.loadSettings();
        this.initAudio();
        
        setTimeout(() => {
            this.hideLoading();
            this.showMainMenu();
            this.initEventListeners();
            this.createQuantumParticles();
        }, 3000);
    }
    
    // Audio System
    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.createSounds();
        } catch (error) {
            console.warn('Audio not supported:', error);
        }
    }
    
    createSounds() {
        this.sounds = {
            collect: this.createTone(880, 0.2),
            jump: this.createTone(440, 0.1),
            teleport: this.createTone(1320, 0.3),
            dimension: this.createTone(660, 0.5),
            victory: this.createTone(1760, 0.4),
            danger: this.createTone(220, 0.3)
        };
    }
    
    createTone(frequency, duration) {
        return () => {
            if (!this.audioContext) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';
            
            const volume = this.settings.volume / 100 * 0.1;
            gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        };
    }
    
    playSound(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName]();
        }
    }
    
    // Event Listeners
    initEventListeners() {
        // Menu buttons
        document.getElementById('start-game-btn').addEventListener('click', () => this.startGame());
        document.getElementById('tutorial-btn').addEventListener('click', () => this.showTutorial());
        document.getElementById('settings-btn').addEventListener('click', () => this.showSettings());
        document.getElementById('about-btn').addEventListener('click', () => this.showAbout());
        
        // Settings
        document.getElementById('save-settings').addEventListener('click', () => this.applySettings());
        document.getElementById('close-settings').addEventListener('click', () => this.hideSettings());
        
        // Game over
        document.getElementById('restart-game').addEventListener('click', () => this.restartGame());
        document.getElementById('back-to-menu').addEventListener('click', () => this.backToMenu());
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // Mobile controls
        document.querySelectorAll('.control-btn[data-direction]').forEach(btn => {
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.handleMobileInput(btn.dataset.direction, true);
            });
            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.handleMobileInput(btn.dataset.direction, false);
            });
        });
        
        document.querySelectorAll('.control-btn[data-action]').forEach(btn => {
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.handleMobileAction(btn.dataset.action);
            });
        });
        
        // Window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    // Input Handling
    handleKeyDown(e) {
        this.keysPressed.add(e.code);
        
        switch (e.code) {
            case 'Space':
                e.preventDefault();
                this.jump();
                break;
            case 'ShiftLeft':
            case 'ShiftRight':
                e.preventDefault();
                this.togglePhaseShift();
                break;
            case 'KeyQ':
                e.preventDefault();
                this.teleport();
                break;
            case 'KeyE':
                e.preventDefault();
                this.toggleQuantumVision();
                break;
            case 'Escape':
                e.preventDefault();
                this.togglePause();
                break;
        }
    }
    
    handleKeyUp(e) {
        this.keysPressed.delete(e.code);
        
        if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
            this.phaseShiftActive = false;
        }
    }
    
    // Game Mechanics
    async startGame() {
        this.hideMainMenu();
        this.showGameUI();
        
        if (!this.scene) {
            await this.initThreeJS();
        }
        
        this.resetGame();
        this.generateMaze();
        this.spawnPlayer();
        this.spawnCrystals();
        this.spawnPortals();
        
        this.gameRunning = true;
        this.startTime = Date.now();
        this.animate();
        
        this.showNotification('🌌 Bienvenue dans le Labyrinthe Quantique!');
    }
    
    // Three.js Initialization
    async initThreeJS() {
        const canvas = document.getElementById('game-canvas');
        canvas.style.display = 'block';
        
        // Scene
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x000000, 10, 50);
        
        // Camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 8, 8);
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: canvas, 
            antialias: this.settings.graphics !== 'low',
            powerPreference: this.settings.graphics === 'high' ? 'high-performance' : 'default'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.settings.graphics === 'ultra' ? 2 : 1));
        this.renderer.shadowMap.enabled = this.settings.graphics !== 'low';
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = this.settings.graphics !== 'low';
        this.scene.add(directionalLight);
        
        // Dynamic lights
        this.quantumLight = new THREE.PointLight(0x00ffff, 1, 20);
        this.quantumLight.position.set(0, 5, 0);
        this.scene.add(this.quantumLight);
        
        console.log('Three.js initialized');
    }
    
    // Maze Generation
    generateMaze() {
        const size = this.mazeSize;
        this.maze = Array(size).fill().map(() => Array(size).fill(1));
        
        // Generate maze using recursive backtracking
        const stack = [];
        const start = { x: 1, y: 1 };
        this.maze[start.y][start.x] = 0;
        stack.push(start);
        
        const directions = [
            { x: 0, y: -2 }, { x: 2, y: 0 },
            { x: 0, y: 2 }, { x: -2, y: 0 }
        ];
        
        while (stack.length > 0) {
            const current = stack[stack.length - 1];
            const neighbors = [];
            
            directions.forEach(dir => {
                const nx = current.x + dir.x;
                const ny = current.y + dir.y;
                
                if (nx > 0 && nx < size - 1 && ny > 0 && ny < size - 1 && this.maze[ny][nx] === 1) {
                    neighbors.push({ x: nx, y: ny, wallX: current.x + dir.x / 2, wallY: current.y + dir.y / 2 });
                }
            });
            
            if (neighbors.length > 0) {
                const next = neighbors[Math.floor(Math.random() * neighbors.length)];
                this.maze[next.y][next.x] = 0;
                this.maze[next.wallY][next.wallX] = 0;
                stack.push({ x: next.x, y: next.y });
            } else {
                stack.pop();
            }
        }
        
        this.createMazeWalls();
    }
    
    createMazeWalls() {
        const dimension = this.dimensions[this.currentDimension];
        const wallMaterial = new THREE.MeshPhongMaterial({ 
            color: dimension.walls,
            transparent: true,
            opacity: 0.8
        });
        
        for (let z = 0; z < this.mazeSize; z++) {
            for (let x = 0; x < this.mazeSize; x++) {
                if (this.maze[z][x] === 1) {
                    const wallGeometry = new THREE.BoxGeometry(1, 3, 1);
                    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
                    wall.position.set(x - this.mazeSize/2, 1.5, z - this.mazeSize/2);
                    wall.castShadow = true;
                    wall.receiveShadow = true;
                    wall.userData.gameObject = true;
                    wall.userData.type = 'wall';
                    this.scene.add(wall);
                }
            }
        }
        
        // Ground
        const groundGeometry = new THREE.PlaneGeometry(this.mazeSize * 2, this.mazeSize * 2);
        const groundMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x111111,
            transparent: true,
            opacity: 0.5
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        ground.userData.gameObject = true;
        this.scene.add(ground);
    }
    
    // Player System
    spawnPlayer() {
        const playerGeometry = new THREE.CapsuleGeometry(0.3, 1.2, 4, 8);
        const playerMaterial = new THREE.MeshPhongMaterial({ 
            color: this.dimensions[this.currentDimension].color,
            emissive: this.dimensions[this.currentDimension].color,
            emissiveIntensity: 0.2
        });
        
        this.player = new THREE.Mesh(playerGeometry, playerMaterial);
        this.player.position.set(this.playerPosition.x, this.playerPosition.y, this.playerPosition.z);
        this.player.castShadow = true;
        this.player.userData.gameObject = true;
        this.scene.add(this.player);
        
        // Quantum aura
        if (this.settings.effects !== 'minimal') {
            const auraGeometry = new THREE.SphereGeometry(0.8, 16, 16);
            const auraMaterial = new THREE.MeshBasicMaterial({
                color: this.dimensions[this.currentDimension].color,
                transparent: true,
                opacity: 0.2,
                blending: THREE.AdditiveBlending
            });
            const aura = new THREE.Mesh(auraGeometry, auraMaterial);
            this.player.add(aura);
        }
    }
    
    // Quantum Mechanics
    jump() {
        if (!this.isJumping && this.gameRunning) {
            this.playerVelocity.y = this.jumpPower;
            this.isJumping = true;
            this.playSound('jump');
            this.showNotification('🚀 Saut Quantique!', 'info', 1000);
        }
    }
    
    teleport() {
        if (this.teleportCooldown <= 0 && this.gameRunning) {
            const distance = 3;
            const angle = Math.random() * Math.PI * 2;
            const newX = this.playerPosition.x + Math.cos(angle) * distance;
            const newZ = this.playerPosition.z + Math.sin(angle) * distance;
            
            // Check if teleport position is valid
            const mazeX = Math.floor(newX + this.mazeSize/2);
            const mazeZ = Math.floor(newZ + this.mazeSize/2);
            
            if (mazeX >= 0 && mazeX < this.mazeSize && mazeZ >= 0 && mazeZ < this.mazeSize && 
                this.maze[mazeZ][mazeX] === 0) {
                this.playerPosition.x = newX;
                this.playerPosition.z = newZ;
                this.teleportCooldown = 3000; // 3 seconds
                this.quantumCoherence = Math.max(0, this.quantumCoherence - 10);
                this.playSound('teleport');
                this.showNotification('📡 Téléportation Quantique!', 'warning', 1500);
            }
        }
    }
    
    togglePhaseShift() {
        this.phaseShiftActive = !this.phaseShiftActive;
        if (this.phaseShiftActive) {
            this.quantumCoherence = Math.max(0, this.quantumCoherence - 5);
            this.showNotification('🌀 Phase Shift Activé!', 'info', 1500);
        }
    }
    
    toggleQuantumVision() {
        this.quantumVisionActive = !this.quantumVisionActive;
        this.quantumCoherence = Math.max(0, this.quantumCoherence - 5);
        
        if (this.quantumVisionActive) {
            this.scene.traverse((child) => {
                if (child.material && child.userData.type === 'wall') {
                    child.material.opacity = 0.3;
                }
            });
            this.showNotification('👁️ Vision Quantique Activée!', 'info', 2000);
        } else {
            this.scene.traverse((child) => {
                if (child.material && child.userData.type === 'wall') {
                    child.material.opacity = 0.8;
                }
            });
        }
    }
    
    // Game Objects
    spawnCrystals() {
        const crystalCount = 5 + this.level;
        for (let i = 0; i < crystalCount; i++) {
            let x, z;
            do {
                x = Math.floor(Math.random() * (this.mazeSize - 2)) + 1;
                z = Math.floor(Math.random() * (this.mazeSize - 2)) + 1;
            } while (this.maze[z][x] === 1 || (x === Math.floor(this.mazeSize/2) && z === Math.floor(this.mazeSize/2)));
            
            const crystalGeometry = new THREE.OctahedronGeometry(0.3);
            const crystalMaterial = new THREE.MeshPhongMaterial({
                color: 0x00ffff,
                emissive: 0x00ffff,
                emissiveIntensity: 0.3,
                transparent: true,
                opacity: 0.8
            });
            
            const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
            crystal.position.set(x - this.mazeSize/2, 1, z - this.mazeSize/2);
            crystal.userData.gameObject = true;
            crystal.userData.type = 'crystal';
            crystal.userData.collected = false;
            this.scene.add(crystal);
            this.crystals.push(crystal);
        }
    }
    
    spawnPortals() {
        const portalCount = Math.min(2 + Math.floor(this.level / 2), 4);
        for (let i = 0; i < portalCount; i++) {
            let x, z;
            do {
                x = Math.floor(Math.random() * (this.mazeSize - 2)) + 1;
                z = Math.floor(Math.random() * (this.mazeSize - 2)) + 1;
            } while (this.maze[z][x] === 1);
            
            const portalGeometry = new THREE.RingGeometry(0.5, 1, 16);
            const portalMaterial = new THREE.MeshBasicMaterial({
                color: this.dimensions[(this.currentDimension + i + 1) % this.dimensions.length].color,
                transparent: true,
                opacity: 0.6,
                side: THREE.DoubleSide
            });
            
            const portal = new THREE.Mesh(portalGeometry, portalMaterial);
            portal.position.set(x - this.mazeSize/2, 1, z - this.mazeSize/2);
            portal.rotation.x = Math.PI / 2;
            portal.userData.gameObject = true;
            portal.userData.type = 'portal';
            portal.userData.targetDimension = (this.currentDimension + i + 1) % this.dimensions.length;
            this.scene.add(portal);
            this.portals.push(portal);
        }
    }
    
    // Game Loop
    updatePlayer() {
        if (!this.gameRunning) return;
        
        // Handle movement input
        let moveX = 0;
        let moveZ = 0;
        
        if (this.keysPressed.has('KeyW') || this.keysPressed.has('ArrowUp')) moveZ -= 1;
        if (this.keysPressed.has('KeyS') || this.keysPressed.has('ArrowDown')) moveZ += 1;
        if (this.keysPressed.has('KeyA') || this.keysPressed.has('ArrowLeft')) moveX -= 1;
        if (this.keysPressed.has('KeyD') || this.keysPressed.has('ArrowRight')) moveX += 1;
        
        // Normalize movement
        if (moveX !== 0 || moveZ !== 0) {
            const length = Math.sqrt(moveX * moveX + moveZ * moveZ);
            moveX /= length;
            moveZ /= length;
        }
        
        // Apply movement
        const speed = this.phaseShiftActive ? this.moveSpeed * 1.5 : this.moveSpeed;
        const newX = this.playerPosition.x + moveX * speed;
        const newZ = this.playerPosition.z + moveZ * speed;
        
        // Collision detection (unless phase shifting)
        if (this.phaseShiftActive || this.canMove(newX, newZ)) {
            this.playerPosition.x = newX;
            this.playerPosition.z = newZ;
        }
        
        // Apply gravity
        this.playerVelocity.y += this.gravity;
        this.playerPosition.y += this.playerVelocity.y;
        
        // Ground collision
        if (this.playerPosition.y <= 1) {
            this.playerPosition.y = 1;
            this.playerVelocity.y = 0;
            this.isJumping = false;
        }
        
        // Update player mesh
        if (this.player) {
            this.player.position.set(this.playerPosition.x, this.playerPosition.y, this.playerPosition.z);
        }
        
        // Update cooldowns
        if (this.teleportCooldown > 0) {
            this.teleportCooldown -= 16; // Assuming 60fps
        }
        
        // Slowly regenerate quantum coherence
        if (this.quantumCoherence < 100) {
            this.quantumCoherence = Math.min(100, this.quantumCoherence + 0.1);
        }
    }
    
    canMove(x, z) {
        const mazeX = Math.floor(x + this.mazeSize/2);
        const mazeZ = Math.floor(z + this.mazeSize/2);
        
        if (mazeX < 0 || mazeX >= this.mazeSize || mazeZ < 0 || mazeZ >= this.mazeSize) {
            return false;
        }
        
        return this.maze[mazeZ][mazeX] === 0;
    }
    
    checkCollisions() {
        // Check crystal collection
        this.crystals.forEach(crystal => {
            if (!crystal.userData.collected) {
                const distance = this.player.position.distanceTo(crystal.position);
                if (distance < 0.8) {
                    this.collectCrystal(crystal);
                }
            }
        });
        
        // Check portal entry
        this.portals.forEach(portal => {
            const distance = this.player.position.distanceTo(portal.position);
            if (distance < 1.2) {
                this.enterPortal(portal);
            }
        });
    }
    
    collectCrystal(crystal) {
        crystal.userData.collected = true;
        this.scene.remove(crystal);
        this.crystalsCollected++;
        this.score += 100 * this.level;
        this.quantumCoherence = Math.min(100, this.quantumCoherence + 10);
        this.playSound('collect');
        this.showNotification(`🔮 Cristal Collecté! +${100 * this.level} points`);
        
        // Check level completion
        if (this.crystalsCollected >= this.crystals.length) {
            this.completeLevel();
        }
    }
    
    enterPortal(portal) {
        this.currentDimension = portal.userData.targetDimension;
        this.scene.remove(portal);
        this.quantumCoherence = Math.max(0, this.quantumCoherence - 20);
        this.playSound('dimension');
        this.showNotification(`🌊 Dimension Changée: ${this.dimensions[this.currentDimension].name}`, 'warning');
        
        // Change lighting and colors
        this.updateDimensionEffects();
    }
    
    completeLevel() {
        this.level++;
        this.score += 1000;
        this.playSound('victory');
        this.showNotification(`🎉 Niveau ${this.level - 1} Terminé! Bonus: 1000 points`);
        
        // Reset for next level
        this.crystalsCollected = 0;
        this.mazeSize = Math.min(20, 15 + this.level);
        this.quantumCoherence = 100;
        
        // Regenerate level
        setTimeout(() => {
            this.resetGame();
            this.generateMaze();
            this.spawnPlayer();
            this.spawnCrystals();
            this.spawnPortals();
        }, 2000);
    }
    
    // Animation and Rendering
    animate() {
        if (!this.gameRunning) return;
        
        requestAnimationFrame(() => this.animate());
        
        const currentTime = Date.now();
        
        // Update player
        this.updatePlayer();
        this.checkCollisions();
        this.updateCamera();
        this.updateMiniMap();
        this.updateUI();
        
        // Animate crystals
        this.crystals.forEach(crystal => {
            if (!crystal.userData.collected) {
                crystal.rotation.y += 0.02;
                crystal.position.y = 1 + Math.sin(currentTime * 0.003) * 0.1;
            }
        });
        
        // Animate portals
        this.portals.forEach(portal => {
            portal.rotation.z += 0.01;
            portal.material.opacity = 0.4 + Math.sin(currentTime * 0.005) * 0.2;
        });
        
        // Quantum coherence effects
        if (this.quantumCoherence < 50) {
            this.scene.fog.density = 0.02 + (50 - this.quantumCoherence) * 0.001;
        }
        
        this.renderer.render(this.scene, this.camera);
    }
    
    updateCamera() {
        if (!this.player || !this.camera) return;
        
        // Third-person camera following player
        const idealOffset = new THREE.Vector3(0, 8, 8);
        const idealLookAt = new THREE.Vector3(this.playerPosition.x, this.playerPosition.y + 1, this.playerPosition.z);
        
        // Smooth camera movement
        this.camera.position.lerp(idealLookAt.clone().add(idealOffset), 0.05);
        this.camera.lookAt(idealLookAt);
    }
    
    updateMiniMap() {
        const canvas = document.getElementById('mini-map-canvas');
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = 'rgba(10, 10, 40, 0.9)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const scale = canvas.width / this.mazeSize;
        
        // Draw maze
        for (let z = 0; z < this.mazeSize; z++) {
            for (let x = 0; x < this.mazeSize; x++) {
                if (this.maze[z][x] === 1) {
                    ctx.fillStyle = '#666';
                    ctx.fillRect(x * scale, z * scale, scale, scale);
                }
            }
        }
        
        // Draw crystals
        ctx.fillStyle = '#00ffff';
        this.crystals.forEach(crystal => {
            if (!crystal.userData.collected) {
                const x = (crystal.position.x + this.mazeSize/2) * scale;
                const z = (crystal.position.z + this.mazeSize/2) * scale;
                ctx.beginPath();
                ctx.arc(x, z, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        
        // Draw player
        const dimension = this.dimensions[this.currentDimension];
        ctx.fillStyle = dimension.color === 0x00ffff ? '#00ffff' : 
                        dimension.color === 0xff00ff ? '#ff00ff' : 
                        dimension.color === 0xffff00 ? '#ffff00' : '#00ff00';
        const playerX = (this.playerPosition.x + this.mazeSize/2) * scale;
        const playerZ = (this.playerPosition.z + this.mazeSize/2) * scale;
        ctx.beginPath();
        ctx.arc(playerX, playerZ, 4, 0, Math.PI * 2);
        ctx.fill();
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        document.getElementById('crystals').textContent = this.crystalsCollected + '/' + this.crystals.length;
        document.getElementById('coherence').textContent = Math.floor(this.quantumCoherence) + '%';
        
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        document.getElementById('time').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // Update quantum meter
        const fill = document.getElementById('quantum-fill');
        fill.style.width = this.quantumCoherence + '%';
        
        // Update quantum effect text
        const effectText = document.getElementById('quantum-effect');
        if (this.quantumCoherence > 80) {
            effectText.textContent = 'État Stable';
            effectText.style.color = '#00ff00';
        } else if (this.quantumCoherence > 50) {
            effectText.textContent = 'Instabilité Mineure';
            effectText.style.color = '#ffff00';
        } else if (this.quantumCoherence > 20) {
            effectText.textContent = 'Déformation Réalité';
            effectText.style.color = '#ff9900';
        } else {
            effectText.textContent = 'Effondrement Imminent!';
            effectText.style.color = '#ff0000';
            
            // Game over if coherence drops too low
            if (this.quantumCoherence <= 0) {
                this.gameOver();
            }
        }
    }
    
    // UI Management
    updateDimensionEffects() {
        const dimension = this.dimensions[this.currentDimension];
        
        // Update quantum light
        this.quantumLight.color.setHex(dimension.color);
        
        // Update player color
        if (this.player) {
            this.player.material.color.setHex(dimension.color);
            this.player.material.emissive.setHex(dimension.color);
        }
        
        // Update scene effects
        this.scene.fog.color.setHex(dimension.color * 0.1);
    }
    
    resetGame() {
        this.score = 0;
        this.level = 1;
        this.crystalsCollected = 0;
        this.quantumCoherence = 100;
        this.currentDimension = 0;
        this.playerPosition = { x: 0, y: 1, z: 0 };
        this.playerVelocity = { x: 0, y: 0, z: 0 };
        this.teleportCooldown = 0;
        
        // Clear existing objects
        if (this.scene) {
            const objectsToRemove = [];
            this.scene.traverse((child) => {
                if (child.userData.gameObject) {
                    objectsToRemove.push(child);
                }
            });
            objectsToRemove.forEach(obj => this.scene.remove(obj));
        }
        
        this.maze = [];
        this.crystals = [];
        this.portals = [];
    }
    
    gameOver() {
        this.gameRunning = false;
        this.playSound('danger');
        this.showNotification('💀 Effondrement Quantique! Votre réalité s\'est désintégrée...', 'danger');
        
        setTimeout(() => {
            document.getElementById('game-over-modal').style.display = 'flex';
            this.updateGameOverStats();
        }, 2000);
    }
    
    updateGameOverStats() {
        const statsDiv = document.getElementById('game-over-stats');
        const timeElapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(timeElapsed / 60);
        const seconds = timeElapsed % 60;
        
        statsDiv.innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 20px;">🎯 ${this.score}</div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; text-align: left;">
                    <div><strong>🔮 Cristaux:</strong><br><span style="color: #00ffff;">${this.crystalsCollected}</span></div>
                    <div><strong>⚡ Niveau:</strong><br><span style="color: #00ffff;">${this.level}</span></div>
                    <div><strong>⏱️ Temps:</strong><br><span style="color: #00ffff;">${minutes}:${seconds.toString().padStart(2, '0')}</span></div>
                    <div><strong>🌊 Dimension:</strong><br><span style="color: #00ffff;">${this.dimensions[this.currentDimension].name}</span></div>
                </div>
            </div>
        `;
    }
    
    // Settings and UI
    loadSettings() {
        const saved = localStorage.getItem('quantumMazeSettings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
    }
    
    saveSettings() {
        localStorage.setItem('quantumMazeSettings', JSON.stringify(this.settings));
    }
    
    showSettings() {
        document.getElementById('settings-modal').style.display = 'flex';
        
        // Load current settings
        document.getElementById('volume-slider').value = this.settings.volume;
        document.getElementById('graphics-select').value = this.settings.graphics;
        document.getElementById('effects-select').value = this.settings.effects;
    }
    
    hideSettings() {
        document.getElementById('settings-modal').style.display = 'none';
    }
    
    applySettings() {
        this.settings.volume = parseInt(document.getElementById('volume-slider').value);
        this.settings.graphics = document.getElementById('graphics-select').value;
        this.settings.effects = document.getElementById('effects-select').value;
        
        this.saveSettings();
        this.hideSettings();
        this.showNotification('⚙️ Paramètres sauvegardés!');
    }
    
    createQuantumParticles() {
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'quantum-particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 3 + 's';
            document.body.appendChild(particle);
        }
    }
    
    // UI State Management
    showLoading() { 
        document.getElementById('loading-screen').style.display = 'flex'; 
    }
    
    hideLoading() { 
        document.getElementById('loading-screen').style.display = 'none'; 
    }
    
    showMainMenu() { 
        document.getElementById('main-menu').style.display = 'flex'; 
    }
    
    hideMainMenu() { 
        document.getElementById('main-menu').style.display = 'none'; 
    }
    
    showGameUI() { 
        document.getElementById('game-ui').style.display = 'block';
        document.getElementById('quantum-state').style.display = 'block';
        document.getElementById('mini-map').style.display = 'block';
    }
    
    hideGameUI() { 
        document.getElementById('game-ui').style.display = 'none';
        document.getElementById('quantum-state').style.display = 'none';
        document.getElementById('mini-map').style.display = 'none';
    }
    
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification show ${type}`;
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, duration);
    }
    
    // Event handlers
    showTutorial() {
        this.showNotification('🎓 Tutoriel: Utilisez WASD pour vous déplacer, Espace pour sauter, Q pour téléporter, E pour la vision quantique, Shift pour phase shift!', 'info', 5000);
    }
    
    showAbout() {
        this.showNotification('🌌 Quantum Maze Runner - Un jeu innovant mêlant mécaniques quantiques et exploration 3D!', 'info', 4000);
    }
    
    restartGame() {
        document.getElementById('game-over-modal').style.display = 'none';
        this.startGame();
    }
    
    backToMenu() {
        document.getElementById('game-over-modal').style.display = 'none';
        this.hideGameUI();
        document.getElementById('game-canvas').style.display = 'none';
        this.showMainMenu();
    }
    
    togglePause() {
        if (this.gameRunning) {
            this.gameRunning = false;
            this.showNotification('⏸️ Jeu en pause - Appuyez sur Échap pour reprendre');
        } else {
            this.gameRunning = true;
            this.animate();
            this.showNotification('▶️ Jeu repris!');
        }
    }
    
    handleMobileInput(direction, pressed) {
        const keyMap = {
            'up': 'KeyW',
            'down': 'KeyS',
            'left': 'KeyA',
            'right': 'KeyD'
        };
        
        if (pressed) {
            this.keysPressed.add(keyMap[direction]);
        } else {
            this.keysPressed.delete(keyMap[direction]);
        }
    }
    
    handleMobileAction(action) {
        switch (action) {
            case 'jump':
                this.jump();
                break;
            case 'teleport':
                this.teleport();
                break;
            case 'quantum-vision':
                this.toggleQuantumVision();
                break;
            case 'phase-shift':
                this.togglePhaseShift();
                break;
        }
    }
    
    onWindowResize() {
        if (!this.camera || !this.renderer) return;
        
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

// Initialize the game
window.addEventListener('load', () => {
    try {
        console.log('Initializing Quantum Maze Runner...');
        window.quantumGame = new QuantumMazeRunner();
        console.log('Quantum Maze Runner initialized successfully');
    } catch (error) {
        console.error('Failed to initialize Quantum Maze Runner:', error);
        document.getElementById('loading-screen').innerHTML = `
            <div style="text-align: center; color: #ff4757;">
                <h2>❌ Erreur Quantique</h2>
                <p>Impossible d'initialiser le labyrinthe quantique.</p>
                <p>Détails: ${error.message}</p>
                <button onclick="location.reload()" style="padding: 15px 30px; margin-top: 20px; 
                       background: #00ffff; color: #000; border: none; border-radius: 10px; cursor: pointer; font-weight: bold;">
                    🔄 Réinitialiser Réalité
                </button>
            </div>
        `;
    }
});

// Prevent unload during game
window.addEventListener('beforeunload', (e) => {
    if (window.quantumGame && window.quantumGame.gameRunning) {
        e.preventDefault();
        e.returnValue = 'Votre progression dans le labyrinthe quantique sera perdue. Êtes-vous sûr de vouloir quitter cette dimension ?';
    }
});
