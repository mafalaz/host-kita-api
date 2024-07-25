const { Storage } = require('@google-cloud/storage');
const dotenv = require('dotenv');

dotenv.config();

const storage = new Storage({
  projectId: process.env.GOOGLE_PROJECT_ID,
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  },
});

const bucket = storage.bucket(process.env.GCLOUD_BUCKET_NAME);

module.exports = {
  bucket,
};