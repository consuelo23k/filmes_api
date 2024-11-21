import express, { Application, Request, Response } from "express";
import cors from "cors";
import { Movie, movies } from "./movie";
import axios from "axios";
import fs from "fs";
import path from "path";
import { readMoviesData, writeMoviesData } from "./utils/moviesDataUtils";

const app: Application = express();
const port = 3000;
const jsonFilePath = path.join(__dirname, "filmesAssistidos.json");
const dataFilePath = path.join(__dirname, "data", "moviesData.json");

const ensureFileExists = (filePath: string) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "[]", "utf-8");
  }
};

const readJsonFile = (filePath: string): string[] => {
  try {
    ensureFileExists(filePath);
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Erro ao ler o arquivo json:", error);
    return [];
  }
};

const writeJsonFile = (filePath: string, data: string[]) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Erro ao escrever no arquivo JSON:", error);
  }
};

app.use(cors());
app.use(express.json());

app.post("/wishlist/add", (req: Request, res: Response) => {
  const movieId = req.query.movieId as string;
  if (!movieId || movieId.trim() === "") {
    return res.status(400).json({
      error: "o parâmetro movieId é obrigatorio e não pode está vazio",
    });
  }

  const moviesData = readMoviesData();

  if (!moviesData.wishlist) {
    moviesData.wishlist = [];
  }

  if (!moviesData.wishlist.includes(movieId)) {
    moviesData.wishlist.push(movieId);
    writeMoviesData(moviesData);
  }

  res.json({
    message: "Filme adicionado á wishlist",
    wishlist: moviesData.wishlist,
  });
});

app.delete("/wishlist/remove", (req: Request, res: Response) => {
  const movieId = req.query.movieId as string;

  if (!movieId || movieId.trim() === "") {
    return res.status(400).json({
      error: "O parâmetro movieId é obrigatorio e não pede estar vazio",
    });
  }
  const moviesData = readMoviesData();

  const index = moviesData.wishlist.indexOf(movieId);
  if (index === -1) {
    return res.status(404).json({
      error: "Filme não encontrado na wishlist",
    });
  }

  moviesData.wishlist.splice(index, 1);
  writeMoviesData(moviesData);

  res.json({
    message: "Filme removido da wishlist",
    wishlist: moviesData.wishlist,
  });
});

app.get("/top_rated", async (req: Request, res: Response) => {
  try {
    const response = await axios.get(
      "https://api.themoviedb.org/3/movie/top_rated?api_key=8ed200f50a6942ca5bc8b5cdec27ff22"
    );

    const fetchedMovies = response.data.results;

    const watchedMovies = readJsonFile(jsonFilePath);

    const moviesWithWatchedStatus = fetchedMovies.map((movie: Movie) => {
      if (watchedMovies.includes(String(movie.id))) {
        movie.watched = true;
      } else {
        movie.watched = false;
      }
      return movie;
    });

    res.json({ results: moviesWithWatchedStatus });
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

  const fetchedMovies = response.data.results;

  const watchedMovies = readJsonFile(jsonFilePath);

  const moviesWithWatchedStatus = fetchedMovies.map((movie: Movie) => {
    movie.watched = watchedMovies
      .map((id) => String(id))
      .includes(String(movie.id));
    return movie;
  });
  console.log("search");
  res.json({ results: moviesWithWatchedStatus });
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

    const watchedMovies = readJsonFile(jsonFilePath);

    const movieData = tmdbResponse.data;

    if (watchedMovies.includes(movieId)) {
      movieData.watched = true;
    } else {
      movieData.watched = false;
    }
    console.log("movie");
    res.json(movieData);
  } catch (error) {
    console.error(`Erro ao buscar filme:`, error);
    res.status(500).json({ error: "Erro ao buscar o filme do TMDB" });
  }
});

app.post("/filmeAssistido/add", async (req: Request, res: Response) => {
  const movieId = req.query.movieId as string;

  if (!movieId) {
    return res.status(400).json({ error: "O parâmetro movieId é obrigatorio" });
  }

  const moviesData = readMoviesData();

  if (!moviesData.filmesAssistidos) {
    moviesData.filmesAssistidos = [];
  }

  if (!moviesData.filmesAssistidos.includes(movieId)) {
    moviesData.filmesAssistidos.push(movieId);
    writeMoviesData(moviesData);
  }

  res.json({
    message: "Filme marcado como assistido",
    filmesAssistidos: moviesData.filmesAssistidos,
  });
});

app.delete("/filmeNaoAssistido/remove", async (req: Request, res: Response) => {
  const movieId = req.query.movieId as string;

  if (!movieId) {
    return res.status(400).json({ error: "O parâmetro movieId é obrigatório" });
  }

  try {
    let movieIds = readJsonFile(jsonFilePath);

    if (movieIds.includes(movieId)) {
      movieIds = movieIds.filter((id) => id !== movieId);

      writeJsonFile(jsonFilePath, movieIds);

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
