const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const mongoURI = 'mongodb+srv://lunruh:Abby2525!@cluster0.ntcrjfg.mongodb.net/SoundHub';
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log('MongoDB connection established successfully.');
        bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
            bucketName: 'tracks'
        });
    })
    .catch((err) => console.error('Failed to connect to MongoDB:', err));

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

const trackSchema = new mongoose.Schema({
    title: { type: String, required: true },
    artist: { type: String, required: true },
    description: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    isFeatured: { type: Boolean, default: false },
});

const Track = mongoose.model('Track', trackSchema);

const createUser = async (userData) => {
    const user = new User(userData);
    await user.save();
    return user;
};

const getUserByUsername = async (username) => {
    return User.findOne({ username });
};

const getUserById = async (id) => {
    return User.findById(id);
};

const updateUserById = async (id, updates) => {
    const user = await User.findById(id);
    if (!user) {
        throw new Error('User not found');
    }
    Object.assign(user, updates);
    await user.save();
    return user;
};

const deleteFileById = async (fileId) => {
    await bucket.delete(new mongoose.Types.ObjectId(fileId));
};

module.exports = { createUser, getUserByUsername, getUserById, updateUserById, deleteFileById, Track };
