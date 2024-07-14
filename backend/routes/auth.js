const express = require('express');
const { DAL } = require('../dal/mongoDAL'); // Adjust the path as needed
const router = express.Router();

const isAuthenticated = (req, res, next) => {
    if (req.session.userId) {
        return next();
    }
    res.status(401).json({ error: 'Unauthorized' });
};

// Register route
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const existingEmail = await DAL.getUserByEmail(email);
        if (existingEmail) {
            return res.status(400).json({ error: 'Email already taken' });
        }
        
        const existingUsername = await DAL.getUserByUsername(username);
        if (existingUsername) {
            return res.status(400).json({ error: 'Username already taken' });
        }
        
        const user = await DAL.createUser({ username, email, password });
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await DAL.getUserByEmail(email);
        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const isPasswordValid = await DAL.verifyPassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        req.session.userId = user._id;
        res.status(200).json({ message: 'Login successful', user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Logout route
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.status(200).json({ message: 'Logout successful' });
    });
});

// Get current user route
router.get('/me', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        const user = await DAL.getUserById(req.session.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router, isAuthenticated;
