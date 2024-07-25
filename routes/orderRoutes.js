const express = require('express');
const addUserOrder = require('../controllers/addUserOrder');
const authMiddleware = require('../middleware/authMiddleware');
const { multer } = require('../utils/multerConfig');

const router = express.Router();

// Menggunakan multer.fields untuk menangani banyak file dengan field name berbeda
router.post('/addUserOrder', authMiddleware, multer.fields([{ name: 'fotoProduk' }, { name: 'buktiTransfer' }]), addUserOrder);

module.exports = router;
