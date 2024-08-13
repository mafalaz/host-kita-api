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
        console.error('Error querying register_user:', err);
        return res.status(500).json({ status: false, message: 'Internal Server Error' });
      }

      if (rows.length === 0) {
        console.error('User not found');
        return res.status(404).json({ status: false, message: 'User not found' });
      }

      const { nama_umkm, email } = rows[0];

      const profilData = {
        nama_umkm: nama_umkm,
        email: email,
        fotoUmkm: photoUrl,
      };

      // Query untuk mengecek apakah userId sudah ada di fotoprofiluser
      connection.query('SELECT * FROM fotoprofiluser WHERE userId = ?', [userId], function (err, result) {
        if (err) {
          console.error('Error querying fotoprofiluser:', err);
          return res.status(500).json({ status: false, message: 'Internal Server Error' });
        }

        if (result.length > 0) {
          // Jika userId sudah ada, update data
          connection.query('UPDATE fotoprofiluser SET ? WHERE userId = ?', [profilData, userId], function (err, updateResult) {
            if (err) {
              console.error('Error updating fotoprofiluser:', err);
              return res.status(500).json({ status: false, message: 'Internal Server Error' });
            }

            console.log('Foto Profil updated successfully');
            return res.status(200).json({
              status: true,
              message: 'Foto Profil updated successfully',
            });
          });
        } else {
          // Jika userId belum ada, insert data baru
          const newProfilData = {
            userId: userId,
            ...profilData,
          };

          connection.query('INSERT INTO fotoprofiluser SET ?', newProfilData, function (err, insertResult) {
            if (err) {
              console.error('Error inserting into fotoprofiluser:', err);
              return res.status(500).json({ status: false, message: 'Internal Server Error' });
            }

            console.log('Foto Profil created successfully');
            return res.status(201).json({
              status: true,
              message: 'Foto Profil created successfully',
              fotoId: insertResult.insertId,
            });
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

