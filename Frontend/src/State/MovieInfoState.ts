import { atom } from "recoil";

interface mData {
    adult: boolean;
    title?: string;
    backdrop_path: string;
    first_air_date: string;
    genre_ids: number[] | genreId[] ;
    id: number;
    media_type?: string;
    name?: string;
    origin_country?: string[] | originalCountry[];
    original_language?: string;
    original_name: string;
    overview: string;
    popularity: number;
    poster_path: string;
    vote_average: number;
    vote_count: number;
  }

  interface originalCountry {
  country:string
  }

  interface genreId {
    genre_id:number
  }

export const MovieInfoState = atom<mData>({
    key:"MovieInfoState",
    default: undefined

})
