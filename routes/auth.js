require('dotenv').config();
const express = require("express");
const jwt = require('jsonwebtoken');
const router = express.Router();
const bcrypt = require('bcrypt');

//import express validator
const { body, validationResult } = require('express-validator');

const JWT_SECRET = process.env.JWT_SECRET;


//import database
const connection = require('../config/database');

/**
 * AUTH LOGIN
 */
router.post('/login', [
    body('email').notEmpty().isEmail(),
    body('password').notEmpty()
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    const { email, password } = req.body;

    connection.query('SELECT * FROM register_user WHERE email = ?', [email], async function (err, rows) {
        if (err) {
            return res.status(500).json({
                status: false,
                message: 'Internal Server Error',
            });
        }

        if (rows.length === 0) {
            return res.status(401).json({
                status: false,
                message: 'Invalid email or password',
            });
        }

        const user = rows[0];

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({
                status: false,
                message: 'Invalid email or password',
            });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);

        return res.status(200).json({
            status: true,
            message: 'Login successful',
            user: {
                id: user.id,
                nama_umkm: user.nama_umkm,
                email: user.email,
                token: token,
            }
        });
    });
});

/**
 * AUTH REGISTER
 */
router.post('/register', [

    // Validasi
    body('nama_umkm').notEmpty(),
    body('email').notEmpty().isEmail(),
    body('password').notEmpty().isLength({ min: 6 })

], async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    const { nama_umkm, email, password } = req.body;

    // Mengecek apakah email sudah terdaftar
    connection.query('SELECT * FROM register_user WHERE email = ?', [email], async (err, rows) => {
        if (err) {
            return res.status(500).json({
                status: false,
                message: 'Internal Server Error',
            });
        }

        if (rows.length > 0) {
            return res.status(409).json({
                status: false,
                message: 'Email already registered',
            });
        }

        // Mengenkripsi password
        const saltRounds = 10;
        try {
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // Mendefinisikan formData
            let formData = {
                nama_umkm: nama_umkm,
                email: email,
                password: hashedPassword
            };

            // Query untuk insert data
            connection.query('INSERT INTO register_user SET ?', formData, function (err, rows) {
                if (err) {
                    return res.status(500).json({
                        status: false,
                        message: 'Internal Server Error',
                    });
                } else {
                    return res.status(201).json({
                        status: true,
                        message: 'Insert Data Successfully',
                        data: rows[0]
                    });
                }
            });
        } catch (error) {
            return res.status(500).json({
                status: false,
                message: 'Internal Server Error',
            });
        }
    });
});

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


/**
 * GET NAMA UMKM
 */
router.get('/getUmkm', authenticateToken, (req, res) => {
    connection.query('SELECT id, nama_umkm FROM register_user WHERE id = ?', [req.user.id], function (err, rows) {
        if (err) {
            return res.status(500).json({
                status: false,
                message: 'Internal Server Error',
            });
        }

        if (rows.length === 0) {
            return res.status(404).json({
                status: false,
                message: 'No UMKM found',
            });
        }

        const id = rows[0].id
        const nama_umkm = rows[0].nama_umkm;


        return res.status(200).json({
            status: true,
            message: 'Nama UMKM retrieved successfully',
            userId: id,
            nama_umkm: nama_umkm
        });
    });
});

// Endpoint untuk mengubah password
router.put('/ubahPassword/:userId', authenticateToken, [
    body('password').notEmpty().isLength({ min: 6 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    const userId = req.params.userId;
    const { password } = req.body;

    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        connection.query(
            'UPDATE register_user SET password = ? WHERE id = ?',
            [hashedPassword, userId],
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
                        message: 'Pengguna tidak ditemukan',
                    });
                }

                return res.status(200).json({
                    status: true,
                    message: 'Password berhasil diubah',
                });
            }
        );
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: 'Internal Server Error',
        });
    }
});

module.exports = router;