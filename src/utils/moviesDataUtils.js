"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readMoviesData = readMoviesData;
exports.writeMoviesData = writeMoviesData;
var fs_1 = require("fs");
var path_1 = require("path");
var dataFilePath = path_1.default.join(__dirname, "data", "moviesData.json");
function readMoviesData() {
    try {
        if (!fs_1.default.existsSync(dataFilePath)) {
            var initialData = { wishlist: [], filmesAssistidos: [] };
            fs_1.default.writeFileSync(dataFilePath, JSON.stringify(initialData, null, 2), "utf-8");
            return initialData;
        }
        var data = fs_1.default.readFileSync(dataFilePath, "utf-8");
        return JSON.parse(data);
    }
    catch (error) {
        console.error("Erro ao ler o arquivo JSON:", error);
        return { wishlist: [], filmesAssistidos: [] }; // Estrutura padrão para evitar crash
    }
}
function writeMoviesData(data) {
    fs_1.default.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), "utf-8");
}
