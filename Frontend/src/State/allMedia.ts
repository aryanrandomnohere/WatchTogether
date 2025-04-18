import { atom, selector } from 'recoil';

// Interfaces
interface mData {
  adult: boolean;
  title?: string;
  backdrop_path: string;
  first_air_date: string;
  genre_ids: number[] | genreId[];
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

interface mediaData {
  listType: string;
  episode: number;
  season: number;
  movie: mData;
}

interface originalCountry {
  country: string;
}

interface genreId {
  genre_id: number;
}

// Atom for user media
export const userMedia = atom<null | mediaData[]>({
  key: 'userMedia',
  default: null, // Default value can be null or an empty array []
});

// Selector for recently watched movies
export const recentlyWatched = selector<mediaData[] | null>({
  key: 'recentlyWatchedSelector',
  get: ({ get }) => {
    const media = get(userMedia);
    if (!media) return null;

    // Filter for "Recently Watched"
    return media.filter(item => item.listType === 'Recently Watched');
  },
});

// Selector for watch later movies
export const watchLater = selector<mediaData[] | null>({
  key: 'watchLaterSelector',
  get: ({ get }) => {
    const media = get(userMedia);
    if (!media) return [];

    // Filter for "Watch Later"
    return media.filter(item => item.listType === 'Watch Later');
  },
});

// Selector for favourite movies
export const Favourite = selector<mediaData[] | null>({
  key: 'favouriteSelector',
  get: ({ get }) => {
    const media = get(userMedia);
    if (!media) return null;

    // Filter for "Favourite"
    return media.filter(item => item.listType === 'Favourite');
  },
});
