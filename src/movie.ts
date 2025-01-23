export interface Movie {
  id: number;
  title: string;
  director: string;
  releaseYear: number;
  watched: boolean;
  comment: string;
  rating: number;
  detail: any;
}

export const movies: Movie[] = [];
