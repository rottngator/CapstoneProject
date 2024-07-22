const express = require('express');
const session = require('express-session');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const AWS = require('aws-sdk');
const { DAL } = require('./dal/mongoDAL');

const app = express();
const port = 3000;
const JWT_SECRET = 'nepenthe';

// configuring AWS SDK
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'us-east-2'
});

const s3 = new AWS.S3();

// Set up multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Function to upload file to S3
const uploadFileToS3 = (file) => {
    const params = {
        Bucket: 'sound-hub-musis-storage',
        Key: `uploads/${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read' // or 'private'
    };

    return s3.upload(params).promise();
};

// CORS configuration
app.use(cors({
    origin: 'http://localhost:3001',
    credentials: true,
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    secret: 'the_night_does_not_belong_to_god',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
}));

// Register Route
app.post('/auth/register', async (req, res) => {
    const { username, email, password, passwordConfirmation } = req.body;
    if (password !== passwordConfirmation) {
        return res.status(400).json({ message: 'Passwords do not match' });
    }

    try {
        const existingUser = await DAL.getUserByUsername(username);
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new DAL.User({ username, email, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error', details: error.message });
    }
});

// Login Route
app.post('/auth/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await DAL.getUserByUsername(username);
        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
            res.cookie('token', token, { httpOnly: true }); 
            res.status(200).json({ message: 'Login successful' });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Middleware to protect routes
const authenticateToken = (req, res, next) => {
    const token = req.cookies.token || req.headers['authorization'];
    if (!token) return res.status(401).json({ message: 'Access denied' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = user;
        next();
    });
};

// Profile Route
app.get('/user/profile', authenticateToken, async (req, res) => {
    try {
        const user = await DAL.getUserById(req.user.userId);
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Logout Route
app.post('/auth/logout', (req, res) => {
    res.cookie('token', '', { maxAge: 1 }); // Expire the cookie
    res.status(200).json({ message: 'Logout successful' });
});

// File Upload Route
app.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const result = await uploadFileToS3(req.file);
        res.status(200).json({ fileUrl: result.Location });
    } catch (error) {
        console.error('File upload error:', error);
        res.status(500).json({ message: 'Failed to upload file' });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
