import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from './UserContext';
import './Register.css';
import { apiUrl } from '../../api';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [error, setError] = useState('');
    const { setUser } = useContext(UserContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== passwordConfirmation) {
            setError('Passwords do not match');
            return;
        }

        try {
            const response = await fetch(apiUrl('/auth/register'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password, passwordConfirmation }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Registration failed');
            }

            const { token, user } = await response.json();
            localStorage.setItem('token', token);
            setUser(user);
            navigate('/');
        } catch (error) {
            console.error('Registration error:', error);
            setError(error.message || 'Registration failed. Please try again.');
        }
    };

    return (
        <div className="register-page">
            <div className="logo-container">
                <img src="/images/The Sound Hub Logo.png" alt="The Sound Hub logo" className="logo" />
                <p>Independent sounds.<br /><span>Shared loudly.</span></p>
            </div>
            <div className="register-form-container">
                <p className="eyebrow">FIND YOUR PEOPLE</p>
                <h1>Create your account</h1>
                <form onSubmit={handleSubmit} className="register-form">
                    <div className="form-group">
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
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            autoComplete="new-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="passwordConfirmation">Confirm Password</label>
                        <input
                            id="passwordConfirmation"
                            type="password"
                            autoComplete="new-password"
                            value={passwordConfirmation}
                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                            placeholder="Confirm your password"
                            required
                        />
                    </div>
                    {error && <p className="error">{error}</p>}
                    <button type="submit" className="register-button">Register</button>
                </form>
                <p className="register-link">Already part of Sound Hub? <Link to="/login">Log in</Link></p>
            </div>
        </div>
    );
};

export default Register;
