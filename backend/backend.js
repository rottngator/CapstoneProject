const express = require('express');
const session = require('express-session');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { createUser, getUserByUsername, getUserById, updateUserById, Track } = require('./dal/mongoDAL');
const { uploadImage, uploadMusic } = require('./multerUpload'); // Import the updated multer configuration
const app = express();
const port = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'nepenthe';

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
    secret: process.env.SESSION_SECRET || 'the_night_does_not_belong_to_god',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
}));

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
        const user = await createUser({ username, email, password: hashedPassword });
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
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
            res.status(200).json({ token });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Middleware to protect routes
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Profile Route
app.get('/user/profile', authenticateToken, async (req, res) => {
    try {
        const user = await getUserById(req.user.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update route for the profile
app.put('/user/profile', authenticateToken, uploadImage.fields([{ name: 'profilePicture' }, { name: 'banner' }]), async (req, res) => {
    try {
        const updates = req.body;
        if (req.files) {
            if (req.files.profilePicture) {
                updates.profilePicture = req.files.profilePicture[0].filename;
            }
            if (req.files.banner) {
                updates.banner = req.files.banner[0].filename;
            }
        }
        const updatedUser = await updateUserById(req.user.userId, updates);
        res.json({ message: 'Profile updated successfully', user: updatedUser });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Logout Route
app.post('/auth/logout', (req, res) => {
    res.cookie('token', '', { maxAge: 1 });
    res.status(200).json({ message: 'Logout successful' });
});

// Music File Upload Route
app.post('/upload', authenticateToken, uploadMusic.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
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
        res.status(500).json({ message: 'Internal server error' });
    });

    uploadStream.end(req.file.buffer);
});

// Route to serve files
app.get('/files/:id', (req, res) => {
    const fileId = new mongoose.Types.ObjectId(req.params.id);
    const downloadStream = bucket.openDownloadStream(fileId);

    downloadStream.on('data', (chunk) => {
        res.write(chunk);
    });

    downloadStream.on('end', () => {
        res.end();
    });

    downloadStream.on('error', (error) => {
        res.status(404).json({ message: 'No file found' });
    });
});

// Route to fetch uploaded files metadata
app.get('/uploads', async (req, res) => {
    try {
        const files = await bucket.find().toArray();
        res.status(200).json(files);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to delete files
app.delete('/files/:id', authenticateToken, async (req, res) => {
    try {
        await deleteFileById(req.params.id);
        res.status(200).json({ message: 'File deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to feature a track
app.put('/tracks/feature/:id', authenticateToken, async (req, res) => {
    const trackId = req.params.id;
    try {
        await Track.updateMany({}, { $set: { isFeatured: false } });
        const updatedTrack = await Track.findByIdAndUpdate(trackId, { isFeatured: true }, { new: true });
        if (updatedTrack) {
            res.status(200).json({ message: 'Track featured successfully' });
        } else {
            res.status(404).json({ message: 'Track not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

// Route to display featured track
app.get('/tracks/featured', async (req, res) => {
    try {
        const featuredTrack = await Track.findOne({ isFeatured: true }).sort({ createdAt: -1 });
        if (featuredTrack) {
            res.status(200).json(featuredTrack);
        } else {
            res.status(404).json({ message: 'No featured track found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
