import { PrismaClient } from "@prisma/client";
import express,{Response, Request} from "express";
import AuthMiddleware from "../AuthMiddleware";
const UserRouter = express.Router()
import { prisma } from "../db";;


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
      avatar:true,
      displayname: true,
      Movies: {
        select: {
          listType: true,
          movie: {
            select: {
              id: true,
             adult:true,
             title: true,
             backdrop_path: true,
             first_air_date: true,
             media_type: true,
             name: true,
             original_language: true,
             original_name: true,
             overview:true,
             popularity: true,
             poster_path: true,
             vote_average: true,
             vote_count: true,
             genre_ids:{
              select:{
                genre_id:true,
              },
              
             },
             origin_country:{
              select:{
              country:true,  
              }
             },
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