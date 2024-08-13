const connection = require('../config/database');
const cloudStorageService = require('../services/cloudStorageService');

const addUserOrder = async (req, res) => {
  try {
    const userId = req.user.id;

    const {namaProduk, hargaProduk, beratProduk, panjangProduk, lebarProduk, tinggiProduk, jumlahProduk, stockProduk, tanggalLive, deskripsi, biayaPacking, biayaHost, biayaPlatform, totalPayment} = req.body;

    const photoBuffer = req.files && req.files.fotoProduk ? req.files.fotoProduk[0].buffer : null;
    const buktiTransferBuffer = req.files && req.files.buktiTransfer ? req.files.buktiTransfer[0].buffer : null;

    if (!photoBuffer) {
      return res.status(400).json({ status: false, message: 'No image provided' });
    }

    if (!buktiTransferBuffer) {
      return res.status(400).json({ status: false, message: 'No transfer proof provided' });
    }

    const photoUrl = await cloudStorageService.uploadFile(photoBuffer, req.files.fotoProduk[0].mimetype);
    const buktiTransferUrl = await cloudStorageService.uploadFile(buktiTransferBuffer, req.files.buktiTransfer[0].mimetype);

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
        stockProduk: stockProduk,
        fotoProduk: photoUrl,
        tanggalLive: tanggalLive,
        deskripsi: deskripsi,
        biayaPacking: biayaPacking,
        biayaHost: biayaHost,
        biayaPlatform: biayaPlatform,
        totalPayment: totalPayment,
        buktiTransfer: buktiTransferUrl
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
  } catch (error) {
    console.error('Error in addUserOrder:', error);
    res.status(500).json({ status: false, message: 'Internal server error' });
  }
};

module.exports = addUserOrder;
