# Shooting Game Multiplayer

## Description
This project is a multiplayer shooting game where players can connect to a server, move around, shoot bullets, and interact with each other in real-time. The game is built using TypeScript and utilizes WebSocket for network communication.

## Project Structure
```
shooting-game-multiplayer
├── src
│   ├── client
│   │   ├── game
│   │   │   ├── player.ts
│   │   │   ├── bullet.ts
│   │   │   └── gameEngine.ts
│   │   ├── network
│   │   │   └── socketClient.ts
│   │   └── main.ts
│   ├── server
│   │   ├── gameServer.ts
│   │   ├── playerManager.ts
│   │   └── roomManager.ts
│   └── shared
│       ├── types.ts
│       └── constants.ts
├── package.json
├── tsconfig.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js
- npm

### Installation
1. Clone the repository:
   ```
   git clone https://github.com/yourusername/shooting-game-multiplayer.git
   ```
2. Navigate to the project directory:
   ```
   cd shooting-game-multiplayer
   ```
3. Install the dependencies:
   ```
   npm install
   ```

### Running the Game
1. Start the server:
   ```
   node src/server/gameServer.js
   ```
2. Start the client:
   ```
   node src/client/main.js
   ```

### Gameplay
- Players can move around the game area using keyboard controls.
- Players can shoot bullets towards their target.
- The game supports multiple players connecting to the same server.

## Contributing
Feel free to submit issues or pull requests to improve the game or add new features.

## License
This project is licensed under the MIT License.