class Snake {
    constructor(game, playerId, color, startPosition) {
        this.game = game;
        this.playerId = playerId;
        this.color = color;
        this.segments = [];
        this.direction = { x: 1, z: 0 };
        this.nextDirection = { x: 1, z: 0 };
        this.growing = false;
        
        // Create initial segment (head)
        this.createSegment(startPosition);
        
        // Create initial body segments
        for (let i = 1; i < 3; i++) {
            this.createSegment({
                x: startPosition.x - i,
                z: startPosition.z
            });
        }
    }
    
    createSegment(position) {
        const geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
        const material = new THREE.MeshLambertMaterial({ 
            color: this.segments.length === 0 ? this.color : this.color * 0.8
        });
        
        const segment = new THREE.Mesh(geometry, material);
        segment.position.set(position.x, 0.5, position.z);
        segment.castShadow = true;
        segment.receiveShadow = true;
        
        // Add glow effect for head
        if (this.segments.length === 0) {
            const glowGeometry = new THREE.BoxGeometry(1.2, 1.2, 1.2);
            const glowMaterial = new THREE.MeshBasicMaterial({
                color: this.color,
                transparent: true,
                opacity: 0.3
            });
            const glow = new THREE.Mesh(glowGeometry, glowMaterial);
            segment.add(glow);
        }
        
        this.game.scene.add(segment);
        this.segments.push({
            mesh: segment,
            position: { ...position }
        });
    }
    
    setDirection(newDirection) {
        // Prevent reverse direction
        if (newDirection.x === -this.direction.x && newDirection.z === -this.direction.z) {
            return;
        }
        this.nextDirection = newDirection;
    }
    
    update() {
        this.direction = this.nextDirection;
        
        // Calculate new head position
        const head = this.segments[0];
        const newHeadPosition = {
            x: head.position.x + this.direction.x,
            z: head.position.z + this.direction.z
        };
        
        // Check collision with walls
        if (this.checkWallCollision(newHeadPosition)) {
            this.game.gameOver();
            return false;
        }
        
        // Check collision with self
        if (this.checkSelfCollision(newHeadPosition)) {
            this.game.gameOver();
            return false;
        }
        
        // Check collision with other snakes (multiplayer)
        if (this.checkSnakeCollision(newHeadPosition)) {
            this.game.gameOver();
            return false;
        }
        
        // Move snake
        this.moveToPosition(newHeadPosition);
        
        return true;
    }
    
    moveToPosition(newHeadPosition) {
        // Store previous positions
        const previousPositions = this.segments.map(segment => ({ ...segment.position }));
        
        // Move head
        this.segments[0].position = newHeadPosition;
        this.segments[0].mesh.position.set(newHeadPosition.x, 0.5, newHeadPosition.z);
        
        // Move body segments
        for (let i = 1; i < this.segments.length; i++) {
            this.segments[i].position = previousPositions[i - 1];
            this.segments[i].mesh.position.set(
                previousPositions[i - 1].x, 
                0.5, 
                previousPositions[i - 1].z
            );
        }
        
        // Add new segment if growing
        if (this.growing) {
            const lastPosition = previousPositions[previousPositions.length - 1];
            this.createSegment(lastPosition);
            this.growing = false;
        }
    }
    
    checkWallCollision(position) {
        return position.x < -this.game.boundarySize + 1 || 
               position.x > this.game.boundarySize - 1 ||
               position.z < -this.game.boundarySize + 1 || 
               position.z > this.game.boundarySize - 1;
    }
    
    checkSelfCollision(position) {
        for (let i = 1; i < this.segments.length; i++) {
            const segment = this.segments[i];
            if (segment.position.x === position.x && segment.position.z === position.z) {
                return true;
            }
        }
        return false;
    }
    
    checkSnakeCollision(position) {
        for (let [id, snake] of this.game.snakes) {
            if (id === this.playerId) continue;
            
            for (let segment of snake.segments) {
                if (segment.position.x === position.x && segment.position.z === position.z) {
                    return true;
                }
            }
        }
        return false;
    }
    
    grow() {
        this.growing = true;
    }
    
    getHeadPosition() {
        return this.segments[0].position;
    }
    
    isPositionOccupied(position) {
        for (let segment of this.segments) {
            if (segment.position.x === position.x && segment.position.z === position.z) {
                return true;
            }
        }
        return false;
    }
    
    getLength() {
        return this.segments.length;
    }
    
    destroy() {
        this.segments.forEach(segment => {
            this.game.scene.remove(segment.mesh);
        });
        this.segments = [];
    }
    
    updateFromNetwork(positions) {
        // Update snake position from network data (multiplayer)
        for (let i = 0; i < Math.min(positions.length, this.segments.length); i++) {
            this.segments[i].position = positions[i];
            this.segments[i].mesh.position.set(positions[i].x, 0.5, positions[i].z);
        }
        
        // Add or remove segments if needed
        while (this.segments.length < positions.length) {
            this.createSegment(positions[this.segments.length]);
        }
        
        while (this.segments.length > positions.length) {
            const segment = this.segments.pop();
            this.game.scene.remove(segment.mesh);
        }
    }
}
