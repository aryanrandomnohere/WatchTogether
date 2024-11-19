import express, { Request, Response } from "express";
import AuthMiddleware from "../AuthMiddleware";
import { PrismaClient } from "@prisma/client";

const SocialRouter = express.Router();
const prisma = new PrismaClient();

SocialRouter.put("/rejectrequest", AuthMiddleware, async (req: Request, res: Response) => {
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

    res.json({ msg: `You rejected ${deletedRequest.fromUsername}'s friend request` });
  } catch (error) {
    console.error("Error rejecting friend request:", error);
    res.status(500).json({ msg: "An error occurred while rejecting the request" });
  }
});

export default SocialRouter;
