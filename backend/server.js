const express = require("express");
const cors = require("cors");
const axios = require("axios");
const csv = require("csv-parser");
const { Readable } = require("stream");

// 1. VOCÊ PRECISA CRIAR O APP ANTES DE TUDO
const app = express();

// 2. AGORA SIM VOCÊ CONFIGURA O CORS
const allowedOrigins = [
  'https://lojaautopecasemsantarem.netlify.app', // Removi a "/" do final para evitar erro de match
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Acesso negado por segurança (CORS)'));
  }
}));

const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRQ5Sn_KlgzIYLDXlbMEtofDMgp1pmoSD-QWzuvWfTzCoa_nNqrC1s1oJNjUq2Z8DzIWNxyzAMTv7jJ/pub?output=csv";

// 3. ROTAS
app.get("/produtos", async (req, res) => {
  try {
    const response = await axios.get(SHEET_URL);
    const results = [];
    const stream = Readable.from(response.data);

    stream
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => res.json(results));

  } catch (error) {
    res.status(500).json({ erro: "Erro ao carregar planilha" });
  }
});

app.get("/", (req, res) => {
  res.send("API funcionando 🚀");
});

// 4. ESCUTA
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
