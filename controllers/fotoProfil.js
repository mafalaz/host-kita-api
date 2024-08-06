const connection = require('../config/database');
const cloudStorageService = require('../services/cloudStorageService');

const fotoProfil = async (req, res) => {
  try {
    const userId = req.user.id;

    const photoBuffer = req.files && req.files.fotoUmkm ? req.files.fotoUmkm[0].buffer : null;

    if (!photoBuffer) {
      return res.status(400).json({ status: false, message: 'No image provided' });
    }

    const photoUrl = await cloudStorageService.uploadFile(photoBuffer, req.files.fotoUmkm[0].mimetype);

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

      const profilData = {
        userId: userId,
        nama_umkm: nama_umkm,
        email: email,
        fotoUmkm: photoUrl,
      };

      // Query untuk insert data order
      connection.query('INSERT INTO fotoprofiluser SET ?', profilData, function (err, result) {
        if (err) {
          return res.status(500).json({
            status: false,
            message: 'Internal Server Error',
          });
        } else {
          return res.status(201).json({
            status: true,
            message: 'Foto Profil placed successfully',
            fotoId: result.insertId
          });
        }
      });
    });
  } catch (error) {
    console.error('Error in fotoProfil:', error);
    res.status(500).json({ status: false, message: 'Internal server error' });
  }
};

module.exports = fotoProfil;
