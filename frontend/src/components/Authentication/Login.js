import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../api/api';
import './Login.css';

const Login = () => {
    const [credential, setCredential] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            await login(credential, password);
            navigate('/'); // Redirect to home or dashboard after login
        } catch (error) {
            alert('Login failed. Please check your credentials.');
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <h1>Login</h1>
                <h2>Welcome Back!</h2>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="credential">Username / Email</label>
                        <input
                            type="text"
                            id="credential"
                            placeholder="Username / Email"
                            value={credential}
                            onChange={(e) => setCredential(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="forgot-password">
                        <a href="/reset">Forgot password? <span>Reset</span></a>
                    </div>
                    <button type="submit" className="login-button">Login</button>
                </form>
                <div className="register-link">
                    <p>Never signed up before?</p>
                    <a href="/register" className="register-button">Register</a>
                </div>
            </div>
            <div className="logo-container">
                <img src="/images/The Sound Hub Logo.png" alt="The Sound Hub Logo" className="logo"/>
            </div>
        </div>
    );
};

export default Login;
