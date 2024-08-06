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
 * GET Payment
 */
router.get('/getAllPayment', authenticateToken, (req, res) => {
    connection.query('SELECT paymentCustomerId, orderId, nama_umkm, email, namaProduk, totalPembayaran, buktiPembayaran, tanggalPembayaran FROM payment_customer', function (err, rows) {
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
                message: 'No Payment found',
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Data Payment Berhasil Ditampilkan',
            listPayment: rows
        });
    });
});


module.exports = router;