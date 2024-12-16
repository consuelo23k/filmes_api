"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeJsonFile = exports.readJsonFile = exports.app = void 0;
var express_1 = require("express");
var cors_1 = require("cors");
var axios_1 = require("axios");
var fs_1 = require("fs");
var path_1 = require("path");
var moviesDataUtils_1 = require("./utils/moviesDataUtils");
var app = (0, express_1.default)();
exports.app = app;
var port = 3000;
var jsonFilePath = path_1.default.join(__dirname, "filmesAssistidos.json");
var dataFilePath = path_1.default.join(__dirname, "data", "moviesData.json");
var ensureFileExists = function (filePath) {
    if (!fs_1.default.existsSync(filePath)) {
        fs_1.default.writeFileSync(filePath, "[]", "utf-8");
    }
};
var readJsonFile = function (filePath) {
    try {
        ensureFileExists(filePath);
        var data = fs_1.default.readFileSync(filePath, "utf-8");
        return JSON.parse(data);
    }
    catch (error) {
        console.error("Erro ao ler o arquivo json:", error);
        return [];
    }
};
exports.readJsonFile = readJsonFile;
var writeJsonFile = function (filePath, data) {
    try {
        fs_1.default.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    }
    catch (error) {
        console.error("Erro ao escrever no arquivo JSON:", error);
    }
};
exports.writeJsonFile = writeJsonFile;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.post("/wishlist/add", function (req, res) {
    var movieId = req.query.movieId;
    if (!movieId || movieId.trim() === "") {
        return res.status(400).json({
            error: "o parâmetro movieId é obrigatorio e não pode está vazio",
        });
    }
    var moviesData = (0, moviesDataUtils_1.readMoviesData)();
    if (!moviesData.wishlist) {
        moviesData.wishlist = [];
    }
    if (!moviesData.wishlist.includes(movieId)) {
        moviesData.wishlist.push(movieId);
        (0, moviesDataUtils_1.writeMoviesData)(moviesData);
    }
    res.json({
        message: "Filme adicionado á wishlist",
        wishlist: moviesData.wishlist,
    });
});
app.delete("/wishlist/remove", function (req, res) {
    var movieId = req.query.movieId;
    if (!movieId || movieId.trim() === "") {
        return res.status(400).json({
            error: "O parâmetro movieId é obrigatorio e não pede estar vazio",
        });
    }
    var moviesData = (0, moviesDataUtils_1.readMoviesData)();
    var index = moviesData.wishlist.indexOf(movieId);
    if (index === -1) {
        return res.status(404).json({
            error: "Filme não encontrado na wishlist",
        });
    }
    moviesData.wishlist.splice(index, 1);
    (0, moviesDataUtils_1.writeMoviesData)(moviesData);
    res.json({
        message: "Filme removido da wishlist",
        wishlist: moviesData.wishlist,
    });
});
app.get("/top_rated", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var response, fetchedMovies, moviesData_1, moviesWithStatuses, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, axios_1.default.get("https://api.themoviedb.org/3/movie/top_rated?api_key=8ed200f50a6942ca5bc8b5cdec27ff22")];
            case 1:
                response = _a.sent();
                fetchedMovies = response.data.results;
                moviesData_1 = (0, moviesDataUtils_1.readMoviesData)();
                moviesWithStatuses = fetchedMovies.map(function (movie) {
                    return __assign(__assign({}, movie), { watched: moviesData_1.filmesAssistidos.includes(String(movie.id)), inwishlist: moviesData_1.wishlist.includes(String(movie.id)) });
                });
                res.json({ results: moviesWithStatuses });
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error("Erro ao buscar filmes top-rated:", error_1);
                res.status(500).json({ error: "Erro ao buscar filmes top-rated" });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.get("/search", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var query, response, fetchedMovies, movieData_1, moviesWithWatchedStatus, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                query = req.query.query;
                if (!query || query.trim() === "") {
                    return [2 /*return*/, res.status(400).json({ error: "O parâmetro 'query é obrigatorio" })];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, axios_1.default.get("https://api.themoviedb.org/3/search/movie?api_key=8ed200f50a6942ca5bc8b5cdec27ff22&query=".concat(query))];
            case 2:
                response = _a.sent();
                fetchedMovies = response.data.results;
                movieData_1 = (0, moviesDataUtils_1.readMoviesData)();
                moviesWithWatchedStatus = fetchedMovies.map(function (movie) {
                    return __assign(__assign({}, movie), { watched: movieData_1.filmesAssistidos.includes(String(movie.id)), inWishlist: movieData_1.wishlist.includes(String(movie.id)) });
                });
                res.json({ results: moviesWithWatchedStatus });
                return [3 /*break*/, 4];
            case 3:
                error_2 = _a.sent();
                console.error("Erro ao buscar filmes:", error_2);
                res.status(500).json({ error: "Erro ao buscar filmes" });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.get("/movie", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var movieId, tmdbResponse, moviesData, movieData, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                movieId = req.query.movieId;
                if (!movieId || movieId.trim() === "") {
                    return [2 /*return*/, res.status(400).json({ error: "O parâmetro movieId é obrigatorio" })];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, axios_1.default.get("https://api.themoviedb.org/3/movie/".concat(movieId, "?api_key=8ed200f50a6942ca5bc8b5cdec27ff22"))];
            case 2:
                tmdbResponse = _a.sent();
                moviesData = (0, moviesDataUtils_1.readMoviesData)();
                movieData = tmdbResponse.data;
                movieData.watched = moviesData.filmesAssistidos.includes(movieId);
                movieData.inWishlist = moviesData.wishlist.includes(movieId);
                res.json(movieData);
                return [3 /*break*/, 4];
            case 3:
                error_3 = _a.sent();
                console.error("Erro ao buscar filme:", error_3);
                res.status(500).json({ error: "Erro ao buscar o filme do TMDB" });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.post("/filmeAssistido/add", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var movieId, moviesData;
    return __generator(this, function (_a) {
        movieId = req.query.movieId;
        if (!movieId) {
            return [2 /*return*/, res.status(400).json({ error: "O parâmetro movieId é obrigatorio" })];
        }
        moviesData = (0, moviesDataUtils_1.readMoviesData)();
        if (!moviesData.filmesAssistidos) {
            moviesData.filmesAssistidos = [];
        }
        if (!moviesData.filmesAssistidos.includes(movieId)) {
            moviesData.filmesAssistidos.push(movieId);
            (0, moviesDataUtils_1.writeMoviesData)(moviesData);
        }
        res.json({
            message: "Filme marcado como assistido",
            filmesAssistidos: moviesData.filmesAssistidos,
        });
        return [2 /*return*/];
    });
}); });
app.delete("/filmeNaoAssistido/remove", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var movieId, movieIds;
    return __generator(this, function (_a) {
        movieId = req.query.movieId;
        if (!movieId) {
            return [2 /*return*/, res.status(400).json({ error: "O parâmetro movieId é obrigatório" })];
        }
        try {
            movieIds = readJsonFile(jsonFilePath);
            if (movieIds.includes(movieId)) {
                movieIds = movieIds.filter(function (id) { return id !== movieId; });
                writeJsonFile(jsonFilePath, movieIds);
                return [2 /*return*/, res.json({
                        message: "Filme removido da lista de assistidos",
                        movieIds: movieIds,
                    })];
            }
            else {
                return [2 /*return*/, res.json({
                        message: "Filme não encontrado",
                        movieIds: movieIds,
                    })];
            }
        }
        catch (error) {
            console.error("Erro ao processar a requisição:", error);
            res.status(500).json({ error: "Erro ao processar o filme não assistido" });
        }
        return [2 /*return*/];
    });
}); });
app.get("/wishlist", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var moviesData;
    return __generator(this, function (_a) {
        try {
            moviesData = (0, moviesDataUtils_1.readMoviesData)();
            res.json({ results: moviesData.wishlist });
        }
        catch (error) {
            console.error("Erro ao buscar filmes top-rated:", error);
            res.status(500).json({ error: "Erro ao buscar filmes top-rated" });
        }
        return [2 /*return*/];
    });
}); });
app.get("/wishlist/details", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var moviesData, wishlist, fetchedMoviesDetails_1, wishlistMovies, validMovies, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                moviesData = (0, moviesDataUtils_1.readMoviesData)();
                wishlist = moviesData.wishlist || [];
                if (wishlist.length === 0) {
                    return [2 /*return*/, res.json({ message: "A wishlist está vazia", results: [] })];
                }
                fetchedMoviesDetails_1 = function (movieId) { return __awaiter(void 0, void 0, void 0, function () {
                    var response, error_5;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, , 3]);
                                return [4 /*yield*/, axios_1.default.get("https://api.themoviedb.org/3/movie/".concat(movieId, "?api_key=8ed200f50a6942ca5bc8b5cdec27ff22"))];
                            case 1:
                                response = _a.sent();
                                return [2 /*return*/, response.data];
                            case 2:
                                error_5 = _a.sent();
                                console.error("Erro ao buscar detalhes do filme com ID ".concat(movieId, ":"), error_5);
                                return [2 /*return*/, null];
                            case 3: return [2 /*return*/];
                        }
                    });
                }); };
                return [4 /*yield*/, Promise.all(wishlist.map(function (movieId) { return fetchedMoviesDetails_1(movieId); }))];
            case 1:
                wishlistMovies = _a.sent();
                validMovies = wishlistMovies.filter(function (movie) { return movie !== null; });
                res.json({ results: validMovies });
                return [3 /*break*/, 3];
            case 2:
                error_4 = _a.sent();
                console.error("Erro ao buscar detalhes da wishlist:", error_4);
                res.status(500).json({ error: "Erro ao processar os filmes da wishlist" });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.listen(port, function () {
    console.log("Server is running on http://localhost:".concat(port));
});
console.log(app);
