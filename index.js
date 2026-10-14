
require("dotenv").config();

const express = require("express");
const db = require("./config/database");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "API Sistem Monitoring Jatuh Tempo aktif",
  });
});

app.get("/test-db", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT 1 AS hasil");

    res.json({
      message: "Koneksi database berhasil!",
      data: rows,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message: "Koneksi database gagal",
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});

