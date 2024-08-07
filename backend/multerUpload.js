const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();

const uploadImage = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // Limit image file size to 10 MB
    },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only images are allowed!'));
        }
    }
});

const uploadMusic = multer({
    storage,
    limits: {
        fileSize: 100 * 1024 * 1024 // Limit music file size to 100 MB
    },
    fileFilter: (req, file, cb) => {
        const filetypes = /mp3|wav|flac/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only music files are allowed!'));
        }
    }
});

module.exports = { uploadImage, uploadMusic };
