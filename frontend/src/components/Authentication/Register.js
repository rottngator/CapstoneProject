import React, { useState } from 'react'
import axios from 'axios';
import './Register.css';

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
        <div className="register-page">
            <div className="register-form-container">
                <h1>Register</h1>
                <form className="register-form">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input type="email" id="email" name="email" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input type="text" id="username" name="username" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" name="password" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Password Again</label>
                        <input type="password" id="confirmPassword" name="confirmPassword" />
                    </div>
                    <button type="submit" className="register-button">Register</button>
                </form>
            </div>
            <div className="logo-container">
                <img src="/images/The Sound Hub Logo.png" alt="The Sound Hub" className="logo"/>
            </div>
        </div>
    );
};

export default Register;
