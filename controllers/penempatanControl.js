
const db = require("../config/database");

// 1. Mengambil semua data penempatan
const getAllPenempatan = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        p.*,
        pl.nama AS nama_pelanggan,
        u.nama AS nama_user
      FROM penempatan p
      LEFT JOIN pelanggan pl
        ON p.pelanggan_id = pl.pelanggan_id
      LEFT JOIN users u
        ON p.user_id = u.user_id
      ORDER BY p.penempatan_id DESC
    `);

    res.json({
      message: "Data penempatan berhasil diambil",
      data: rows,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message: "Gagal mengambil data penempatan",
    });
  }
};

// 2. Mengambil satu penempatan berdasarkan ID
const getPenempatanById = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.*, pl.nama AS nama_pelanggan,
              u.nama AS nama_user
       FROM penempatan p
       LEFT JOIN pelanggan pl
         ON p.pelanggan_id = pl.pelanggan_id
       LEFT JOIN users u ON p.user_id = u.user_id
       WHERE p.penempatan_id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Data penempatan tidak ditemukan",
      });
    }

    res.json({
      message: "Data penempatan berhasil ditemukan",
      data: rows[0],
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message: "Gagal mengambil data penempatan",
    });
  }
};

// Validasi input penempatan
const validasiPenempatan = (body) => {
  const {
    pelanggan_id,
    user_id,
    tanggal_penempatan,
    jangka_waktu_bulan,
    tanggal_jatuh_tempo,
    nominal,
    status_pembayaran,
  } = body;

  const tanggalValid = (tanggal) =>
    typeof tanggal === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(tanggal) &&
    !Number.isNaN(Date.parse(tanggal)) &&
    new Date(tanggal).toISOString().slice(0, 10) === tanggal;

  if (
    !Number.isSafeInteger(Number(pelanggan_id)) ||
    Number(pelanggan_id) <= 0 ||
    !Number.isSafeInteger(Number(user_id)) ||
    Number(user_id) <= 0 ||
    !tanggalValid(tanggal_penempatan) ||
    !Number.isSafeInteger(Number(jangka_waktu_bulan)) ||
    Number(jangka_waktu_bulan) <= 0 ||
    !tanggalValid(tanggal_jatuh_tempo) ||
    nominal === undefined ||
    nominal === null ||
    !/^\d+(\.\d+)?$/.test(String(nominal)) ||
    !Number.isFinite(Number(nominal)) ||
    Number(nominal) < 0 ||
    !["belum bayar", "lunas"].includes(status_pembayaran)
  ) {
    return false;
  }

  return true;
};

// Memastikan pelanggan dan user tersedia
const relasiValid = async (pelanggan_id, user_id) => {
  const [pelanggan] = await db.query(
    "SELECT pelanggan_id FROM pelanggan WHERE pelanggan_id = ?",
    [pelanggan_id]
  );

  const [users] = await db.query(
    "SELECT user_id FROM users WHERE user_id = ?",
    [user_id]
  );

  return pelanggan.length > 0 && users.length > 0;
};

// 3. Menambahkan penempatan
const createPenempatan = async (req, res) => {
  try {
    if (!validasiPenempatan(req.body)) {
      return res.status(400).json({
        message: "Data penempatan tidak valid",
      });
    }

    const {
      pelanggan_id,
      user_id,
      tanggal_penempatan,
      jangka_waktu_bulan,
      tanggal_jatuh_tempo,
      nominal,
      status_pembayaran,
    } = req.body;

    if (!(await relasiValid(pelanggan_id, user_id))) {
      return res.status(400).json({
        message: "Pelanggan atau user tidak ditemukan",
      });
    }

    const [result] = await db.query(
      `INSERT INTO penempatan
       (pelanggan_id, user_id, tanggal_penempatan,
        jangka_waktu_bulan, tanggal_jatuh_tempo,
        nominal, status_pembayaran)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        pelanggan_id,
        user_id,
        tanggal_penempatan,
        jangka_waktu_bulan,
        tanggal_jatuh_tempo,
        nominal,
        status_pembayaran,
      ]
    );

    res.status(201).json({
      message: "Penempatan berhasil ditambahkan",
      penempatan_id: result.insertId,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message: "Gagal menambahkan penempatan",
    });
  }
};

// 4. Mengubah penempatan
const updatePenempatan = async (req, res) => {
  try {
    if (!validasiPenempatan(req.body)) {
      return res.status(400).json({
        message: "Data penempatan tidak valid",
      });
    }

    const {
      pelanggan_id,
      user_id,
      tanggal_penempatan,
      jangka_waktu_bulan,
      tanggal_jatuh_tempo,
      nominal,
      status_pembayaran,
    } = req.body;

    if (!(await relasiValid(pelanggan_id, user_id))) {
      return res.status(400).json({
        message: "Pelanggan atau user tidak ditemukan",
      });
    }

    const [result] = await db.query(
      `UPDATE penempatan
       SET pelanggan_id = ?,
           user_id = ?,
           tanggal_penempatan = ?,
           jangka_waktu_bulan = ?,
           tanggal_jatuh_tempo = ?,
           nominal = ?,
           status_pembayaran = ?
       WHERE penempatan_id = ?`,
      [
        pelanggan_id,
        user_id,
        tanggal_penempatan,
        jangka_waktu_bulan,
        tanggal_jatuh_tempo,
        nominal,
        status_pembayaran,
        req.params.id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Penempatan tidak ditemukan",
      });
    }

    res.json({
      message: "Penempatan berhasil diperbarui",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message: "Gagal memperbarui penempatan",
    });
  }
};

// 5. Menghapus penempatan
const deletePenempatan = async (req, res) => {
  try {
    const [result] = await db.query(
      "DELETE FROM penempatan WHERE penempatan_id = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Penempatan tidak ditemukan",
      });
    }

    res.json({
      message: "Penempatan berhasil dihapus",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message:
        "Gagal menghapus penempatan. Periksa apakah data reward masih terhubung.",
    });
  }
};

module.exports = {
  getAllPenempatan,
  getPenempatanById,
  createPenempatan,
  updatePenempatan,
  deletePenempatan,
};
