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
 * GET Foto Profil
 */
router.get('/getFotoProfil', authenticateToken, (req, res) => {
    connection.query('SELECT userId, fotoUmkm FROM fotoprofiluser WHERE userId = ?', [req.user.id], function (err, rows) {
        if (err) {
            return res.status(500).json({
                status: false,
                message: 'Internal Server Error',
            });
        }

        if (rows.length === 0) {
            return res.status(404).json({
                status: false,
                message: 'No User found',
            });
        }

        const userId = rows[0].userId
        const fotoUmkm = rows[0].fotoUmkm;

        return res.status(200).json({
            status: true,
            message: 'Foto profil berhasil ditampilkan',
            userId: userId,
            fotoUmkm: fotoUmkm
        });
    });
});

/**
 * DELETE Foto Profil
 */
router.delete('/deleteFotoProfil/:userId', authenticateToken, (req, res) => {
    const userId = req.params.userId;

    connection.query('SELECT fotoUmkm FROM fotoprofiluser WHERE userId = ?', [userId], function (err, rows) {
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

        connection.query('DELETE FROM fotoprofiluser WHERE userId = ?', [userId], function (err, result) {
            if (err) {
                return res.status(500).json({
                    status: false,
                    message: 'Internal Server Error',
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    status: false,
                    message: 'User not found',
                });
            }

            return res.status(200).json({
                status: true,
                message: 'Foto profil berhasil dihapus',
            });
        });
    });
});

module.exports = router;