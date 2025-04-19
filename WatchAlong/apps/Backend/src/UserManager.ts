interface peopleType {
    displayname: string;
    username:string;
    id:string;
    avatar:string;
  }

  export class UserManager {
   private static instance:UserManager;
   private users: Map<string,peopleType>=new Map();
   private constructor() {
   }
   public static getInstance() {
    if(!this.instance){
        return this.instance = new UserManager;
    }
    return this.instance
   }

   public addUser(socketId:string,userInfo:peopleType) {
   this.users.set(socketId,userInfo)
   }
   public removeUser(socketId:string) {
    const userId = this.users.get(socketId)
    this.users.delete(socketId)
    return userId?.id
   }
   
    public getUser(id:string){
    return this.users.get(id)
   } 

  }