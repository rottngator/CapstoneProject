const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');
const session = require('express-session'); 
const { DAL } = require('./dal/mongoDAL');
const app = express();
const port = 3000;

const jwtSecret = 'nepenthe';

app.use(cors({
    origin: 'http://localhost:3001', 
    credentials: true,
}));

app.use(bodyParser.json());
app.use(session({
    secret: 'your-session-secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS (do eventually i think)
}));

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

// Register route
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const existingEmail = await DAL.getUserByEmail(email);
        if (existingEmail) {
            return res.status(400).json({ error: 'Email already taken' });
        }

        const existingUsername = await DAL.getUserByUsername(username);
        if (existingUsername) {
            return res.status(400).json({ error: 'Username already taken' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await DAL.createUser({ username, email, password: hashedPassword });
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login route
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

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Invalid username/email or password' });
        }

        const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '1h' });
        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.get('/api/protected', authenticateJWT, (req, res) => {
    res.status(200).json({ message: 'This is a protected route', user: req.user });
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

