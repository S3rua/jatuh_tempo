
const express = require("express");
const router = express.Router();

const {
  getAllPenempatan,
  getPenempatanById,
  createPenempatan,
  updatePenempatan,
  deletePenempatan,
} = require("../controllers/penempatanControl");

router.get("/", getAllPenempatan);
router.get("/:id", getPenempatanById);
router.post("/", createPenempatan);
router.put("/:id", updatePenempatan);
router.delete("/:id", deletePenempatan);

module.exports = router;
