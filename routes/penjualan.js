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

router.post('/penjualan', authenticateToken, (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    const { userId, orderId, nama_umkm, email, namaProduk, hargaProduk, jumlahProduk, sisaProduk, totalCheckout, totalPendapatan, tanggalUpdatePenjualan } = req.body;

        const penjualanData = {
            userId: userId,
            orderId: orderId,
            nama_umkm: nama_umkm,
            email: email,
            namaProduk: namaProduk,
            hargaProduk: hargaProduk,
            jumlahProduk: jumlahProduk,
            sisaProduk: sisaProduk,
            totalCheckout: totalCheckout,
            totalPendapatan: totalPendapatan,
            tanggalUpdatePenjualan: tanggalUpdatePenjualan
        };

        // Query untuk insert data rekening
        connection.query('INSERT INTO penjualan SET ?', penjualanData, function (err, result) {
            if (err) {
                return res.status(500).json({
                    status: false,
                    message: 'Internal Server Error',
                });
            } else {
                return res.status(201).json({
                    status: true,
                    message: 'Penjualan placed successfully',
                    penjualanId: result.insertId
                });
            }
        });
  
});

router.get('/allPenjualan', authenticateToken, (req, res) => {
  connection.query('SELECT penjualanId, userId, orderId, nama_umkm, email, namaProduk, hargaProduk, jumlahProduk, sisaProduk, totalCheckout, totalPendapatan, tanggalUpdatePenjualan FROM penjualan', function (err, rows) {
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
              message: 'Data Penjualan Tidak Ditemukan',
          });
      }

      return res.status(200).json({
          status: true,
          message: 'Data Order Berhasil Ditampilkan',
          listPenjualan: rows
      });
  });
});

router.get('/penjualanNoDuplicateOrder', authenticateToken, (req, res) => {
    // SQL query untuk memilih entri dengan orderId yang unik dan paling awal
    const query = `
        SELECT penjualanId, userId, orderId, nama_umkm, email, namaProduk, hargaProduk, jumlahProduk, sisaProduk, totalCheckout, totalPendapatan, tanggalUpdatePenjualan
        FROM penjualan
        WHERE (penjualanId, orderId) IN (
            SELECT MIN(penjualanId), orderId
            FROM penjualan
            GROUP BY orderId
        )
    `;

    connection.query(query, function (err, rows) {
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
                message: 'Data Penjualan Tidak Ditemukan',
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Data Penjualan Berhasil Ditampilkan',
            listPenjualan: rows
        });
    });
});


// Endpoint untuk mendapatkan detail penjualan berdasarkan orderId
router.get('/penjualan/detail/:orderId', authenticateToken, (req, res) => {
    const { orderId } = req.params;

    // Query untuk mendapatkan semua data penjualan dengan orderId yang sama
    const query = `
        SELECT penjualanId, userId, orderId, nama_umkm, email, namaProduk, hargaProduk, jumlahProduk, sisaProduk, totalCheckout, totalPendapatan, tanggalUpdatePenjualan
        FROM penjualan
        WHERE orderId = ?
    `;

    connection.query(query, [orderId], function (err, rows) {
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
                message: 'Data Penjualan Tidak Ditemukan',
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Detail Penjualan Berhasil Ditampilkan',
            penjualanDetail: rows
        });
    });
});




module.exports = router;
