class Food {
    constructor(game, position) {
        this.game = game;
        this.position = position;
        this.mesh = null;
        this.rotationSpeed = 0.05;
        this.bobSpeed = 0.03;
        this.bobOffset = Math.random() * Math.PI * 2;
        
        this.create();
    }
    
    create() {
        // Create food geometry (sphere with glow)
        const geometry = new THREE.SphereGeometry(0.3, 16, 16);
        const material = new THREE.MeshLambertMaterial({ 
            color: 0xffd700,
            emissive: 0x444400
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(this.position.x, 0.5, this.position.z);
        this.mesh.castShadow = true;
        
        // Add glow effect
        const glowGeometry = new THREE.SphereGeometry(0.5, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xffd700,
            transparent: true,
            opacity: 0.3
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.mesh.add(glow);
        
        // Add particles
        this.createParticles();
        
        this.game.scene.add(this.mesh);
    }
    
    createParticles() {
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 20;
        const posArray = new Float32Array(particlesCount * 3);
        
        for (let i = 0; i < particlesCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 2;
        }
        
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        
        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.1,
            color: 0xffd700,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
        
        this.particles = new THREE.Points(particlesGeometry, particlesMaterial);
        this.mesh.add(this.particles);
    }
    
    update(deltaTime) {
        if (!this.mesh) return;
        
        // Rotate food
        this.mesh.rotation.y += this.rotationSpeed;
        
        // Bob up and down
        const time = deltaTime * 0.001;
        this.mesh.position.y = 0.5 + Math.sin(time * 3 + this.bobOffset) * 0.1;
        
        // Animate particles
        if (this.particles) {
            this.particles.rotation.y += 0.02;
            
            // Update particle positions
            const positions = this.particles.geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                positions[i + 1] += Math.sin(time * 2 + i) * 0.01;
            }
            this.particles.geometry.attributes.position.needsUpdate = true;
        }
    }
    
    destroy() {
        if (this.mesh) {
            this.game.scene.remove(this.mesh);
            this.mesh = null;
        }
    }
}
