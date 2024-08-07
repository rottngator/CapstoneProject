const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const bcrypt = require('bcrypt');

// Connection string
const mongoURI = 'mongodb+srv://lunruh:Abby2525!@cluster0.ntcrjfg.mongodb.net/SoundHub';
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log('MongoDB connection established successfully.');
        // Initialize bucket after successful connection
        bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
            bucketName: 'tracks'
        });
    })
    .catch((err) => console.error('Failed to connect to MongoDB:', err));

// User schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: { type: String },
    banner: { type: String },
    about: { type: String },
    pronouns: { type: String },
    location: { type: String },
    label: { type: String },
    name: { type: String },
});

const User = mongoose.model('User', userSchema);

// Track schema
const trackSchema = new mongoose.Schema({
    title: { type: String, required: true },
    artist: { type: String, required: true },
    description: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isFeatured: { type: Boolean, default: false }
}, {
    timestamps: true
});

const Track = mongoose.model('Track', trackSchema);

const createUser = async ({ username, email, password }) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    return await user.save();
};

const getUserByUsername = async (username) => {
    return await User.findOne({ username });
};

const getUserById = async (id) => {
    return await User.findById(id);
};

const updateUserById = async (id, updates) => {
    return await User.findByIdAndUpdate(id, updates, { new: true });
};

module.exports = {
    createUser,
    getUserByUsername,
    getUserById,
    updateUserById,
    Track
};
