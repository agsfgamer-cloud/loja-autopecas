const express = require("express");
const cors = require("cors");
const axios = require("axios");
const csv = require("csv-parser");
const { Readable } = require("stream");

const app = express();

// =============================
// 🔐 CORS - Permite só seu site
// =============================
app.use(cors({
  origin: [
    "http://127.0.0.1:5500",
    "http://localhost:3000",
    "https://lojaautopecasemsantarem.netlify.app"
  ]
}));
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Acesso negado por segurança (CORS)"));
  }
}));

// =============================
// 🔒 BLOQUEIO ACESSO DIRETO
// =============================
app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Se não vier origin, bloqueia
  if (!origin) {
    return res.status(403).json({ erro: "Acesso direto bloqueado" });
  }

  // Se o origin não estiver na lista permitida, bloqueia
  if (!allowedOrigins.includes(origin)) {
    return res.status(403).json({ erro: "Origem não permitida" });
  }

  next();
});

// =============================
// 📄 PLANILHA GOOGLE
// =============================
const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRQ5Sn_KlgzIYLDXlbMEtofDMgp1pmoSD-QWzuvWfTzCoa_nNqrC1s1oJNjUq2Z8DzIWNxyzAMTv7jJ/pub?output=csv";
async function atualizarProdutos() {
  try {
    console.log("🔄 Atualizando estoque automaticamente...");

    const response = await axios.get(SHEET_URL);
    const results = [];
    const stream = Readable.from(response.data);

    stream
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => {
        cacheProdutos = results;
        ultimaAtualizacao = Date.now();
        console.log("✅ Estoque atualizado!");
      });

  } catch (error) {
    console.log("❌ Erro ao atualizar estoque");
  }
}
// =============================
// ⚡ CACHE (5 minutos)
// =============================
let cacheProdutos = [];
let ultimaAtualizacao = 0;
const TEMPO_CACHE = 1000 * 60 * 5;

// =============================
// 🚀 ROTA PRODUTOS
// =============================
app.get("/produtos", async (req, res) => {
  try {

    // Se tiver cache válido, usa ele
    if (Date.now() - ultimaAtualizacao < TEMPO_CACHE && cacheProdutos.length > 0) {
      return res.json(cacheProdutos);
    }

    // Busca da planilha
    const response = await axios.get(SHEET_URL);
    const results = [];
    const stream = Readable.from(response.data);

    stream
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => {
        cacheProdutos = results;
        ultimaAtualizacao = Date.now();
        res.json(results);
      });

  } catch (error) {
    res.status(500).json({ erro: "Erro ao carregar produtos" });
  }
});

// =============================
// 🟢 ROTA RAIZ
// =============================
app.get("/", (req, res) => {
  res.send("API funcionando 🚀");
});

// =============================
// 🎯 SERVIDOR
// =============================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
