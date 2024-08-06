const express = require('express');
const addUserOrder = require('../controllers/addUserOrder');
const fotoProfil = require('../controllers/fotoProfil');
const payment = require('../controllers/payment')
const penjualan = require('./penjualan');
const authMiddleware = require('../middleware/authMiddleware');
const { multer } = require('../utils/multerConfig');
const { updateFotoProfil } = require('../controllers/updateFotoProfil');

const router = express.Router();

// Menggunakan multer.fields untuk menangani banyak file dengan field name berbeda
router.post('/addUserOrder', authMiddleware, multer.fields([{ name: 'fotoProduk' }, { name: 'buktiTransfer' }]), addUserOrder);
router.post('/fotoProfil', authMiddleware, multer.fields([{ name: 'fotoUmkm' }]), fotoProfil);
router.put('/fotoProfil/:userId', authMiddleware, multer.fields([{ name: 'fotoUmkm' }]), updateFotoProfil);
router.post('/payment', authMiddleware, multer.fields([{ name: 'buktiPembayaran' }]), payment);
module.exports = router;
