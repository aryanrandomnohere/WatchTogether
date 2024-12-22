import express, { Request, Response } from "express";
import AuthMiddleware from "../AuthMiddleware";
import { Prisma, PrismaClient } from "@prisma/client";
import { reverse } from "dns";

const MediaRouter = express.Router();
const prismaClient = new PrismaClient();
const VALID_LIST_TYPES = ["Favourite", "Recently Watched", "Watch Later"];

// Get all media for a user
MediaRouter.get("/allmedia", AuthMiddleware, async (req: Request, res: Response) => {
  try {
    //@ts-ignore
    const userId = req.userId;

    const userMedia = await prismaClient.userMovieList.findMany({
      where: { userId},
      select: {
        listType: true,
        episode:true,
        season:true,
        movie: {
          select: {
            id: true,
            adult: true,
            title: true,
            backdrop_path: true,
            first_air_date: true,
            media_type: true,
            name: true,
            original_language: true,
            original_name: true,
            overview: true,
            popularity: true,
            poster_path: true,
            vote_average: true,
            vote_count: true,
            genre_ids: {
              select: {
                genre_id: true,
              },
            },
            origin_country: {
              select: {
                country: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc", // Dynamically set based on `reverse`
      },

    });
    console.log(userMedia);
    

    res.status(200).json({ message: "User media retrieved successfully.", data: userMedia });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "An error occurred while retrieving media." });
  }
});

//Remove from Favourite
MediaRouter.put("/removefavourite",AuthMiddleware,async (req:Request,res: Response)=>{
  //@ts-ignore
 try{ const userId: string = req.userId;
const {movieId, listType}:{movieId:number, listType:string} = req.body;

await prismaClient.userMovieList.delete({
  where: {
    userId_Mid_listType: {
      userId,
      Mid: movieId, // assuming Mid is the field representing `movieId`
      listType
    }
  }
})
res.status(201).json({msg:"Removed from Favourites"})
 }catch (error){
  console.error(error);
  res.status(500).json({ msg: "An error occurred while saving the movie." });
 }
})


// Save or update media for a user
MediaRouter.post("/mediaaction", AuthMiddleware, async (req: Request, res: Response) => {
  try {
    //@ts-ignore
    const userId = req.userId;
    const { movie, listType } = req.body;

    console.log(userId, movie, listType);

    // Validate the input
    if (!userId || !movie || !listType) {
      res.status(400).json({ msg: "Missing required fields: userId, movie, or listType." });
      return;
    }

    if (!VALID_LIST_TYPES.includes(listType)) {
      res.status(400).json({ msg: `Invalid listType. Valid options are: ${VALID_LIST_TYPES.join(", ")}` });
      return;
    }

    // Check if the movie already exists in the database
    let movieRecord = await prismaClient.movie.findUnique({
      where: { id: movie.id },
      select: { 
        Mid: true,
        id:true
       },
    });

    // If the movie does not exist, create it
    if (!movieRecord) {
      movieRecord = await prismaClient.movie.create({
        data: {
          id: movie.id,
          adult: movie.adult,
          title: movie.title,
          backdrop_path: movie.backdrop_path,
          first_air_date: movie.first_air_date,
          media_type: movie.media_type,
          name: movie.name,
          original_language: movie.original_language,
          original_name: movie.original_name,
          overview: movie.overview,
          popularity: movie.popularity,
          poster_path: movie.poster_path,
          vote_average: movie.vote_average,
          vote_count: movie.vote_count,
        },
        select: { Mid: true,
          id:true
         },
      });

      // Add genre IDs if provided
      if (movie.genre_ids && movie.genre_ids.length > 0) {
        await Promise.all(
          movie.genre_ids.map((genreId: number) =>
            prismaClient.genreIds.create({
              data: {
                //@ts-ignore
                movieId: movieRecord.Mid,
                genre_id: genreId,
              },
            })
          )
        );
      }

      // Add origin countries if provided
      if (movie.origin_country && movie.origin_country.length > 0) {
        await Promise.all(
          movie.origin_country.map((country: string) =>
            prismaClient.originCountry.create({
              data: {
                //@ts-ignore
                movieId: movieRecord.Mid,
                country,
              },
            })
          )
        );
      }
    }

    // Check if the user already added this movie with the same listType
    const existingEntry = await prismaClient.userMovieList.findUnique({
      where: {
        userId_Mid_listType: {
          userId,
          Mid: movieRecord.id,
          listType,
        },
      },
      select:{
        Mid:true,
        id:true
      }
    });

    if (existingEntry) {
      await prismaClient.userMovieList.update({
        where:{
          id:existingEntry.id,
        },
        data:{
          createdAt: new Date()
        }
      })
      res.status(400).json({ msg: "Internal Server Error" });
      return;
    }

    // Create the user-movie relationship
    await prismaClient.userMovieList.create({
      data: {
        userId,
        movieId: movieRecord.Mid,
        Mid:movieRecord.id,
        listType,
      },
    });

    res.status(201).json({ message: "Movie successfully added to the list.", movie: movieRecord });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
});

export default MediaRouter;
