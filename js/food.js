class Food {
    constructor(game, position) {
        this.game = game;
        this.position = position;
        this.mesh = null;
        this.rotationSpeed = 0.05;
        this.bobSpeed = 0.03;
        this.bobOffset = Math.random() * Math.PI * 2;
        this.pulseSpeed = 0.02;
        this.baseScale = 0.3;
        
        this.create();
    }
    
    create() {
        try {
            // Create food geometry with enhanced visuals
            const geometry = new THREE.SphereGeometry(this.baseScale, 16, 16);
            const material = new THREE.MeshLambertMaterial({ 
                color: 0xffd700,
                emissive: 0x444400,
                transparent: true,
                opacity: 0.9
            });
            
            this.mesh = new THREE.Mesh(geometry, material);
            this.mesh.position.set(this.position.x, 0.5, this.position.z);
            this.mesh.castShadow = true;
            this.mesh.receiveShadow = true;
            
            // Enhanced glow effect
            const glowGeometry = new THREE.SphereGeometry(this.baseScale * 1.8, 16, 16);
            const glowMaterial = new THREE.MeshBasicMaterial({
                color: 0xffd700,
                transparent: true,
                opacity: 0.2,
                side: THREE.BackSide
            });
            this.glow = new THREE.Mesh(glowGeometry, glowMaterial);
            this.mesh.add(this.glow);
            
            // Create sparkle particles
            this.createSparkles();
            
            // Add to scene
            this.game.scene.add(this.mesh);
            
        } catch (error) {
            console.warn('Could not create enhanced food:', error);
            this.createSimpleFood();
        }
    }
    
    createSimpleFood() {
        // Fallback simple food creation
        const geometry = new THREE.SphereGeometry(0.3, 8, 8);
        const material = new THREE.MeshBasicMaterial({ color: 0xffd700 });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(this.position.x, 0.5, this.position.z);
        this.game.scene.add(this.mesh);
    }
    
    createSparkles() {
        try {
            const sparkleGeometry = new THREE.BufferGeometry();
            const sparkleCount = 15;
            const positions = new Float32Array(sparkleCount * 3);
            const colors = new Float32Array(sparkleCount * 3);
            
            for (let i = 0; i < sparkleCount * 3; i += 3) {
                // Random positions around the food
                positions[i] = (Math.random() - 0.5) * 1.5;
                positions[i + 1] = (Math.random() - 0.5) * 1.5;
                positions[i + 2] = (Math.random() - 0.5) * 1.5;
                
                // Golden colors with variation
                colors[i] = 1.0; // R
                colors[i + 1] = 0.8 + Math.random() * 0.2; // G
                colors[i + 2] = 0.2 + Math.random() * 0.3; // B
            }
            
            sparkleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            sparkleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
            
            const sparkleMaterial = new THREE.PointsMaterial({
                size: 0.05,
                transparent: true,
                opacity: 0.8,
                vertexColors: true,
                blending: THREE.AdditiveBlending
            });
            
            this.sparkles = new THREE.Points(sparkleGeometry, sparkleMaterial);
            this.mesh.add(this.sparkles);
            
        } catch (error) {
            console.warn('Could not create sparkles:', error);
        }
    }
    
    update(deltaTime) {
        if (!this.mesh) return;
        
        try {
            const time = deltaTime * 0.001;
            
            // Smooth rotation
            this.mesh.rotation.y += this.rotationSpeed;
            this.mesh.rotation.x += this.rotationSpeed * 0.5;
            
            // Enhanced bobbing motion
            const bobAmount = Math.sin(time * 3 + this.bobOffset) * 0.15;
            this.mesh.position.y = 0.5 + bobAmount;
            
            // Pulsing scale effect
            const pulseScale = 1 + Math.sin(time * 4 + this.bobOffset) * 0.1;
            this.mesh.scale.setScalar(pulseScale);
            
            // Animate glow
            if (this.glow) {
                this.glow.rotation.y -= this.rotationSpeed * 0.7;
                const glowOpacity = 0.1 + Math.sin(time * 2) * 0.1;
                this.glow.material.opacity = glowOpacity;
            }
            
            // Animate sparkles
            if (this.sparkles && this.sparkles.geometry && this.sparkles.geometry.attributes.position) {
                this.sparkles.rotation.y += 0.015;
                this.sparkles.rotation.z += 0.01;
                
                const positions = this.sparkles.geometry.attributes.position.array;
                for (let i = 0; i < positions.length; i += 3) {
                    positions[i + 1] += Math.sin(time * 3 + i) * 0.008;
                }
                this.sparkles.geometry.attributes.position.needsUpdate = true;
                
                // Pulsing sparkle opacity
                const sparkleOpacity = 0.6 + Math.sin(time * 4) * 0.3;
                this.sparkles.material.opacity = sparkleOpacity;
            }
            
        } catch (error) {
            console.warn('Error updating food animation:', error);
        }
    }
    
    destroy() {
        try {
            if (this.mesh) {
                // Clean up all geometries and materials
                if (this.mesh.geometry) this.mesh.geometry.dispose();
                if (this.mesh.material) this.mesh.material.dispose();
                
                // Clean up glow
                if (this.glow) {
                    if (this.glow.geometry) this.glow.geometry.dispose();
                    if (this.glow.material) this.glow.material.dispose();
                }
                
                // Clean up sparkles
                if (this.sparkles) {
                    if (this.sparkles.geometry) this.sparkles.geometry.dispose();
                    if (this.sparkles.material) this.sparkles.material.dispose();
                }
                
                this.game.scene.remove(this.mesh);
                this.mesh = null;
            }
        } catch (error) {
            console.warn('Error destroying food:', error);
        }
    }
    
    // Add collection effect
    collect() {
        if (!this.mesh) return;
        
        try {
            // Create explosion effect
            const explosionGeometry = new THREE.BufferGeometry();
            const particleCount = 20;
            const positions = new Float32Array(particleCount * 3);
            const velocities = [];
            
            for (let i = 0; i < particleCount; i++) {
                const i3 = i * 3;
                positions[i3] = this.mesh.position.x + (Math.random() - 0.5) * 0.5;
                positions[i3 + 1] = this.mesh.position.y + (Math.random() - 0.5) * 0.5;
                positions[i3 + 2] = this.mesh.position.z + (Math.random() - 0.5) * 0.5;
                
                velocities.push({
                    x: (Math.random() - 0.5) * 0.1,
                    y: Math.random() * 0.1,
                    z: (Math.random() - 0.5) * 0.1
                });
            }
            
            explosionGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            
            const explosionMaterial = new THREE.PointsMaterial({
                size: 0.1,
                color: 0xffd700,
                transparent: true,
                opacity: 1,
                blending: THREE.AdditiveBlending
            });
            
            const explosion = new THREE.Points(explosionGeometry, explosionMaterial);
            this.game.scene.add(explosion);
            
            // Animate explosion
            let time = 0;
            const animateExplosion = () => {
                time += 0.016;
                
                const positions = explosion.geometry.attributes.position.array;
                for (let i = 0; i < velocities.length; i++) {
                    const i3 = i * 3;
                    positions[i3] += velocities[i].x;
                    positions[i3 + 1] += velocities[i].y;
                    positions[i3 + 2] += velocities[i].z;
                    
                    velocities[i].y -= 0.002; // gravity
                }
                
                explosion.geometry.attributes.position.needsUpdate = true;
                explosion.material.opacity = Math.max(0, 1 - time * 2);
                
                if (time < 0.5) {
                    requestAnimationFrame(animateExplosion);
                } else {
                    this.game.scene.remove(explosion);
                    explosion.geometry.dispose();
                    explosion.material.dispose();
                }
            };
            
            animateExplosion();
            
        } catch (error) {
            console.warn('Error creating collection effect:', error);
        }
        
        this.destroy();
    }
}
