export class PlayerManager {
    private players: Map<string, any>;

    constructor() {
        this.players = new Map();
    }

    addPlayer(id: string, playerData: any) {
        this.players.set(id, playerData);
    }

    removePlayer(id: string) {
        this.players.delete(id);
    }

    getPlayerById(id: string) {
        return this.players.get(id);
    }

    getAllPlayers() {
        return Array.from(this.players.values());
    }
}