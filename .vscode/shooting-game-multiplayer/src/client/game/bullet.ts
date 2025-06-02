export class Bullet {
    position: { x: number; y: number };
    direction: { x: number; y: number };
    speed: number;

    constructor(position: { x: number; y: number }, direction: { x: number; y: number }, speed: number) {
        this.position = position;
        this.direction = direction;
        this.speed = speed;
    }

    update(deltaTime: number) {
        this.position.x += this.direction.x * this.speed * deltaTime;
        this.position.y += this.direction.y * this.speed * deltaTime;
    }
}