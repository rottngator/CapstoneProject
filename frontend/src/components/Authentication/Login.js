import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from './UserContext';
import './Login.css';
import { apiUrl } from '../../api';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { setUser } = useContext(UserContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(apiUrl('/auth/login'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Login failed');
            }

            const { token, user } = await response.json();
            localStorage.setItem('token', token);
            setUser(user);
            navigate('/');
        } catch (error) {
            console.error('Login error:', error);
            setError(error.message || 'Login failed. Please try again.');
        }
    };

    return (
        <div className="login-page">
            <div className="logo-container">
                <img src="/images/The Sound Hub Logo.png" alt="The Sound Hub logo" className="logo" />
                <p>Independent sounds.<br /><span>Shared loudly.</span></p>
            </div>
            <div className="login-container">
                <p className="eyebrow">WELCOME BACK</p>
                <h1>Log in</h1>
                <h2>Pick up where you left off.</h2>
                <form onSubmit={handleSubmit} className="form">
                    <div className="input-group">
                        <label htmlFor="username">Username</label>
                        <input
                            id="username"
                            type="text"
                            autoComplete="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                    {error && <p className="error">{error}</p>}
                    <button type="submit" className="login-button">Login</button>
                </form>
                <p className="register-link">New to Sound Hub? <Link to="/register">Create an account</Link></p>
            </div>
        </div>
    );
};

export default Login;
