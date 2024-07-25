const multer = require('multer');

const storage = multer.memoryStorage();
const multerConfig = multer({ storage });

module.exports = {
  storage,
  multer: multerConfig,
};