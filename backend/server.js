const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/produtos", (req, res) => {
  try {
    const data = fs.readFileSync("produtos.json", "utf8");
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ erro: "Erro ao carregar produtos" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});