import React, { useState } from 'react'
import axios from 'axios';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post('/api/register', { username, email, password });
            setMessage('Registration successful');
        } catch (error) {
            setMessage('Registration failed: ' + error.response.data.error);
        }
    }
    return (
        <div>
            <h2>Register</h2>

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Username:</label>
                    <input type='text' value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>

                <div>
                    <label>Email:</label>
                    <input type='email' value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>

                <div>
                    <label>Password:</label>
                    <input type='password' value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <button type='submit'>Register</button>
            </form>
            <p>{message}</p>
        </div>
    )
}

export default Register
