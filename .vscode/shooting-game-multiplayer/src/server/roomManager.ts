export class RoomManager {
    private rooms: Map<string, Set<string>>;

    constructor() {
        this.rooms = new Map();
    }

    createRoom(roomId: string): boolean {
        if (this.rooms.has(roomId)) {
            return false; // Room already exists
        }
        this.rooms.set(roomId, new Set());
        return true; // Room created successfully
    }

    joinRoom(roomId: string, playerId: string): boolean {
        const room = this.rooms.get(roomId);
        if (room && !room.has(playerId)) {
            room.add(playerId);
            return true; // Player joined successfully
        }
        return false; // Room does not exist or player already in room
    }

    leaveRoom(roomId: string, playerId: string): boolean {
        const room = this.rooms.get(roomId);
        if (room && room.has(playerId)) {
            room.delete(playerId);
            return true; // Player left successfully
        }
        return false; // Room does not exist or player not in room
    }

    getPlayersInRoom(roomId: string): string[] | null {
        const room = this.rooms.get(roomId);
        return room ? Array.from(room) : null; // Return array of player IDs or null if room does not exist
    }
}