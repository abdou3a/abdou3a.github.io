export class SocketClient {
    private socket: WebSocket;

    constructor(private url: string) {}

    connect() {
        this.socket = new WebSocket(this.url);

        this.socket.onopen = () => {
            console.log('Connected to the server');
        };

        this.socket.onmessage = (event) => {
            this.onMessage(event.data);
        };

        this.socket.onclose = () => {
            console.log('Disconnected from the server');
        };
    }

    sendMessage(message: string) {
        if (this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(message);
        } else {
            console.error('Socket is not open. Unable to send message.');
        }
    }

    onMessage(data: string) {
        console.log('Message received from server:', data);
        // Handle incoming messages here
    }
}