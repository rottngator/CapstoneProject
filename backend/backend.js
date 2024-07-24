const express = require('express');
const session = require('express-session');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { createUser, getUserByUsername, getUserById, verifyPassword, getFileById, deleteFileById } = require('./dal/mongoDAL');
const { GridFSBucket } = require('mongodb');

const app = express();
const port = 3000;
const JWT_SECRET = 'nepenthe';

// Set up multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

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

// MongoDB connection
mongoose.connect('mongodb+srv://lunruh:Abby2525!@cluster0.ntcrjfg.mongodb.net/SoundHub', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB connected');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// Initialize GridFSBucket
const conn = mongoose.connection;
let bucket;

conn.once('open', () => {
    bucket = new GridFSBucket(conn.db, { bucketName: 'uploads' });
});

// Register Route
app.post('/auth/register', async (req, res) => {
    const { username, email, password, passwordConfirmation } = req.body;
    if (password !== passwordConfirmation) {
        return res.status(400).json({ message: 'Passwords do not match' });
    }

    try {
        const existingUser = await getUserByUsername(username);
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new createUser({ username, email, password: hashedPassword });
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
        const user = await getUserByUsername(username);
        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
            res.cookie('token', token, { httpOnly: true, secure: false, sameSite: 'lax' });
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
    const token = req.cookies.token || req.headers['authorization']?.split(' ')[1];
    console.log('Received Token:', token);
    if (!token) return res.status(401).json({ message: 'Access denied' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.error('Token verification failed:', err);
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Profile Route
app.get('/user/profile', authenticateToken, async (req, res) => {
    try {
        const user = await getUserById(req.user.userId);
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
    res.cookie('token', '', { maxAge: 1 });
    res.status(200).json({ message: 'Logout successful' });
});

// File Upload Route
app.post('/upload', authenticateToken, upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    if (!req.file.mimetype.startsWith('audio/')) {
        return res.status(400).json({ message: 'Only audio files are allowed' });
    }

    const uploadStream = bucket.openUploadStream(req.file.originalname, {
        metadata: {
            title: req.body.title,
            artist: req.body.artist,
            description: req.body.description,
            user: req.user.userId
        }
    });

    uploadStream.on('finish', (file) => {
        res.status(200).json({ fileUrl: `/files/${file._id}` });
    });

    uploadStream.on('error', (error) => {
        console.error('File upload error:', error);
        res.status(500).json({ message: 'Internal server error' });
    });

    uploadStream.end(req.file.buffer);
});

// Route to serve files
app.get('/files/:id', (req, res) => {
    const fileId = mongoose.Types.ObjectId(req.params.id);
    const downloadStream = bucket.openDownloadStream(fileId);

    downloadStream.on('data', (chunk) => {
        res.write(chunk);
    });

    downloadStream.on('end', () => {
        res.end();
    });

    downloadStream.on('error', (error) => {
        console.error('File download error:', error);
        res.status(404).json({ message: 'No file found' });
    });
});

// Route to delete files
app.delete('/files/:id', authenticateToken, async (req, res) => {
    try {
        await deleteFileById(req.params.id);
        res.status(200).json({ message: 'File deleted successfully' });
    } catch (error) {
        console.error('File deletion error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Refresh Token Route
app.post('/auth/refresh', authenticateToken, (req, res) => {
    const userId = req.user.userId;
    const newToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });
    res.cookie('token', newToken, { httpOnly: true, secure: false, sameSite: 'lax' });
    res.status(200).json({ message: 'Token refreshed' });
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
