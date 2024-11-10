import { PrismaClient } from "@prisma/client";
import express,{Response, Request} from "express";
import AuthMiddleware from "../AuthMiddleware";
const UserRouter = express.Router()
const prisma = new PrismaClient();


UserRouter.get("/getuser",AuthMiddleware, async(req:Request, res:Response)=>{
    //@ts-ignore
const id = req.userId;

try{
const userWithMovies = await prisma.user.findUnique({
    where: {
      id
    },
    select: {
      id: true,
      username:true,
      email:true,
      firstname: true,
      lastname: true,
      Movies: {
        select: {
          listType: true,
          movie: {
            select: {
              title: true,
              year: true,
              imdbID: true,
              poster: true,
            },
          },
        },
      },
    },
  });
  res.status(201).json({userWithMovies})
}catch(e){
    res.status(404).json({msg:"There was some loading details"})
    return 
}

return 


})


export default UserRouter;