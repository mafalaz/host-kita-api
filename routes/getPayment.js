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

router.get('/getPayment', authenticateToken, (req, res) => {
    const userId = req.params.userId;
    connection.query('SELECT paymentCustomerId, orderId, nama_umkm, email, namaProduk, totalPembayaran, buktiPembayaran, tanggalPembayaran FROM payment_customer WHERE userId = ?', [req.user.id], function (err, rows) {
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
                message: 'No Payment found'
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Data Payment Berhasil Ditampilkan',
            listPayment: rows
        });
    });
});

router.get('/detailPayment/:paymentCustomerId', authenticateToken, (req, res) => {
    const { paymentCustomerId } = req.params;
    connection.query('SELECT paymentCustomerId, userId, orderId, nama_umkm, email, namaProduk, totalPembayaran, buktiPembayaran, tanggalPembayaran FROM payment_customer WHERE userId = ? AND paymentCustomerId = ?', [req.user.id, paymentCustomerId], function (err, rows) {
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
                message: 'Data Payment Tidak Ditemukan',
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Detail Payment Berhasil Ditampilkan',
            paymentDetail: rows[0]
        });
    });
});


module.exports = router;