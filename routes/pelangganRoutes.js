
const express = require("express");
const router = express.Router();

const {
  getAllPelanggan,
  getPelangganById,
  createPelanggan,
  updatePelanggan,
  deletePelanggan,
} = require("../controllers/pelangganControl");

router.get("/", getAllPelanggan);
router.get("/:id", getPelangganById);
router.post("/", createPelanggan);
router.put("/:id", updatePelanggan);
router.delete("/:id", deletePelanggan);

module.exports = router;
