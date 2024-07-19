const express = require('express');
const session = require('express-session');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/userRoutes');

const app = express();
const port = 3000;

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
    saveUninitialized: false, // Change to false if you want to avoid saving uninitialized sessions
    cookie: { secure: false }, // Set to true if using HTTPS (later)
}));

// Routes
app.use('/user', userRoutes);
app.use('/api/auth', authRoutes);

// Start server
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
