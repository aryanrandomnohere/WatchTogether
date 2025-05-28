
interface roomStatusInterface {
  playingId: string;
  playingTitle: string;
  playingType: string;
  playingAnimeId?: string;
  isPlaying: boolean;
  currentTime: number;
  episode: number;
  season: number;
}

interface Call {
  people: Set<string>;
}

enum ssType {
  P2P,
  SERVER
}
interface screenShareType {
  status: boolean;
  screenSharerId: string | undefined;
  type:ssType | null
}

interface roomInterface {
  roomStatus: roomStatusInterface;
  subscribers: Map<string, string>;
  inCall: Call;
  screenShare: screenShareType;
}

export class roomManager {
  private static instance: roomManager;
  private rooms: Map<string, roomInterface> = new Map();

  public static getInstance() {
    if (!this.instance) {
      this.instance = new roomManager();
      return this.instance;
    }
    return this.instance;
  }

  public subscribe(roomId: string, roomStatus: roomStatusInterface) {
    if (!this.rooms.get(roomId)) {
      this.rooms.set(roomId, {
        roomStatus,
        subscribers: new Map(),
        inCall: {
          people: new Set(),
        },
        screenShare: {
          status: false,
          screenSharerId: undefined,
          type:null
        },
      });
    }
  }
  public unsubscribe(roomId: string) {
    const lastRoomState = this.rooms.get(roomId)?.roomStatus;
    this.rooms.delete(roomId);
    return lastRoomState;
  }

  public addSubscriber(roomId: string, userId: string, socketId: string) {
    if (!this.rooms.get(roomId)) {
      console.error("Room does not exists");
      return;
    }
    this.rooms.get(roomId)?.subscribers.set(socketId, userId);
  }

  public removeSubscriber(roomId: string, socketId: string) {
    const room = this.rooms.get(roomId);
    if (!room || !room.subscribers) return;
    if(room.subscribers.has(socketId)){
      const userId = room.subscribers.get(socketId);
      if(userId){
        room.inCall.people.delete(userId);
        room.inCall.people.delete('');
      }
    }
    room.subscribers.delete(socketId);
    return;
  }

  public userDisconnected(socketId: string) {
    for (const [roomId, room] of this.rooms.entries()) {
      if (!room || !room.subscribers) continue;
      if(room.subscribers.has(socketId)){
      const userId = room.subscribers.get(socketId);
      if(userId){
        room.inCall.people.delete(userId);
        room.inCall.people.delete('');
      if(room.screenShare.screenSharerId === userId) room.screenShare = {
        status: false,
        screenSharerId: undefined,
        type:null
      }

      }
    }
      room.subscribers.delete(socketId);
      room.inCall.people.delete('');
      console.log(room.subscribers);
      return roomId;
    }
  }
  public joinCall(
    roomId: string,
    userId: string,
  ) {
    const room = this.rooms.get(roomId);
    if (!room) return false;
    room.inCall.people.add(userId);
    return true;
  }
  public leaveCall(roomId: string, userId: string) {
    const room = this.rooms.get(roomId);
    if (!room || !room.inCall) return false;
    room.inCall.people.delete(userId);
  }
  public callSize(roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    const peopleSize = room.inCall.people.size;
    return peopleSize;
  }

  public getCallMemberSize(roomId: string) {
    const CallSize = this.rooms.get(roomId)?.inCall?.people.size;
    return CallSize;
  }
  public getRoom(id: string) {
    return this.rooms.get(id) || null;
  }
  public getRoomTotal(id: string) {
    if (!this.rooms.get(id)) return 0;
    return this.rooms.get(id)?.subscribers.size;
  }


  public setScreenShare(roomId: string, bywhom: string, bywhomId: string, type:ssType) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    if(!room.screenShare){
      room.screenShare = {
        status: true,
        screenSharerId: bywhomId,
        type: type
      };
    }
  }

  public endScreenShare(roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    room.screenShare = {
      status: false,
      screenSharerId: undefined,
      type:null
    };
  }



}
