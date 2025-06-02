import { GameEngine } from './game/gameEngine';
import { SocketClient } from './network/socketClient';

const socketClient = new SocketClient();
const gameEngine = new GameEngine();

socketClient.connect();

socketClient.onMessage((message) => {
    // Handle incoming messages from the server
    console.log('Message from server:', message);
});

gameEngine.start();