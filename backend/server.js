const express = require("express");
const cors = require("cors");
const axios = require("axios");
const csv = require("csv-parser");
const { Readable } = require("stream");

const app = express();

// =============================
// 🔐 CORS SEGURO E FUNCIONAL
// =============================
const allowedOrigins = [
  "https://lojaautopecasemsantarem.netlify.app",
  "http://127.0.0.1:5500",
  "http://localhost:3000"
];

app.use(cors({
  origin: function (origin, callback) {

    // Permite acesso direto pelo navegador
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("CORS bloqueado"));
  }
}));

// =============================
// 📄 PLANILHA GOOGLE
// =============================
const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRQ5Sn_KlgzIYLDXlbMEtofDMgp1pmoSD-QWzuvWfTzCoa_nNqrC1s1oJNjUq2Z8DzIWNxyzAMTv7jJ/pub?output=csv";

// =============================
// ⚡ CACHE
// =============================
let cacheProdutos = [];
let ultimaAtualizacao = 0;
const TEMPO_CACHE = 1000 * 60 * 5;

// =============================
// 🚀 ROTA PRODUTOS
// =============================
app.get("/produtos", async (req, res) => {
  try {

    if (Date.now() - ultimaAtualizacao < TEMPO_CACHE && cacheProdutos.length > 0) {
      return res.json(cacheProdutos);
    }

    const response = await axios.get(SHEET_URL);
    const results = [];

    Readable.from(response.data)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => {
        cacheProdutos = results;
        ultimaAtualizacao = Date.now();
        res.json(results);
      });

  } catch (error) {
    console.log("Erro:", error.message);
    res.status(500).json({ erro: "Erro ao carregar produtos" });
  }
});

// =============================
app.get("/", (req, res) => {
  res.send("API funcionando 🚀");
});

// =============================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});

