const multer = require('multer');
const path = require('path');

// Configuration for image storage using the local filesystem
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/images'); // Ensure this path exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// Multer configuration for image uploads
const uploadImage = multer({
  storage: imageStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB limit for images
  }
});

module.exports = { uploadImage };


const multer = require('multer');
const path = require('path');
const { GridFSStorage } = require('multer-gridfs-storage');

// GridFS Storage for music files
const storage = new GridFSStorage({
  url: 'mongodb+srv://your_mongodb_uri',
  file: (req, file) => {
    return {
      bucketName: 'tracks', // Bucket name used in mongoDAL
      filename: Date.now() + path.extname(file.originalname)
    };
  },
  options: { useUnifiedTopology: true }
});

// Multer configuration for music file uploads
const uploadMusic = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50 MB limit for music files
  }
});

module.exports = { uploadMusic };
