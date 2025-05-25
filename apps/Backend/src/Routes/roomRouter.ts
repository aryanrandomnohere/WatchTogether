import { PrismaClient } from "@prisma/client";
import AuthMiddleware from "../AuthMiddleware.js";
import express, { Request, Response, RequestHandler } from "express";
import { roomManager } from "../roomManager.js";
import { prisma } from "../db.js";
import { AccessToken } from "livekit-server-sdk";

declare global {
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}

const roomRouter = express.Router();
roomRouter.use(AuthMiddleware);
const API_KEY = "my_key";
const API_SECRET = "pCJKscVoP+Ar4d8ZgC/9As256CBPRWUtZHlanu2P308=";

interface ExtendedRequest extends Request {
  userId: string;
}

roomRouter.get("/loadstate/:roomId", async (req: Request, res: Response) => {
  try {
    const roomId = req.params.roomId;
    let playing;
    let screenShare;
    const room = roomManager.getInstance().getRoom(roomId);
    if (room?.roomStatus) {
      const { playingId, playingTitle, playingType, playingAnimeId } =
        room?.roomStatus;
      playing = { playingId, playingTitle, playingType, playingAnimeId };
      screenShare = room?.screenShare;
    } else {
      playing = await prisma.room.findFirst({
        where: {
          userId: roomId,
        },
        select: {
          playingId: true,
          playingTitle: true,
          playingType: true,
          playingAnimeId: true,
        },
      });
      screenShare = {
        screenShare: false,
        screenSharerId: undefined,
      }
    }
    const Messages = await prisma.chat.findMany({
      where: { roomId },
      orderBy: { createdAt: "desc" },
      take: 15,
      select: {
        id: true,
        type: true,
        displayname: true,
        edited: true,
        multipleVotes: true,
        time: true,
        message: true,
        options: {
          select: {
            chatId: true,
            option: true,
            id: true,
            votes: {
              select: {
                chatId: true,
                id: true,
                user: {
                  select: {
                    id: true,
                    displayname: true,
                    username: true,
                  },
                },
                optionId: true,
              },
            },
          },
        },
        replyTo: {
          select: {
            id: true,
            displayname: true,
            edited: true,
            time: true,
            message: true,
          },
        },
      },
    });

    const oldMessages = Messages.reverse();
    res.status(200).json({ oldMessages, playing, screenShare });
  } catch (error) {
    res.status(400).json({
      msg: "error while loading room state",
    });
  }
});
roomRouter.get("/get-token", async (req: Request, res: Response) => {
  const identity = String(req.query.identity || "anonymous");
  const room = String(req.query.room || "screen-room");
  const token = new AccessToken(API_KEY, API_SECRET, { identity });
  token.addGrant({ roomJoin: true, room });
  const newToken = await token.toJwt();
  res.json({ token: newToken });
});

//@ts-ignore
roomRouter.get(
  "/currentState/:roomId",
  (async (req: Request & { userId: string }, res: Response) => {
    try {
      const userId = req.userId;
      const roomId = req.params.roomId;
      let pastState;
      const room = roomManager.getInstance().getRoom(roomId);
      if (room?.roomStatus) {
        const { isPlaying, currentTime } = room?.roomStatus;
        pastState = { isPlaying, currentTime };
      } else {
        pastState = await prisma.room.findFirst({
          where: {
            userId: roomId,
          },
          select: {
            isPlaying: true,
            currentTime: true,
          },
        });
      }

      res.status(200).json({
        isPlaying: pastState?.isPlaying,
        currentTime: pastState?.currentTime,
      });
    } catch (error) {
      res
        .status(400)
        .json({ msg: "Problem faced while loading the last state" });
    }
  }) as RequestHandler
);

roomRouter.get("/getRoomName/:roomId", async (req: Request, res: Response) => {
  try {
    const roomId: string = req.params.roomId;
    const roomDetails = await prisma.user.findFirst({
      where: {
        id: roomId,
      },
      select: {
        username: true,
        displayname: true,
      },
    });
    res.status(200).json({
      roomDetails,
    });
  } catch (error) {
    res.status(400).json({
      msg: "Either you are not looged in or internal server error",
    });
  }
});

roomRouter.get("/call/:roomId", async (req: Request, res: Response) => {
  try {
    const roomId = req.params.roomId;
    const room = roomManager.getInstance().getRoom(roomId);
    if (!room) {
      res.status(400).json({ msg: "Room not found" });
      return;
    }

    // Convert Set to array of strings
    const stringArray: string[] = room.inCall?.people
      ? Array.from(room.inCall.people)
      : [];
    res
      .status(200)
      .json({ callCount: stringArray });
  } catch (error) {
    res.status(400).json({ msg: "Internal server error" });
  }
});

export default roomRouter;
