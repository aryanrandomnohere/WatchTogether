
interface ssType {
    broadcaster:{
        socketId:string;
        peer:RTCPeerConnection;
        stream: MediaStream | null;
    };
    consumers:Map<string,RTCPeerConnection>
    MemberIds:Map<string,string>
}

enum deleteType {
    FULL,
    CONSUMER
}

export class SsManager {
private static instance: SsManager;
private roomPeerTrack:Map<string,ssType> = new Map();
public static getInstance(){
    if(!this.instance){
     this.instance = new SsManager();
    }
    return this.instance;
}

public addBroadcaster(socketId: string, roomId: string, userId: string, peer: RTCPeerConnection) {
    let room = this.roomPeerTrack.get(roomId);

    // Create new room if it doesn't exist
    if (!room) {
        room = {
            broadcaster: {
                socketId,
                peer,
                stream: null
            },
            consumers: new Map(),
            MemberIds: new Map(),
        };
        this.roomPeerTrack.set(roomId, room);
    } else if (room.broadcaster) {
        console.log("Someone is already broadcasting");
        return null;
    }

    // Set broadcaster
    room.broadcaster = {
        socketId,
        peer,
        stream:null
    };

    // Set member ID mapping
    room.MemberIds.set(socketId, userId);

    return room.broadcaster;
}

public addConsumer(socketId: string, roomId: string, userId: string, peer: RTCPeerConnection){
    const room = this.roomPeerTrack.get(roomId);

    if (!room) {
        console.log("Room does not exist");
        return null;
    }

    if (!room.broadcaster) {
        console.log("No broadcaster present in this room");
        return null;
    }

    if (room.broadcaster.socketId === socketId) {
        console.log("Broadcaster cannot be added as a consumer");
        return null;
    }

    room.consumers.set(socketId, peer);
    room.MemberIds.set(socketId, userId);

    return room.consumers.get(socketId);
}

public EndBroadcast(roomId:string) {
    const room = this.roomPeerTrack.get(roomId);
    if(room){
        if(room.broadcaster.peer) room.broadcaster.peer.close()
            room.consumers.forEach(consumer=> consumer.close())
    }
    return deleteType.FULL;
}

public EndConsuming(socketId:string,roomId:string){
let room = this.roomPeerTrack.get(roomId)
if(room){
    const consumer = room.consumers.get(socketId)
    if(consumer) consumer.close();
    room.MemberIds.delete(socketId);
    room.consumers.delete(socketId);
}
return deleteType.CONSUMER;
}

public handleDisconnection(socketId: string): deleteType | undefined {
    for (const [roomId, room] of this.roomPeerTrack.entries()) {
        if (room.MemberIds.has(socketId)) {
            if (room.broadcaster && room.broadcaster.socketId === socketId) {
                if(room.broadcaster.peer){
                room.broadcaster.peer.close();
                }
                room.consumers.forEach(consumer=> consumer.close())
                room.MemberIds.delete(socketId);
                this.roomPeerTrack.delete(roomId);
                return deleteType.FULL;
            }
            if (room.consumers.has(socketId)) {
                const consumer = room.consumers.get(socketId);
                    if (consumer) {
                        consumer.close();
                    }
                room.consumers.delete(socketId);
                room.MemberIds.delete(socketId);
                return deleteType.CONSUMER;
            }
            room.MemberIds.delete(socketId);
        }
    }
}

public getBraodcaster(roomId:string){
let room  = this.roomPeerTrack.get(roomId);
if(room && room.broadcaster){
return room.broadcaster
}
return null;
}
public getConsumer(socketId:string, roomId:string){
    const room  = this.roomPeerTrack.get(roomId);
    if(room && room.broadcaster){
    return room.consumers.get(socketId)
    }
    return null;
}

public updateBroadcasterStream(roomId:string,stream: MediaStream){
    const room = this .roomPeerTrack.get(roomId);
    if(room && room.broadcaster){
        room.broadcaster.stream = stream;
    }
}

}