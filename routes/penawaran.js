require('dotenv').config();
const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
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

router.post('/penawaran', authenticateToken, (req, res) => {

    const { userId, orderId, nama_umkm, email, namaProduk, sisaStokProduk, keterangan, statusPenawaran } = req.body;

        const penawaranData = {
            userId: userId,
            orderId: orderId,
            nama_umkm: nama_umkm,
            email: email,
            namaProduk: namaProduk,
            sisaStokProduk: sisaStokProduk,
            keterangan: keterangan,
            statusPenawaran: statusPenawaran
            
        };

        // Query untuk insert data rekening
        connection.query('INSERT INTO penawaran SET ?', penawaranData, function (err, result) {
            if (err) {
                return res.status(500).json({
                    status: false,
                    message: 'Internal Server Error',
                });
            } else {
                return res.status(201).json({
                    status: true,
                    message: 'Penjualan placed successfully',
                    penawaranId: result.insertId
                });
            }
        });
  
});

router.get('/getPenawaran', authenticateToken, (req, res) => {
    connection.query('SELECT penawaranId, userId, orderId, nama_umkm, email, namaProduk, sisaStokProduk, keterangan, statusPenawaran FROM penawaran WHERE userId = ?', [req.user.id], function (err, rows) {
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
                message: 'No Penawaran found',
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Data Penawaran Berhasil Ditampilkan',
            penawaran: rows
        });
    });
});

router.get('/detailPenawaran/:penawaranId', authenticateToken, (req, res) => {
    const { penawaranId } = req.params;
    connection.query('SELECT penawaranId, userId, orderId, nama_umkm, email, namaProduk, sisaStokProduk, keterangan, statusPenawaran FROM penawaran WHERE userId = ? AND penawaranId = ?', [req.user.id, penawaranId], function (err, rows) {
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
                message: 'Data Penawaran Tidak Ditemukan',
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Detail Penawaran Berhasil Ditampilkan',
            penawaranDetail: rows[0]
        });
    });
});

router.put('/updateStatusPenawaran/:penawaranId', authenticateToken, (req, res) => {

    const penawaranId = req.params.penawaranId;
    const { statusPenawaran } = req.body;
    const userId = req.user.id;

    // Query untuk update data rekening
    connection.query(
        'UPDATE penawaran SET statusPenawaran = ? WHERE penawaranId = ? AND userId = ?',
        [statusPenawaran, penawaranId, userId],
        function (err, result) {
            if (err) {
                return res.status(500).json({
                    status: false,
                    message: 'Internal Server Error',
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    status: false,
                    message: 'Penawaran not found or not owned by user',
                });
            }

            return res.status(200).json({
                status: true,
                message: 'Status Penawaran updated successfully',
            });
        }
    );
});




module.exports = router;