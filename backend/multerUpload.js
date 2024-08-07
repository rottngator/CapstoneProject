const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();

const uploadImage = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png/;
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = fileTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb('Error: Images only!');
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5 MB limit
});

const uploadMusic = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const fileTypes = /mp3|mpeg/;
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = fileTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb('Error: Audio files only!');
        }
    },
    limits: { fileSize: 100 * 1024 * 1024 } // 100 MB limit
});

module.exports = { uploadImage, uploadMusic };
