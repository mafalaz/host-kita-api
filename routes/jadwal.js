require('dotenv').config();
const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const connection = require('../config/database'); // Sesuaikan dengan file konfigurasi koneksi database Anda

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET; // Pastikan sudah diset di environment variable

// Middleware untuk memverifikasi token JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

router.post('/jadwal', authenticateToken, (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    const { userId, orderId, nama_umkm, email, namaProduk, namaHostLive, tanggalLive } = req.body;

        const jadwalData = {
            userId: userId,
            orderId: orderId,
            nama_umkm: nama_umkm,
            email: email,
            namaProduk: namaProduk,
            namaHostLive: namaHostLive,
            tanggalLive: tanggalLive
        };

        // Query untuk insert data rekening
        connection.query('INSERT INTO jadwal_live SET ?', jadwalData, function (err, result) {
            if (err) {
                return res.status(500).json({
                    status: false,
                    message: 'Internal Server Error',
                });
            } else {
                return res.status(201).json({
                    status: true,
                    message: 'Jadwal placed successfully',
                    jadwalLiveId: result.insertId
                });
            }
        });
  
});

router.get('/allJadwal', authenticateToken, (req, res) => {
  connection.query('SELECT jadwalLiveId, userId, orderId, nama_umkm, email, namaProduk, namaHostLive, tanggalLive FROM jadwal_live', function (err, rows) {
      if (err) {
          console.error("Database query error: ", err);
          return res.status(500).json({
              status: false,
              message: 'Internal Server Error',
          });
      }

      if (rows.length === 0) {
          return res.status(404).json({
              status: false,
              message: 'Data Jadwal Live Tidak Ditemukan',
          });
      }

      return res.status(200).json({
          status: true,
          message: 'Data Jadwal Live Berhasil Ditampilkan',
          listJadwal: rows
      });
  });
});

module.exports = router;