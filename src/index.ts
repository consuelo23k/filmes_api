import express, { Application, Request, Response } from "express";
import cors from "cors";
import { Movie, movies } from "./movie";
import axios from "axios";

const app: Application = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.post("/movies", (req: Request, res: Response) => {
  const newMovie: Movie = {
    id: movies.length + 1,
    ...req.body,
  };

  movies.push(newMovie);
  res.status(201).json(newMovie);
});

app.get("/movies", (req: Request, res: Response) => {
  res.json(movies);
});

app.get("/top_rated", async (req: Request, res: Response) => {
  const response = await axios.get(
    "https://api.themoviedb.org/3/movie/top_rated?api_key=8ed200f50a6942ca5bc8b5cdec27ff22"
  );

  const fetchedMovies = response.data;

  movies.length = 0;
  fetchedMovies.results.forEach((movie: Movie) => movies.push(movie));

  res.json({ results: movies });
});

app.get("/search", async (req: Request, res: Response) => {
  const query = req.query.query as string;

  const response = await axios.get(
    `https://api.themoviedb.org/3/search/movie?api_key=8ed200f50a6942ca5bc8b5cdec27ff22&query=${query}`
  );

  const fetchedMovies = response.data;

  movies.length = 0;
  fetchedMovies.results.forEach((movie: Movie) => movies.push(movie));

  res.json({ results: movies });
});

app.get("/movie", async (req: Request, res: Response) => {
  const movieId = req.query.movieId as string;

  const response = await axios.get(
    `https://api.themoviedb.org/3/movie/${movieId}?api_key=8ed200f50a6942ca5bc8b5cdec27ff22`
  );

  const fetchedMovie = response.data;

  movies.length = 0;
  movies.push(fetchedMovie);

  res.json(fetchedMovie);
});

app.post("/filmeAssistido", async (req: Request, res: Response) => {
  const movieId = req.query.movieId as string;
});

app.delete("/filmeNaoAssistido", async (req: Request, res: Response) => {
  const movieId = req.query.movieId as string;
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
