import fs from "fs";
import path from "path";

const dataFilePath = path.join(__dirname, "data", "moviesData.json");

export function readMoviesData() {
  try {
    if (!fs.existsSync(dataFilePath)) {
      const initialData = { wishlist: [], filmesAssistidos: [] };
      fs.writeFileSync(
        dataFilePath,
        JSON.stringify(initialData, null, 2),
        "utf-8"
      );
      return initialData;
    }

    const data = fs.readFileSync(dataFilePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Erro ao ler o arquivo JSON:", error);
    return { wishlist: [], filmesAssistidos: [] }; // Estrutura padrão para evitar crash
  }
}

export function writeMoviesData(data: any) {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), "utf-8");
}
