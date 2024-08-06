const connection = require('../config/database');
const cloudStorageService = require('../services/cloudStorageService');

const updateFotoProfil = async (req, res) => {
  try {
    const userId = req.params.userId;

    const photoBuffer = req.files && req.files.fotoUmkm ? req.files.fotoUmkm[0].buffer : null;

    if (!photoBuffer) {
      return res.status(400).json({ status: false, message: 'No image provided' });
    }

    const photoUrl = await cloudStorageService.uploadFile(photoBuffer, req.files.fotoUmkm[0].mimetype);

    connection.query('UPDATE fotoprofiluser SET fotoUmkm = ? WHERE userId = ?', [photoUrl, userId], function (err, result) {
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
        message: 'Foto Profil updated successfully',
        fotoUrl: photoUrl
      });
    });
  } catch (error) {
    console.error('Error in updateFotoProfil:', error);
    res.status(500).json({ status: false, message: 'Internal server error' });
  }
};

module.exports = { updateFotoProfil };
