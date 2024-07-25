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

router.post('/rekening', authenticateToken, [
    body('noRekening').notEmpty(),
    body('namaBank').notEmpty(),
    body('atasNama').notEmpty(),
], (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    const { noRekening, namaBank, atasNama } = req.body;
    const userId = req.user.id;

    // Mengambil data user berdasarkan id
    connection.query('SELECT nama_umkm, email FROM register_user WHERE id = ?', [userId], function (err, rows) {
        if (err) {
            return res.status(500).json({
                status: false,
                message: 'Internal Server Error',
            });
        }

        if (rows.length === 0) {
            return res.status(404).json({
                status: false,
                message: 'User not found',
            });
        }

        const { nama_umkm, email } = rows[0];

        const rekeningData = {
            userId: userId,
            nama_umkm: nama_umkm,
            email: email,
            noRekening: noRekening,
            namaBank: namaBank,
            atasNama: atasNama
        };

        // Query untuk insert data rekening
        connection.query('INSERT INTO rekening_user SET ?', rekeningData, function (err, result) {
            if (err) {
                return res.status(500).json({
                    status: false,
                    message: 'Internal Server Error',
                });
            } else {
                return res.status(201).json({
                    status: true,
                    message: 'Rekening placed successfully',
                    rekeningId: result.insertId
                });
            }
        });
    });
});

router.get('/getRekening', authenticateToken, (req, res) => {
    connection.query('SELECT rekeningid, noRekening, namaBank, atasNama FROM rekening_user WHERE userId = ?', [req.user.id], function (err, rows) {
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
                message: 'No Rekening found',
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Data Rekening Berhasil Ditampilkan',
            rekening: rows
        });
    });
});

// Endpoint untuk memperbarui data rekening
router.put('/updateRekening/:rekeningId', authenticateToken, [
    body('noRekening').optional().isInt(),
    body('namaBank').optional().notEmpty(),
    body('atasNama').optional().notEmpty(),
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    const rekeningId = req.params.rekeningId;
    const { noRekening, namaBank, atasNama } = req.body;
    const userId = req.user.id;

    // Query untuk update data rekening
    connection.query(
        'UPDATE rekening_user SET noRekening = ?, namaBank = ?, atasNama = ? WHERE rekeningid = ? AND userId = ?',
        [noRekening, namaBank, atasNama, rekeningId, userId],
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
                    message: 'Rekening not found or not owned by user',
                });
            }

            return res.status(200).json({
                status: true,
                message: 'Rekening updated successfully',
            });
        }
    );
});



module.exports = router;
