export interface EpisodeType {
  episode_number: number;
  episode_type: string;
  id: number;
  name: string;
  overview: string;
  season_number: number;
  show_id: number;
  still_path?: string;
  vote_average: number;
}

export interface APIEpisodeType {
  episode_number: number;
  episode_type: string;
  id: number;
  name: string;
  overview: string;
  season_number: number;
  still_path: string | null;
  vote_average: number;
} 