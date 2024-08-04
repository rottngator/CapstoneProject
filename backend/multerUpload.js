const multer = require('multer');
const path = require('path');

// Define storage for the images
const imageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/images/'); // Adjust the path as necessary
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

// Define storage for the music files
const musicStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/music/'); // Adjust the path as necessary
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

// Filter the files to only accept images
const imageFileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
        return cb(null, true);
    }
    cb('Error: File upload only supports the following filetypes - ' + filetypes);
};

// Filter the files to only accept audio files
const audioFileFilter = (req, file, cb) => {
    const filetypes = /mp3|wav|flac/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
        return cb(null, true);
    }
    cb('Error: File upload only supports the following filetypes - ' + filetypes);
};

// Set up multer for images
const uploadImage = multer({
    storage: imageStorage,
    limits: { fileSize: 1024 * 1024 * 5 }, // limit is 5MB
    fileFilter: imageFileFilter
});

// Set up multer for music files
const uploadMusic = multer({
    storage: musicStorage,
    limits: { fileSize: 1024 * 1024 * 20 }, // limit is 20MB
    fileFilter: audioFileFilter
});

module.exports = {
    uploadImage,
    uploadMusic
};
