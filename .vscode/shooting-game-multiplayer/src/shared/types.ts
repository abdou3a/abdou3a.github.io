export type PlayerData = {
    id: string;
    position: {
        x: number;
        y: number;
    };
    score: number;
};

export type BulletData = {
    position: {
        x: number;
        y: number;
    };
    direction: {
        x: number;
        y: number;
    };
    speed: number;
};