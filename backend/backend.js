const express = require('express');
const session = require('express-session');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const { createUser, getUserByUsername, getUserById, updateUserById, Track, bucket, Event } = require('./dal/mongoDAL');
const upload = require('./multerUpload');
const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'nepenthe';

const port = 3000;

// CORS configuration
app.use(cors({
    origin: 'http://localhost:3001',  // Your frontend origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Allowed methods
    credentials: true
}));

app.use(express.static('public'));

// Create directory if it doesn't exist
const createDirectory = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

const uploadDir = path.join(__dirname, '/public/uploads');
createDirectory(uploadDir);

// Serve static files for images and music
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

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
app.put('/user/profile', authenticateToken, upload.fields([{ name: 'profilePicture' }, { name: 'banner' }]), async (req, res) => {
    try {
        const updates = req.body;
        if (req.files) {
            if (req.files.profilePicture) {
                updates.profilePicture = `/uploads/${req.files.profilePicture[0].filename}`;
            }
            if (req.files.banner) {
                updates.banner = `/uploads/${req.files.banner[0].filename}`;
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
app.post('/upload/music', authenticateToken, upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    // Assuming `bucket` is defined somewhere else
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

// Route to serve music files
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


// Route to fetch recently uploaded files including music
app.get('/uploads', async (req, res) => {
    try {
        // Fetch recent images from 'uploads' directory
        const imageFiles = fs.readdirSync(uploadDir).map(file => ({
            filename: file,
            path: `/uploads/${file}`,
            type: 'image'
        }));

        // Fetch recent music files from GridFS
        const recentTracks = await bucket.find().sort({ uploadDate: -1 }).toArray();
        const musicFiles = recentTracks.map(track => ({
            _id: track._id,
            title: track.metadata.title,
            artist: track.metadata.artist,
            description: track.metadata.description,
            path: `/files/${track._id}`,
            type: 'audio'
        }));

        // Combine and send both image and music files
        const files = [...imageFiles, ...musicFiles];
        res.status(200).json(files);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});


app.post('/upload', upload.single('file'), (req, res) => {
    console.log('Uploaded file:', req.file);
    if (req.file) {
        res.json({ file: req.file });
    } else {
        res.status(400).send('No file uploaded.');
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
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Event Routes
// Create a new event
app.post('/events', authenticateToken, async (req, res) => {
    try {
        const { title, description, location, time, date } = req.body;

        // Validate input
        if (!title || !description || !location || !time || !date) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Create and save the event
        const event = new Event({
            title,
            description,
            location,
            time,
            date,
            user: req.user.userId // Associate event with the user if needed
        });

        await event.save();
        res.status(201).json(event);
    } catch (error) {
        console.error('Error creating event:', error); // Log the error for debugging
        res.status(500).json({ message: 'Internal server error', details: error.message });
    }
});


// Get all events
app.get('/events', async (req, res) => {
    try {
        const events = await Event.find().sort({ date: -1 }); // Sorting by date, latest first
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', details: error.message });
    }
});

// Get an event by ID
app.get('/events/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Convert id to ObjectId
        const objectId = mongoose.Types.ObjectId(id);

        const event = await Event.findById(objectId);
        if (!event) return res.status(404).send('Event not found');
        res.json(event);
    } catch (error) {
        console.error(error); // Log the error
        res.status(500).json({ message: 'Internal server error', details: error.message });
    }
});


// Update an event by ID
app.put('/events/:id', authenticateToken, async (req, res) => {
    try {
        const updates = req.body;
        const updatedEvent = await Event.findByIdAndUpdate(req.params.id, updates, { new: true });
        if (!updatedEvent) return res.status(404).json({ message: 'Event not found' });
        res.status(200).json(updatedEvent);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', details: error.message });
    }
});

// Delete an event by ID
app.delete('/events/:id', authenticateToken, async (req, res) => {
    try {
        const deletedEvent = await Event.findByIdAndDelete(req.params.id);
        if (!deletedEvent) return res.status(404).json({ message: 'Event not found' });
        res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', details: error.message });
    }
});

// Start server
app.listen(port, () => console.log(`Server running on port ${port}`));