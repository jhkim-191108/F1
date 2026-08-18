require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());

app.get("/api/products", async (req, res) => {
  const response = await fetch(`${process.env.API_BASE}/api/products`, {
    headers: { "X-API-Key": process.env.API_KEY },
  });
  const data = await response.json();
  res.json(data);
});

app.listen(3000, () => console.log("서버 실행 중"));
