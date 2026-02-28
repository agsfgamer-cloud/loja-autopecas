const express = require("express");
const cors = require("cors");
const axios = require("axios");
const csv = require("csv-parser");
const { Readable } = require("stream");

const app = express();

// =============================
// 🌍 CORS LIBERADO (TESTE)
// =============================
app.use(cors());

// =============================
// 📄 PLANILHA GOOGLE
// =============================
const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRQ5Sn_KlgzIYLDXlbMEtofDMgp1pmoSD-QWzuvWfTzCoa_nNqrC1s1oJNjUq2Z8DzIWNxyzAMTv7jJ/pub?output=csv";

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

    // Usa cache se ainda for válido
    if ((Date.now() - ultimaAtualizacao) < TEMPO_CACHE && cacheProdutos.length > 0) {
      return res.json(cacheProdutos);
    }

    // Busca da planilha
    const response = await axios.get(SHEET_URL);
    const results = [];

    Readable.from(response.data)
      .pipe(csv())
      .on("data", (data) => {
        results.push({
          Nome: data.Nome || "",
          Categoria: data.Categoria || "",
          SKU: data.SKU || "",
          Preco: data.Preco || "0",
          Detalhes: data.Detalhes || "",
          Imagem: data.Imagem || "",
          Imagem2: data.Imagem2 || "",
          Imagem3: data.Imagem3 || "",
          Estoque: data.Estoque || "0"
        });
      })
      .on("end", () => {
        cacheProdutos = results;
        ultimaAtualizacao = Date.now();
        res.json(results);
      });

  } catch (error) {
    console.log("Erro ao carregar produtos:", error.message);
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
