import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../Authentication/UserContext';
import './NavBar.css';

const NavBar = () => {
    const { user, setUser } = useContext(UserContext);
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
        try {
            await fetch('http://localhost:3000/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });
            localStorage.removeItem('token');
            setUser(null);
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const fetchSuggestions = async (query) => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:3000/user/search?query=${encodeURIComponent(query)}`);
            const data = await response.json();
            setSuggestions(data);
            setLoading(false);
        } catch (error) {
            console.error('Suggestions error:', error);
            setLoading(false);
        }
    };
    

    const handleSearchInputChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.trim()) {
            fetchSuggestions(query);
        } else {
            setSuggestions([]);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim() === '') return;
        navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
    };

    const clearSearch = () => {
        setSearchQuery('');
        setSuggestions([]);
    };

    return (
        <nav className="navbar">
            <a href="/" className="logo">
                <img src="/images/The Sound Hub Logo.png" alt="The Sound Hub Logo" />
            </a>
            <form className="search-bar" onSubmit={handleSearch}>
                <input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                />
                <button type="submit">Search</button>
                {searchQuery && <button type="button" onClick={clearSearch}>Clear</button>}
                {loading && <div className="loading-spinner">Loading...</div>}
                {suggestions.length > 0 && (
                    <ul className="suggestions">
                        {suggestions.map((suggestion, index) => (
                            <li key={index} onClick={() => setSearchQuery(suggestion)}>
                                {suggestion}
                            </li>
                        ))}
                    </ul>
                )}
            </form>
            <div className="user-section">
                {user ? (
                    <div className="dropdown">
                        <button className="welcome-button">
                            Welcome, {user.username}!
                        </button>
                        <div className="dropdown-content">
                            <button onClick={() => navigate('/profile')}>Profile</button>
                            <button onClick={() => navigate('/edit')}>Edit Profile</button>
                            <button onClick={() => navigate('/calendar')}>Calendar</button>
                            <button onClick={() => navigate('/feedback')}>Feedback</button>
                            <button onClick={() => navigate('/chat')}>Chat</button>
                            <button onClick={handleLogout}>Logout</button>
                        </div>
                    </div>
                ) : (
                    <button className="login-button" onClick={() => navigate('/login')}>Login</button>
                )}
            </div>
        </nav>
    );
};

export default NavBar;
