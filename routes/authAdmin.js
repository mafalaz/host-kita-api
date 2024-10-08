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

    connection.query('SELECT * FROM register_admin WHERE email = ?', [email], async function (err, rows) {
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
                nama_admin: user.nama_admin,
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
    body('nama_admin').notEmpty(),
    body('email').notEmpty().isEmail(),
    body('password').notEmpty().isLength({ min: 6 })

], async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    const { nama_admin, email, password } = req.body;

    // Mengecek apakah email sudah terdaftar
    connection.query('SELECT * FROM register_admin WHERE email = ?', [email], async (err, rows) => {
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
                nama_admin: nama_admin,
                email: email,
                password: hashedPassword
            };

            // Query untuk insert data
            connection.query('INSERT INTO register_admin SET ?', formData, function (err, rows) {
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
 * GET NAMA Admin
 */
router.get('/nameAdmin', authenticateToken, (req, res) => {
    connection.query('SELECT nama_admin FROM register_admin WHERE id = ?', [req.user.id], function (err, rows) {
        if (err) {
            return res.status(500).json({
                status: false,
                message: 'Internal Server Error',
            });
        }

        if (rows.length === 0) {
            return res.status(404).json({
                status: false,
                message: 'No Admin found',
            });
        }

        const nama_admin = rows[0].nama_admin;

        return res.status(200).json({
            status: true,
            message: 'Nama Admin berhasil ditampilkan',
            nama_admin: nama_admin
        });
    });
});

module.exports = router;