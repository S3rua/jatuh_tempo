
const db = require("../config/database");

// GET: mengambil semua user
const getAllUsers = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM users"
    );

    res.json({
      message: "Data user berhasil diambil",
      data: rows,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message: "Gagal mengambil data user",
    });
  }
};

// GET: mengambil user berdasarkan ID
const getUserById = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT user_id, nama, username, role FROM users WHERE user_id = ?",
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "User tidak ditemukan",
      });
    }

    res.json({
      message: "Data user berhasil ditemukan",
      data: rows[0],
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message: "Gagal mengambil data user",
    });
  }
};

// POST: menambahkan user
const createUser = async (req, res) => {
  try {
    const { nama, username, password, role } = req.body;

    if (
      typeof nama !== "string" || !nama.trim() ||
      typeof username !== "string" || !username.trim() ||
      typeof password !== "string" || !password ||
      !["user", "admin"].includes(role)
    ) {
      return res.status(400).json({
        message: "Nama, username, password, dan role wajib diisi dengan benar",
      });
    }

    // Hash password sebelum disimpan
    const bcrypt = require("bcryptjs");
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      "INSERT INTO users (nama, username, password, role) VALUES (?, ?, ?, ?)",
      [nama.trim(), username.trim(), hashedPassword, role]
    );

    res.status(201).json({
      message: "User berhasil ditambahkan",
      user_id: result.insertId,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message: "Gagal menambahkan user",
    });
  }
};

// PUT: mengubah user
const updateUser = async (req, res) => {
  try {
    const { nama, username, password, role } = req.body;

    if (
      typeof nama !== "string" || !nama.trim() ||
      typeof username !== "string" || !username.trim() ||
      !["user", "admin"].includes(role)
    ) {
      return res.status(400).json({
        message: "Nama, username, dan role wajib diisi dengan benar",
      });
    }

    let query;
    let values;

    if (password !== undefined && password !== "") {
      if (typeof password !== "string") {
        return res.status(400).json({
          message: "Password tidak valid",
        });
      }

      const bcrypt = require("bcryptjs");
      const hashedPassword = await bcrypt.hash(password, 10);

      query = `UPDATE users
               SET nama = ?, username = ?, password = ?, role = ?
               WHERE user_id = ?`;

      values = [
        nama.trim(),
        username.trim(),
        hashedPassword,
        role,
        req.params.id,
      ];
    } else {
      query = `UPDATE users
               SET nama = ?, username = ?, role = ?
               WHERE user_id = ?`;

      values = [
        nama.trim(),
        username.trim(),
        role,
        req.params.id,
      ];
    }

    const [result] = await db.query(query, values);

    if (result.affectedRows === 0) {
      const [rows] = await db.query(
        "SELECT user_id FROM users WHERE user_id = ?",
        [req.params.id]
      );

      if (rows.length === 0) {
        return res.status(404).json({
          message: "User tidak ditemukan",
        });
      }
    }

    res.json({
      message: "Data user berhasil diperbarui",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message: "Gagal memperbarui user",
    });
  }
};

// DELETE: menghapus user
const deleteUser = async (req, res) => {
  try {
    const [result] = await db.query(
      "DELETE FROM users WHERE user_id = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "User tidak ditemukan",
      });
    }

    res.json({
      message: "User berhasil dihapus",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message:
        "Gagal menghapus user. Periksa apakah user masih terhubung dengan penempatan.",
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
