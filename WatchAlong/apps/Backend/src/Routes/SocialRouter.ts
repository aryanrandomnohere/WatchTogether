import express, { Request, Response } from "express";
import AuthMiddleware from "../AuthMiddleware";
import { prisma } from "../db";

const SocialRouter = express.Router();
SocialRouter.use(AuthMiddleware)
SocialRouter.put("/rejectrequest", async (req: Request, res: Response) => {
  //@ts-ignore
  const toId: string = req.userId;
  const {from}: {from:string} = req.body;


  if (!from) {
    res.status(400).json({ msg: "Missing required fields" });
    return;
  }

  try {
    // Find the friend request
    const friendRequest = await prisma.friendRequests.findFirst({
      where: { toId, from },
      select: { id: true },
    });
 
    if (!friendRequest) {
      res.status(404).json({ msg: "Invalid request" });
      return;
    }

    // Delete the friend request
  const deletedRequest =  await prisma.friendRequests.delete({
      where: { id: friendRequest.id },
    });
   const fromUsername = deletedRequest.fromUsername;
    res.json({ fromUsername });
  } catch (error) {
    console.error("Error rejecting friend request:", error);
    res.status(500).json({ msg: "An error occurred while rejecting the request" });
  }
});

SocialRouter.get("/friends", async (req:Request,res:Response)=>{
  //@ts-ignore
const userId = req.userId;
   const userFriends = await prisma.friendship.findMany({
  where:{
    userId
  },
  select:{
    friendId:true
  }
})
const friendIds = userFriends.map(f => f.friendId);

const mutualFriends = await prisma.friendship.findMany({
    where: {
      userId: { in: friendIds },
      friendId: userId,
    },
    include: {
      user: {
        select: {
            username:true,
          id: true, 
          displayname: true,
          status:true, 
        },
      },
    },
  });
  

const actualFriends = mutualFriends.map(f => f.user);

res.json({actualFriends});
return
})

SocialRouter.get('/loadrequests',async (req: Request, res:Response)=>{
  //@ts-ignore
  const userId = req.userId;
  const noti = await prisma.friendRequests.findMany({
    where:{toId:userId},
    select:{from:true,
        fromUsername:true,
    }
})

res.json({noti})
return 

})


export default SocialRouter;
