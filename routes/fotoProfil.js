require('dotenv').config();
const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const connection = require('../config/database'); // Sesuaikan dengan file konfigurasi koneksi database Anda

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET; // Pastikan sudah diset di environment variable

// Konfigurasi multer untuk upload file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Tentukan folder penyimpanan file
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Tentukan nama file yang unik
    }
});

const upload = multer({ storage: storage });

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



router.post('/fotoProfil', authenticateToken, upload.single('fotoUmkm'), [], (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    const userId = req.user.id;
    const fotoUmkm = req.file ? req.file.path : null;

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

        const orderData = {
            userId: userId,
            nama_umkm: nama_umkm,
            email: email,
            fotoUmkm: fotoUmkm,
        };

        // Query untuk insert data order
        connection.query('INSERT INTO fotoprofiluser SET ?', orderData, function (err, result) {
            if (err) {
                return res.status(500).json({
                    status: false,
                    message: 'Internal Server Error',
                });
            } else {
                return res.status(201).json({
                    status: true,
                    message: 'Foto profil berhasil diupload',
                    fotoId: result.insertId
                });
            }
        });
    });
});

module.exports = router;

