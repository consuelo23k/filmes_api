import express, { Application, Request, Response } from "express";
import cors from "cors";
import { Movie, movies } from "./movie";
import axios from "axios";
import fs from "fs";
import path from "path";

const app: Application = express();
const port = 3000;
const jsonFilePath = path.join(__dirname, "filmesAssistidos.json");

const ensureFileExists = () => {
  if (!fs.existsSync(jsonFilePath)) {
    fs.writeFileSync(jsonFilePath, "[]", "utf-8");
  }
};

const readJsonFile = (): string[] => {
  try {
    ensureFileExists();
    const data = fs.readFileSync(jsonFilePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Erro ao ler o arquivo JSON:", error);
    return [];
  }
};

const writeJsonFile = (data: string[]) => {
  try {
    fs.writeFileSync(jsonFilePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Erro ao escrever no arquivo JSON:", error);
  }
};

app.use(cors());
app.use(express.json());

app.get("/top_rated", async (req: Request, res: Response) => {
  try {
    const response = await axios.get(
      "https://api.themoviedb.org/3/movie/top_rated?api_key=8ed200f50a6942ca5bc8b5cdec27ff22"
    );

    const fetchedMovies = response.data;

    const movies: Movie[] = [];

    const watchedMovies = readJsonFile();

    fetchedMovies.results.forEach((movie: Movie) => {
      if (watchedMovies.includes(String(movie.id))) {
        movie.watched = true;
      } else {
        movie.watched = false;
      }

      movies.push(movie);
    });

    res.json({ results: movies });
  } catch (error) {
    console.error("Erro ao buscar filmes top-rated:", error);
    res.status(500).json({ error: "Erro ao buscar filmes top-rated" });
  }
});

app.get("/search", async (req: Request, res: Response) => {
  const query = req.query.query as string;

  const response = await axios.get(
    `https://api.themoviedb.org/3/search/movie?api_key=8ed200f50a6942ca5bc8b5cdec27ff22&query=${query}`
  );

  const watchedMovies = readJsonFile();

  const fetchedMovies = response.data;

  movies.length = 0;
  fetchedMovies.results.forEach((movie: Movie) => {
    if (watchedMovies.includes(String(movie.id))) {
      movie.watched = true;
    } else {
      movie.watched = false;
    }

    movies.push(movie);
  });

  res.json({ results: movies });
});

app.get("/movie", async (req: Request, res: Response) => {
  const movieId = req.query.movieId as string;

  if (!movieId) {
    return res.status(400).json({ error: "O parâmetro movieId é obrigatorio" });
  }

  try {
    const tmdbResponse = await axios.get(
      `https://api.themoviedb.org/3/movie/${movieId}?api_key=8ed200f50a6942ca5bc8b5cdec27ff22`
    );

    const watchedMovies = readJsonFile();

    const movieData = tmdbResponse.data;

    if (watchedMovies.includes(movieId)) {
      movieData.watched = true;
    } else {
      movieData.watched = false;
    }

    res.json(movieData);
  } catch (error) {
    console.error(`Erro ao buscar filme:`, error);
    res.status(500).json({ error: "Erro ao buscar o filme do TMDB" });
  }
});

app.post("/filmeAssistido", async (req: Request, res: Response) => {
  const movieId = req.query.movieId as string;

  if (!movieId) {
    return res.status(400).json({ error: "O parâmetro movieId é obrigatorio" });
  }

  try {
    let movieIds = readJsonFile();

    if (!movieIds.includes(movieId)) {
      movieIds.push(movieId);

      writeJsonFile(movieIds);
    }

    res.json({ message: "Filme marcado como assistido", movieIds });
  } catch (error) {
    console.error("Erro ao processar a requisição:", error);
    res.status(500).json({ error: "Erro ao salvar o filme assistido" });
  }
});

app.delete("/filmeNaoAssistido", async (req: Request, res: Response) => {
  const movieId = req.query.movieId as string;

  if (!movieId) {
    return res.status(400).json({ error: "O parâmetro movieId é obrigatório" });
  }

  try {
    let movieIds = readJsonFile();

    if (movieIds.includes(movieId)) {
      movieIds = movieIds.filter((id) => id !== movieId);

      writeJsonFile(movieIds);

      return res.json({
        message: "Filme removido da lista de assistidos",
        movieIds,
      });
    } else {
      return res.json({
        message: "Filme não encontrado",
        movieIds,
      });
    }
  } catch (error) {
    console.error("Erro ao processar a requisição:", error);
    res.status(500).json({ error: "Erro ao processar o filme não assistido" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
