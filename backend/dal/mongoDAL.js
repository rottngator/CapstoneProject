const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const bcrypt = require('bcrypt');

// Connection string
const mongoURI = 'mongodb+srv://lunruh:Abby2525!@cluster0.ntcrjfg.mongodb.net/SoundHub';
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

const conn = mongoose.connection;
let bucket;

// Initialize GridFSBucket
conn.once('open', () => {
    bucket = new GridFSBucket(conn.db, { bucketName: 'uploads' });
});

// User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

// User Model
const User = mongoose.model('User', userSchema);

// Export functions and GridFSBucket instance
module.exports = {
    User,
    bucket,
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

    // Function to get file by ID from GridFSBucket
    getFileById: async (fileId) => {
        return new Promise((resolve, reject) => {
            bucket.find({ _id: mongoose.Types.ObjectId(fileId) }).toArray((err, files) => {
                if (err) return reject(err);
                resolve(files[0]);
            });
        });
    },

    // Function to delete file from GridFSBucket
    deleteFileById: async (fileId) => {
        return bucket.delete(mongoose.Types.ObjectId(fileId));
    }
};
