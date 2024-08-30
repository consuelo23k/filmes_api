import express, { Application, Request, Response } from "express";
import cors from "cors";
import { Movie, movies } from "./movie";

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

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
