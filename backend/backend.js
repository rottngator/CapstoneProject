const express = require('express');
const bodyParser = require('body-parser');
const { DAL } = require('./dal/mongoDAL');
const app = express();
const port = 3000;

app.use(bodyParser.json());

// registering
app.post('/api/register', async (req, res) => {
    try {
        const user = await DAL.createUser(req.body);
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ error: error. message });
    }
});


// user login
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await DAL.getUserByEmail(email);
        if (!user) {
            return res.status(400).json({ error: 'invalid email or password' });
        }
        res.status(200).json({ message: 'login successful', user });
    } catch (error) {
        res.status(500).json({ error: error.message });

    }
});

app.listen(port, () => {
    console.log(`server listening on port ${port}`);
});