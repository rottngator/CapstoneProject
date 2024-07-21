const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// user schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

// current model/s
const User = mongoose.model('User', userSchema);

// connection string
mongoose.connect('mongodb+srv://lunruh:Abby2525!@cluster0.ntcrjfg.mongodb.net/SoundHub', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

    // the exports
    exports.DAL = {
        User,
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
        }
};
