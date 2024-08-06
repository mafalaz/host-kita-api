const connection = require('../config/database');
const cloudStorageService = require('../services/cloudStorageService');

const payment = async (req, res) => {
  try {
    const userId = req.user.id;

    const {orderId, namaProduk, totalPembayaran, tanggalPembayaran} = req.body;

    const buktiTransferBuffer = req.files && req.files.buktiPembayaran ? req.files.buktiPembayaran[0].buffer : null;

    if (!buktiTransferBuffer) {
      return res.status(400).json({ status: false, message: 'No transfer proof provided' });
    }

    const buktiTransferUrl = await cloudStorageService.uploadFile(buktiTransferBuffer, req.files.buktiPembayaran[0].mimetype);

    // Query untuk mendapatkan informasi user
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

      const paymentData = {
        userId: userId,
        orderId: orderId,
        nama_umkm: nama_umkm,
        email: email,
        namaProduk: namaProduk,
        totalPembayaran: totalPembayaran,
        buktiPembayaran: buktiTransferUrl,
        tanggalPembayaran: tanggalPembayaran
      };

      // Query untuk insert data order
      connection.query('INSERT INTO payment_customer SET ?', paymentData, function (err, result) {
        if (err) {
          return res.status(500).json({
            status: false,
            message: 'Internal Server Error',
          });
        } else {
          return res.status(201).json({
            status: true,
            message: 'Payment placed successfully',
            paymentCustomerId: result.insertId
          });
        }
      });
    });
  } catch (error) {
    console.error('Error in Payment:', error);
    res.status(500).json({ status: false, message: 'Internal server error' });
  }
};

module.exports = payment;
