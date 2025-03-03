
  interface roomStatusInterface {
    playingId:string; 
    playingTitle:string;  
    playingType:string;
    playingAnimeId?:string;  
    isPlaying:boolean;
    currentTime:number;   
    episode:number;    
    season:number;    
  }

  interface SpdStatus {
  sdp:RTCSessionDescriptionInit,
  
  }

  interface Call {
   Senders:Map<string, SpdStatus>,
   Receivers:Set<string>
  }
  interface roomInterface {
    roomStatus: roomStatusInterface;
    subscribers: Map<string,string>;
    inCall?: Call;
  }
  

export class roomManager {
    private static instance:roomManager;
    private rooms:Map<string, roomInterface>=new Map();
   
    public static getInstance(){
        if(!this.instance){
            this.instance = new roomManager;
            return this.instance 
        }
        return this.instance
    }

    public subscribe(roomId:string,roomStatus:roomStatusInterface) {
      if (!this.rooms.get(roomId)) {
        this.rooms.set(roomId,{
          roomStatus,
          subscribers: new Map(),
        }) 
    }
    }
    public unsubscribe(roomId:string){
      const lastRoomState = this.rooms.get(roomId)?.roomStatus;
      this.rooms.delete(roomId);
      return lastRoomState
    }

    public addSubscriber(roomId:string, userId:string,socketId:string){
    if (!this.rooms.get(roomId)) {
      console.error("Room does not exists")
       return
    }
    this.rooms.get(roomId)?.subscribers.set(socketId,userId);
    }

    public removeSubscriber(roomId: string, socketId: string) {
      const room = this.rooms.get(roomId);
      if (!room || !room.subscribers) return; 
      room.subscribers.delete(socketId)
  }

    public userDisconnected(socketId:string) {
      for (const [roomId,room] of this.rooms.entries()){
        if(!room || !room.subscribers) continue
            room.subscribers.delete(socketId);
            return roomId
      }
      }
    public joinAsASender(roomId:string,) {

    }
    public joinAsAReceiver(roomId:string) {
      this.rooms.get
    }
    public getCallMemberSize(roomId:string){
    const CallSize = this.rooms.get(roomId)?.inCall?.Receivers.size || 0 + this.rooms.get(roomId)?.inCall?.Senders.size || 0;
    return CallSize
    }
    public getRoom(id:string) {
       return this.rooms.get(id) || null
    }
    public getRoomTotal(id:string) {
      if(!this.rooms.get(id)) return 0
      return this.rooms.get(id)?.subscribers.size;
    }
    
}