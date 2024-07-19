const express = require('express');
const router = express.Router();
const User = require('../dal/mongoDAL'); 
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'nepenthe';

// Middleware to check authentication
const authenticate = async (req, res, next) => {
    const token = req.cookies?.token; // Use optional chaining to avoid errors if req.cookies is undefined
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

// Get user profile
router.get('/profile', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
