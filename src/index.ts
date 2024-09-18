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

  const fetchedMovies = response.data.results;

  movies.length = 0;
  fetchedMovies.forEach((movie: Movie) => movies.push(movie));

  res.json(movies);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
