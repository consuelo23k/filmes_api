export interface Movie {
  id: number;
  title: string;
  director: string;
  releaseYear: number;
  watched: boolean;
}

export const movies: Movie[] = [];
