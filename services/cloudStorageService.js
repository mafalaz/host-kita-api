const { v4: uuidv4 } = require('uuid');
const { bucket } = require('../utils/cloudStorageConfig');

const uploadFile = async (fileBuffer, mimeType) => {
  const fileName = uuidv4();
  const file = bucket.file(fileName);
  const stream = file.createWriteStream({
    metadata: {
      contentType: mimeType,
    },
  });

  return new Promise((resolve, reject) => {
    stream.on('error', (err) => {
      console.error(err);
      reject('Failed to upload image');
    });

    stream.on('finish', () => {
      resolve(`https://storage.googleapis.com/${bucket.name}/${file.name}`);
    });

    stream.end(fileBuffer);
  });
};

module.exports = {
  uploadFile,
};