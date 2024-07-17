import React, { useState } from 'react';
import './Login.css';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleSubmit = (e) => {
        e.preventDefault();
        // mock logic
        if (username && password) {
            login({ username });
            const redirectTo = location.state?.from?.pathname || '/';
            navigate(redirectTo);
        }
    };

    return (
        <div className="login-page">
            <div className="login-form-container">
                <h1>Login</h1>
                <h2>Welcome Back!</h2>
                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username / Email</label>
                        <input 
                            type="text" 
                            id="username" 
                            name="username" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)} 
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input 
                            type="password" 
                            id="password" 
                            name="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)} 
                        />
                    </div>
                    <div className="form-group">
                        <Link to="/reset" className="reset-link">Forgot password? Reset</Link>
                    </div>
                    <button type="submit" className="login-button">Login</button>
                    <div className="register-link">
                        Never signed up before? <Link to="/register">Register</Link>
                    </div>
                </form>
            </div>
            <div className="logo-container">
                <img src="/images/The Sound Hub Logo.png" alt="The Sound Hub" className="logo"/>
            </div>
        </div>
    );
};

export default Login;
