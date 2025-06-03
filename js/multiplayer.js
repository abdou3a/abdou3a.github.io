class Multiplayer {
    constructor(game) {
        this.game = game;
        this.socket = null;
        this.connected = false;
        this.playerName = '';
        this.roomCode = '';
        this.players = new Map();
        
        this.updateConnectionStatus('disconnected');
    }
    
    connect() {
        try {
            // For development, use a mock WebSocket or connect to a real server
            this.socket = this.createMockSocket();
            
            this.socket.onopen = () => {
                this.connected = true;
                this.updateConnectionStatus('connected');
                console.log('Connected to server');
            };
            
            this.socket.onmessage = (event) => {
                this.handleMessage(JSON.parse(event.data));
            };
            
            this.socket.onclose = () => {
                this.connected = false;
                this.updateConnectionStatus('disconnected');
                console.log('Disconnected from server');
            };
            
            this.socket.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.updateConnectionStatus('disconnected');
            };
            
        } catch (error) {
            console.error('Failed to connect:', error);
            this.updateConnectionStatus('disconnected');
        }
    }
    
    createMockSocket() {
        // Mock WebSocket for development (replace with real WebSocket)
        return {
            onopen: null,
            onmessage: null,
            onclose: null,
            onerror: null,
            send: (data) => {
                console.log('Mock send:', data);
                // Simulate server responses
                setTimeout(() => {
                    if (this.onmessage) {
                        const message = JSON.parse(data);
                        if (message.type === 'createRoom') {
                            this.onmessage({
                                data: JSON.stringify({
                                    type: 'roomCreated',
                                    roomCode: 'DEMO' + Math.floor(Math.random() * 1000),
                                    playerId: 'player_' + Math.random().toString(36).substr(2, 9)
                                })
                            });
                        } else if (message.type === 'joinRoom') {
                            this.onmessage({
                                data: JSON.stringify({
                                    type: 'joinedRoom',
                                    success: true,
                                    playerId: 'player_' + Math.random().toString(36).substr(2, 9),
                                    players: []
                                })
                            });
                        }
                    }
                }, 100);
            },
            close: () => {
                if (this.onclose) this.onclose();
            }
        };
    }
    
    createRoom(playerName) {
        this.playerName = playerName;
        this.updateConnectionStatus('connecting');
        
        if (!this.connected) {
            this.connect();
        }
        
        setTimeout(() => {
            if (this.socket) {
                this.socket.send(JSON.stringify({
                    type: 'createRoom',
                    playerName: playerName
                }));
            }
        }, 100);
    }
    
    joinRoom(roomCode, playerName) {
        this.roomCode = roomCode;
        this.playerName = playerName;
        this.updateConnectionStatus('connecting');
        
        if (!this.connected) {
            this.connect();
        }
        
        setTimeout(() => {
            if (this.socket) {
                this.socket.send(JSON.stringify({
                    type: 'joinRoom',
                    roomCode: roomCode,
                    playerName: playerName
                }));
            }
        }, 100);
    }
    
    handleMessage(message) {
        switch (message.type) {
            case 'roomCreated':
                this.handleRoomCreated(message);
                break;
            case 'joinedRoom':
                this.handleJoinedRoom(message);
                break;
            case 'playerJoined':
                this.handlePlayerJoined(message);
                break;
            case 'playerLeft':
                this.handlePlayerLeft(message);
                break;
            case 'gameStarted':
                this.handleGameStarted(message);
                break;
            case 'playerPosition':
                this.handlePlayerPosition(message);
                break;
            case 'foodSpawned':
                this.handleFoodSpawned(message);
                break;
            case 'foodCollected':
                this.handleFoodCollected(message);
                break;
            case 'playerDied':
                this.handlePlayerDied(message);
                break;
        }
    }
    
    handleRoomCreated(message) {
        this.roomCode = message.roomCode;
        this.game.playerId = message.playerId;
        
        alert(`Salle créée! Code: ${this.roomCode}`);
        this.startMultiplayerGame();
    }
    
    handleJoinedRoom(message) {
        if (message.success) {
            this.game.playerId = message.playerId;
            this.updatePlayersList(message.players);
            this.startMultiplayerGame();
        } else {
            alert('Impossible de rejoindre la salle');
        }
    }
    
    handlePlayerJoined(message) {
        this.players.set(message.playerId, {
            name: message.playerName,
            score: 0
        });
        
        // Create snake for new player
        const colors = [0x00ff88, 0xff4757, 0xffd700, 0x00d4ff, 0xff6b6b];
        const color = colors[this.players.size % colors.length];
        const startPos = this.getRandomStartPosition();
        
        const snake = new Snake(this.game, message.playerId, color, startPos);
        this.game.snakes.set(message.playerId, snake);
        
        this.updatePlayersList();
    }
    
    handlePlayerLeft(message) {
        // Remove player snake
        const snake = this.game.snakes.get(message.playerId);
        if (snake) {
            snake.destroy();
            this.game.snakes.delete(message.playerId);
        }
        
        this.players.delete(message.playerId);
        this.updatePlayersList();
    }
    
    handlePlayerPosition(message) {
        const snake = this.game.snakes.get(message.playerId);
        if (snake && message.playerId !== this.game.playerId) {
            snake.updateFromNetwork(message.positions);
        }
    }
    
    handleFoodSpawned(message) {
        // Add new food
        const food = new Food(this.game, message.position);
        this.game.foods.push(food);
    }
    
    handleFoodCollected(message) {
        // Remove collected food
        for (let i = this.game.foods.length - 1; i >= 0; i--) {
            const food = this.game.foods[i];
            if (food.position.x === message.position.x && 
                food.position.z === message.position.z) {
                food.destroy();
                this.game.foods.splice(i, 1);
                break;
            }
        }
    }
    
    handlePlayerDied(message) {
        const snake = this.game.snakes.get(message.playerId);
        if (snake) {
            snake.destroy();
            
            if (message.playerId === this.game.playerId) {
                this.game.gameOver();
            }
        }
    }
    
    startMultiplayerGame() {
        this.game.isMultiplayer = true;
        this.game.gameState = 'playing';
        
        // Create player snake
        const startPos = this.getRandomStartPosition();
        const playerSnake = new Snake(this.game, this.game.playerId, 0x00ff88, startPos);
        this.game.snakes.set(this.game.playerId, playerSnake);
        
        // Generate food
        this.game.generateFood();
        
        // Hide menu, show game UI
        document.getElementById('main-menu').style.display = 'none';
        document.getElementById('game-ui').style.display = 'block';
        
        this.game.resetGameStats();
    }
    
    getRandomStartPosition() {
        let position;
        let attempts = 0;
        
        do {
            position = {
                x: Math.floor(Math.random() * (this.game.boundarySize * 2 - 4)) - this.game.boundarySize + 2,
                z: Math.floor(Math.random() * (this.game.boundarySize * 2 - 4)) - this.game.boundarySize + 2
            };
            attempts++;
        } while (this.game.isPositionOccupied(position) && attempts < 50);
        
        return position;
    }
    
    sendPlayerPosition(position) {
        if (this.socket && this.connected) {
            const snake = this.game.snakes.get(this.game.playerId);
            const positions = snake ? snake.segments.map(s => s.position) : [];
            
            this.socket.send(JSON.stringify({
                type: 'playerPosition',
                playerId: this.game.playerId,
                positions: positions
            }));
        }
    }
    
    sendFoodCollected(position) {
        if (this.socket && this.connected) {
            this.socket.send(JSON.stringify({
                type: 'foodCollected',
                position: position
            }));
        }
    }
    
    sendGameOver() {
        if (this.socket && this.connected) {
            this.socket.send(JSON.stringify({
                type: 'playerDied',
                playerId: this.game.playerId
            }));
        }
    }
    
    updateConnectionStatus(status) {
        const statusElement = document.getElementById('connection-status');
        statusElement.className = `connection-status ${status}`;
        
        switch (status) {
            case 'connected':
                statusElement.textContent = 'Connecté';
                break;
            case 'connecting':
                statusElement.textContent = 'Connexion...';
                break;
            case 'disconnected':
                statusElement.textContent = 'Déconnecté';
                break;
        }
    }
    
    updatePlayersList(players = null) {
        const playersElement = document.getElementById('players-online');
        
        if (players) {
            // Initial players list
            players.forEach(player => {
                this.players.set(player.id, {
                    name: player.name,
                    score: player.score || 0
                });
            });
        }
        
        playersElement.innerHTML = '';
        this.players.forEach((player, id) => {
            const playerDiv = document.createElement('div');
            playerDiv.style.color = id === this.game.playerId ? '#ffd700' : '#b8b8b8';
            playerDiv.textContent = `${player.name}: ${player.score}`;
            playersElement.appendChild(playerDiv);
        });
    }
}
