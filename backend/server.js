const express = require("express");
const cors = require("cors");
const axios = require("axios");
const csv = require("csv-parser");
const { Readable } = require("stream");

const app = express();
app.use(cors());

const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRQ5Sn_KlgzIYLDXlbMEtofDMgp1pmoSD-QWzuvWfTzCoa_nNqrC1s1oJNjUq2Z8DzIWNxyzAMTv7jJ/pub?output=csv";

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

app.listen(process.env.PORT || 3000);
