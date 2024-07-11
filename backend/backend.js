const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const { DAL } = require('./dal/mongoDAL');
const authRoute = require('./routes/auth');
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());

// Session middleware setup
app.use(session({
    secret: 'nepenthe', 
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: 'mongodb+srv://lunruh:Abby2525!@cluster0.ntcrjfg.mongodb.net/SoundHub' }),
    cookie: { secure: false }
}));

app.use('/api', authRoute);

// register route
app.post('/register', async (req, res) => {
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

// login route
app.post('/login', async (req, res) => {
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

// logout route
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.status(200).json({ message: 'Logout successful' });
    });
});

// get current user route
app.get('/me', async (req, res) => {
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

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
