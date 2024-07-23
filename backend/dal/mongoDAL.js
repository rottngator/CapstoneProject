const mongoose = require('mongoose');
const Grid = require('gridfs-stream');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Connection string
const mongoURI = 'mongodb+srv://lunruh:Abby2525!@cluster0.ntcrjfg.mongodb.net/SoundHub';
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

const conn = mongoose.connection;
let gfs;

// Initialize GridFS
conn.once('open', () => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
});

// User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

// User Model
const User = mongoose.model('User', userSchema);

// Export functions and GridFS instance
module.exports = {
    User,
    gfs,
    createUser: async (userData) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);
        const user = new User({ ...userData, password: hashedPassword });
        return await user.save();
    },

    getUserByEmail: async (email) => {
        return await User.findOne({ email }).exec();
    },

    getUserByUsername: async (username) => {
        return await User.findOne({ username }).exec();
    },

    getUserById: async (userId) => {
        return await User.findById(userId).exec();
    },

    verifyPassword: async (inputPassword, storedPassword) => {
        return await bcrypt.compare(inputPassword, storedPassword);
    },

    // Function to get file by ID from GridFS
    getFileById: async (fileId) => {
        return gfs.files.findOne({ _id: mongoose.Types.ObjectId(fileId) }).exec();
    },

    // Function to delete file from GridFS
    deleteFileById: async (fileId) => {
        return gfs.remove({ _id: mongoose.Types.ObjectId(fileId), root: 'uploads' }).exec();
    }
};
