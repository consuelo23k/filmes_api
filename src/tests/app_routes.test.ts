//import request from "supertest";
/*
https://github.com/nestjs/schematics/issues/99

-------------
The docs show import * as request from 'supertest' for a reason. 
Supertest does not use a default export. Unless you add esModuleInterop: true to
 your tsconfig you'll need to use the commonjs import syntax for Typescript. 
 If you need further support, please visit our Discord
-------------

*/

import { app, readJsonFile, writeJsonFile } from "../index";
import * as request from "supertest";

import axios from "axios";

jest.mock("../", () => ({
  readJsonFile: jest.fn(),
  writeJsonFile: jest.fn(),
}));

jest.mock("axios");

describe("Testes para todas as rotas", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockMoviesData = (data: any) => {
    (readJsonFile as jest.Mock).mockReturnValue(data);
  };

  describe.only("/wishlist/add", () => {
    it.only("Deve adicionar um filme à wishlist", async () => {
      console.log(JSON.stringify(app));
      mockMoviesData({ wishlist: [] });

      const response = await request(app)
        .post("/wishlist/add")
        .query({ movieId: "123" });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Filme adicionado á wishlist");
      expect(response.body.wishlist).toContain("123");
      expect(writeJsonFile).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ wishlist: ["123"] })
      );
    });
  });

  describe("/wishlist/remove", () => {
    it("Deve remover um filme da wishlist", async () => {
      mockMoviesData({ wishlist: ["123"] });

      const response = await request(app)
        .delete("/wishlist/remove")
        .query({ movieId: "123" });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Filme removido da wishlist");
      expect(response.body.wishlist).not.toContain("123");
      expect(writeJsonFile).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ wishlist: [] })
      );
    });
  });

  describe("/top_rated", () => {
    it("Deve retornar os filmes top-rated", async () => {
      (axios.get as jest.Mock).mockResolvedValue({
        data: { results: [{ id: "1", title: "Movie 1" }] },
      });

      mockMoviesData({ filmesAssistidos: [], wishlist: [] });

      const response = await request(app).get("/top_rated");

      expect(response.status).toBe(200);
      expect(response.body.results).toHaveLength(1);
      expect(response.body.results[0]).toEqual(
        expect.objectContaining({
          id: "1",
          title: "Movie 1",
          watched: false,
          inwishlist: false,
        })
      );
    });
  });

  describe("/search", () => {
    it("Deve retornar os resultados de busca", async () => {
      (axios.get as jest.Mock).mockResolvedValue({
        data: { results: [{ id: "1", title: "Searched Movie" }] },
      });

      mockMoviesData({ filmesAssistidos: [], wishlist: [] });

      const response = await request(app)
        .get("/search")
        .query({ query: "movie" });

      expect(response.status).toBe(200);
      expect(response.body.results).toHaveLength(1);
      expect(response.body.results[0]).toEqual(
        expect.objectContaining({
          id: "1",
          title: "Searched Movie",
          watched: false,
          inWishlist: false,
        })
      );
    });
  });

  describe("/movie", () => {
    it("Deve retornar os detalhes de um filme", async () => {
      (axios.get as jest.Mock).mockResolvedValue({
        data: { id: "123", title: "Movie Details" },
      });

      mockMoviesData({ filmesAssistidos: ["123"], wishlist: [] });

      const response = await request(app)
        .get("/movie")
        .query({ movieId: "123" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          id: "123",
          title: "Movie Details",
          watched: true,
          inWishlist: false,
        })
      );
    });
  });

  describe("/filmeAssistido/add", () => {
    it("Deve marcar um filme como assistido", async () => {
      mockMoviesData({ filmesAssistidos: [] });

      const response = await request(app)
        .post("/filmeAssistido/add")
        .query({ movieId: "123" });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Filme marcado como assistido");
      expect(response.body.filmesAssistidos).toContain("123");
      expect(writeJsonFile).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ filmesAssistidos: ["123"] })
      );
    });
  });

  describe("/filmeNaoAssistido/remove", () => {
    it("Deve remover um filme da lista de assistidos", async () => {
      mockMoviesData({ filmesAssistidos: ["123"] });

      const response = await request(app)
        .delete("/filmeNaoAssistido/remove")
        .query({ movieId: "123" });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe(
        "Filme removido da lista de assistidos"
      );
      expect(response.body.movieIds).not.toContain("123");
      expect(writeJsonFile).toHaveBeenCalledWith(
        expect.any(String),
        expect.not.objectContaining({ filmesAssistidos: ["123"] })
      );
    });
  });

  describe("/wishlist", () => {
    it("Deve retornar a wishlist", async () => {
      mockMoviesData({ wishlist: ["123"] });

      const response = await request(app).get("/wishlist");

      expect(response.status).toBe(200);
      expect(response.body.results).toEqual(["123"]);
    });
  });

  describe("/wishlist/details", () => {
    it("Deve retornar os detalhes dos filmes da wishlist", async () => {
      mockMoviesData({ wishlist: ["123"] });

      (axios.get as jest.Mock).mockResolvedValue({
        data: { id: "123", title: "Wishlist Movie" },
      });

      const response = await request(app).get("/wishlist/details");

      expect(response.status).toBe(200);
      expect(response.body.results).toHaveLength(1);
      expect(response.body.results[0]).toEqual(
        expect.objectContaining({
          id: "123",
          title: "Wishlist Movie",
        })
      );
    });
  });
});
