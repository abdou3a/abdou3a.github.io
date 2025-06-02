class Player {
    id: string;
    position: { x: number; y: number };
    score: number;

    constructor(id: string, position: { x: number; y: number }) {
        this.id = id;
        this.position = position;
        this.score = 0;
    }

    move(newPosition: { x: number; y: number }) {
        this.position = newPosition;
    }

    shoot() {
        // Logic for shooting a bullet
    }
}