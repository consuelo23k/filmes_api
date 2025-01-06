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

app.use((req, res, next) => {
  if (req.originalUrl.includes("/wishlist/remove/?")) {
    return res.status(400).send("URL inválida: remova a barra extra.");
  }
  next();
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

    const moviesData = readMoviesData();

    const moviesWithStatuses = fetchedMovies.map((movie: Movie) => {
      return {
        ...movie,
        watched: moviesData.filmesAssistidos.includes(String(movie.id)),
        inwishlist: moviesData.wishlist.includes(String(movie.id)),
      };
    });

    res.json({ results: moviesWithStatuses });
  } catch (error) {
    console.error("Erro ao buscar filmes top-rated:", error);
    res.status(500).json({ error: "Erro ao buscar filmes top-rated" });
  }
});

app.get("/search", async (req: Request, res: Response) => {
  const query = req.query.query as string;

  if (!query || query.trim() === "") {
    return res.status(400).json({ error: "O parâmetro 'query é obrigatorio" });
  }

  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/search/movie?api_key=8ed200f50a6942ca5bc8b5cdec27ff22&query=${query}`
    );

    const fetchedMovies = response.data.results;

    const movieData = readMoviesData();

    const moviesWithWatchedStatus = fetchedMovies.map((movie: Movie) => {
      return {
        ...movie,
        watched: movieData.filmesAssistidos.includes(String(movie.id)),
        inWishlist: movieData.wishlist.includes(String(movie.id)),
      };
    });

    res.json({ results: moviesWithWatchedStatus });
  } catch (error) {
    console.error("Erro ao buscar filmes:", error);
    res.status(500).json({ error: "Erro ao buscar filmes" });
  }
});

app.get("/movie", async (req: Request, res: Response) => {
  const movieId = req.query.movieId as string;

  if (!movieId || movieId.trim() === "") {
    return res.status(400).json({ error: "O parâmetro movieId é obrigatorio" });
  }

  try {
    const tmdbResponse = await axios.get(
      `https://api.themoviedb.org/3/movie/${movieId}?api_key=8ed200f50a6942ca5bc8b5cdec27ff22`
    );

    const moviesData = readMoviesData();
    const movieData = tmdbResponse.data;

    movieData.watched = moviesData.filmesAssistidos.includes(movieId);
    movieData.inWishlist = moviesData.wishlist.includes(movieId);

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

app.get("/wishlist", async (req: Request, res: Response) => {
  try {
    const moviesData = readMoviesData();

    res.json({ results: moviesData.wishlist });
  } catch (error) {
    console.error("Erro ao buscar filmes top-rated:", error);
    res.status(500).json({ error: "Erro ao buscar filmes top-rated" });
  }
});

app.get("/filmeAssistido/details", async (req: Request, res: Response) => {
  try {
    const moviesData = readMoviesData();
    const filmesAssistidos = moviesData.filmeAssistido || [];

    if (filmesAssistidos.length === 0) {
      return res.json({ message: "Ainda não tem filmes salvos", results: [] });
    }

    const fetchedMoviesDetails = async (movieId: string) => {
      try {
        const response = await axios.get(
          `https://api.themoviedb.org/3/movie/${movieId}?api_key=8ed200f50a6942ca5bc8b5cdec27ff22`
        );
        return response.data;
      } catch (error) {
        console.error(
          `Erro ao buscar detalhes do filme com ID ${movieId}:`,
          error
        );
        return null;
      }
    };

    const filmeAssistidoDetails = await Promise.all(
      filmesAssistidos.map((movieId: string) => fetchedMoviesDetails(movieId))
    );

    const filmeAssistido: (Movie | null)[] = moviesData.filmeAssistido || [];

    const validMovies = filmeAssistido.filter(
      (movie): movie is Movie => movie !== null
    );

    res.json({ results: validMovies });
  } catch (error) {
    console.error("Erro ao buscar detalhes da Lista de Filmes:", error);
    res.status(500).json({ error: "Erro ao processar a lista de filmes" });
  }
});

app.get("/wishlist/details", async (req: Request, res: Response) => {
  try {
    const moviesData = readMoviesData();
    const wishlist = moviesData.wishlist || [];

    if (wishlist.length === 0) {
      return res.json({ message: "A wishlist está vazia", results: [] });
    }

    const fetchedMoviesDetails = async (movieId: string) => {
      try {
        const response = await axios.get(
          `https://api.themoviedb.org/3/movie/${movieId}?api_key=8ed200f50a6942ca5bc8b5cdec27ff22`
        );
        return response.data;
      } catch (error) {
        console.error(
          `Erro ao buscar detalhes do filme com ID ${movieId}:`,
          error
        );
        return null;
      }
    };

    const wishlistMovies = await Promise.all(
      wishlist.map((movieId: string) => fetchedMoviesDetails(movieId))
    );

    const validMovies = wishlistMovies.filter((movie) => movie !== null);

    res.json({ results: validMovies });
  } catch (error) {
    console.error("Erro ao buscar detalhes da wishlist:", error);
    res.status(500).json({ error: "Erro ao processar os filmes da wishlist" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
