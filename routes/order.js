require('dotenv').config();
const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const connection = require('../config/database'); // Sesuaikan dengan file konfigurasi koneksi database Anda
const path = require('path')
const app = express()

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

router.post('/order', authenticateToken, upload.single('fotoProduk'), [
    body('namaProduk').notEmpty(),
    body('hargaProduk').notEmpty().isInt(),
    body('beratProduk').notEmpty().isInt(),
    body('panjangProduk').notEmpty().isInt(),
    body('LebarProduk').notEmpty().isInt(),
    body('tinggiProduk').notEmpty().isInt(),
    body('jumlahProduk').notEmpty().isInt(),
    body('tanggalLive').notEmpty(),
    body('deskripsi').notEmpty()
], (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    const { namaProduk, hargaProduk, beratProduk, panjangProduk, lebarProduk, tinggiProduk, jumlahProduk, tanggalLive, deskripsi } = req.body;
    const userId = req.user.id;
    const fotoProduk = req.file ? req.file.path : null;

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
            namaProduk: namaProduk,
            hargaProduk: hargaProduk,
            beratProduk: beratProduk,
            panjangProduk: panjangProduk,
            lebarProduk: lebarProduk,
            tinggiProduk: tinggiProduk,
            jumlahProduk: jumlahProduk,
            fotoProduk: fotoProduk,
            tanggalLive: tanggalLive,
            deskripsi: deskripsi
        };

        // Query untuk insert data order
        connection.query('INSERT INTO orderuser SET ?', orderData, function (err, result) {
            if (err) {
                return res.status(500).json({
                    status: false,
                    message: 'Internal Server Error',
                });
            } else {
                return res.status(201).json({
                    status: true,
                    message: 'Order placed successfully',
                    orderId: result.insertId
                });
            }
        });
    });
});

router.get('/orderUser', authenticateToken, (req, res) => {
    connection.query('SELECT orderId, namaProduk, hargaProduk, beratProduk, panjangProduk, lebarProduk, tinggiProduk, jumlahProduk, fotoProduk, tanggalLive, deskripsi, biayaPacking, biayaHost, biayaPlatform, totalPayment, statusLive FROM orderuser WHERE userId = ?', [req.user.id], function (err, rows) {
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
                message: 'Data Order Tidak Ditemukan',
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Data Order Berhasil Ditampilkan',
            orderUser: rows
        });
    });
});

router.get('/allOrder', authenticateToken, (req, res) => {
    connection.query('SELECT orderId, nama_umkm, email, namaProduk, hargaProduk, beratProduk, panjangProduk, lebarProduk, tinggiProduk, jumlahProduk, fotoProduk, tanggalLive, deskripsi, biayaPacking, biayaHost, biayaPlatform, totalPayment, statusLive, buktiTransfer, statusPayment FROM orderuser', function (err, rows) {
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
                message: 'Data Order Tidak Ditemukan',
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Data Order Berhasil Ditampilkan',
            orderUser: rows
        });
    });
});


router.get('/orderUser/:orderId', authenticateToken, (req, res) => {
    const { orderId } = req.params;
    connection.query('SELECT orderId, namaProduk, hargaProduk, beratProduk, panjangProduk, lebarProduk, tinggiProduk, jumlahProduk, fotoProduk, tanggalLive, deskripsi, biayaPacking, biayaHost, biayaPlatform, totalPayment, statusLive FROM orderuser WHERE userId = ? AND orderId = ?', [req.user.id, orderId], function (err, rows) {
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
                message: 'Data Order Tidak Ditemukan',
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Detail Order Berhasil Ditampilkan',
            orderDetail: rows[0]
        });
    });
});

router.put('/updateStatusPayment/:orderId', authenticateToken, [
    body('statusPayment').optional().notEmpty()
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    const orderId = req.params.orderId;
    const { statusPayment } = req.body;

    // Query untuk update data rekening
    connection.query(
        'UPDATE orderuser SET statusPayment = ? WHERE orderId = ?',
        [statusPayment, orderId],
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
                    message: 'Order not found or not owned by user',
                });
            }

            return res.status(200).json({
                status: true,
                message: 'Status Payment updated successfully',
            });
        }
    );
});


app.post('/upload', upload.single('fotoProduk'), (req, res) => {
    res.status(200).json({
        status: true,
        message: 'File uploaded successfully',
        filePath: `/uploads/${req.file.filename}`
    });
});

module.exports = router;
