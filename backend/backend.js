const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { DAL } = require('./dal/mongoDAL');
const app = express();
const port = 3000;

const jwtSecret = 'nepenthe';

app.use(bodyParser.json());

// Middleware to authenticate JWT
const authenticateJWT = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    jwt.verify(token, jwtSecret, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        req.user = user;
        next();
    });
};

// Registering
app.post('/api/register', async (req, res) => {
    try {
        const user = await DAL.createUser(req.body);
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// User login
app.post('/api/login', async (req, res) => {
    try {
        const { credential, password } = req.body;
        let user = await DAL.getUserByEmail(credential);
        if (!user) {
            user = await DAL.getUserByUsername(credential);
        }

        if (!user) {
            return res.status(400).json({ error: 'Invalid username/email or password' });
        }

        const isPasswordValid = await DAL.verifyPassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Invalid username/email or password' });
        }

        const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '1h' });
        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Protected route example
app.get('/api/protected', authenticateJWT, (req, res) => {
    res.status(200).json({ message: 'This is a protected route' });
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
