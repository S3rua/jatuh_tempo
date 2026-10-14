
const db = require("../config/database");

// 1. Menampilkan semua pelanggan
const getAllPelanggan = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM pelanggan"
    );

    res.json({
      message: "Data pelanggan berhasil diambil",
      data: rows,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message: "Gagal mengambil data pelanggan",
    });
  }
};

// 2. Menampilkan satu pelanggan berdasarkan ID
const getPelangganById = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM pelanggan WHERE pelanggan_id = ?",
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Pelanggan tidak ditemukan",
      });
    }

    res.json({
      message: "Data pelanggan berhasil ditemukan",
      data: rows[0],
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message: "Gagal mengambil data pelanggan",
    });
  }
};

// 3. Menambahkan pelanggan
const createPelanggan = async (req, res) => {
  try {
    const { nama, nomor_telepon } = req.body;

    if (
      typeof nama !== "string" ||
      !nama.trim() ||
      nomor_telepon === undefined ||
      !/^\d+$/.test(String(nomor_telepon))
    ) {
      return res.status(400).json({
        message: "Nama dan nomor telepon wajib diisi dengan benar",
      });
    }

    const [result] = await db.query(
      "INSERT INTO pelanggan (nama, nomor_telepon) VALUES (?, ?)",
      [nama.trim(), nomor_telepon]
    );

    res.status(201).json({
      message: "Pelanggan berhasil ditambahkan",
      pelanggan_id: result.insertId,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message: "Gagal menambahkan pelanggan",
    });
  }
};

// 4. Mengubah data pelanggan
const updatePelanggan = async (req, res) => {
  try {
    const { nama, nomor_telepon } = req.body;

    if (
      typeof nama !== "string" ||
      !nama.trim() ||
      nomor_telepon === undefined ||
      !/^\d+$/.test(String(nomor_telepon))
    ) {
      return res.status(400).json({
        message: "Nama dan nomor telepon wajib diisi dengan benar",
      });
    }

    const [result] = await db.query(
      "UPDATE pelanggan SET nama = ?, nomor_telepon = ? WHERE pelanggan_id = ?",
      [nama.trim(), nomor_telepon, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Pelanggan tidak ditemukan",
      });
    }

    res.json({
      message: "Data pelanggan berhasil diperbarui",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message: "Gagal memperbarui data pelanggan",
    });
  }
};

// 5. Menghapus pelanggan
const deletePelanggan = async (req, res) => {
  try {
    const [result] = await db.query(
      "DELETE FROM pelanggan WHERE pelanggan_id = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Pelanggan tidak ditemukan",
      });
    }

    res.json({
      message: "Pelanggan berhasil dihapus",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message: "Gagal menghapus pelanggan",
    });
  }
};

module.exports = {
  getAllPelanggan,
  getPelangganById,
  createPelanggan,
  updatePelanggan,
  deletePelanggan,
};
