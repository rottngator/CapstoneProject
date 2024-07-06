import React from 'react';
import './Login.css';
import { Link } from 'react-router-dom';

const Login = () => {
    return (
        <div className="login-page">
            <div className="login-form-container">
                <h1>Login</h1>
                <h2>Welcome Back!</h2>
                <form className="login-form">
                    <div className="form-group">
                        <label htmlFor="username">Username / Email</label>
                        <input type="text" id="username" name="username" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" name="password" />
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
