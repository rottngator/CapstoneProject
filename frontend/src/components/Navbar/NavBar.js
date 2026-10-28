import React, { useContext, useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { UserContext } from '../Authentication/UserContext';
import { apiUrl } from '../../api';
import './NavBar.css';

const NavBar = () => {
    const { user, setUser } = useContext(UserContext);
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const query = searchQuery.trim();
        if (!query) {
            setSuggestions([]);
            return undefined;
        }
        const controller = new AbortController();
        const timeout = setTimeout(async () => {
            try {
                const response = await fetch(
                    apiUrl(`/user/search?query=${encodeURIComponent(query)}`),
                    { signal: controller.signal }
                );
                if (!response.ok) throw new Error('Could not load suggestions');
                setSuggestions(await response.json());
            } catch (error) {
                if (error.name !== 'AbortError') console.error('Suggestions error:', error);
            }
        }, 180);
        return () => {
            clearTimeout(timeout);
            controller.abort();
        };
    }, [searchQuery]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setMenuOpen(false);
        navigate('/');
    };

    const handleSearch = (event) => {
        event.preventDefault();
        if (!searchQuery.trim()) return;
        navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
        setSuggestions([]);
    };

    return (
        <header className="site-header">
            <Link to="/" className="brand" aria-label="Sound Hub home">
                <img src="/images/The Sound Hub Logo.png" alt="" className="brand-mark" />
                <span>sound<span className="brand-accent">hub</span></span>
            </Link>
            <form className="search-bar" onSubmit={handleSearch} role="search">
                <span className="search-icon" aria-hidden="true">⌕</span>
                <input
                    type="search"
                    placeholder="Search artists by name"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    aria-label="Search artists by name"
                />
                <button className="search-submit" type="submit">Search</button>
                {suggestions.length > 0 && (
                    <ul className="suggestions">
                        {suggestions.map((suggestion) => (
                            <li key={suggestion}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchQuery(suggestion);
                                        navigate(`/search?query=${encodeURIComponent(suggestion)}`);
                                        setSuggestions([]);
                                    }}
                                >
                                    <span className="suggestion-avatar">{suggestion.slice(0, 1).toUpperCase()}</span>
                                    {suggestion}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </form>
            <nav className="primary-nav" aria-label="Main navigation">
                <NavLink to="/" end>Discover</NavLink>
                <NavLink to="/calendar">Events</NavLink>
                {user && <NavLink to="/chat">Community</NavLink>}
                <NavLink to="/about">About</NavLink>
            </nav>
            <div className="account-area">
                {user ? (
                    <div className={`account-menu ${menuOpen ? 'is-open' : ''}`}>
                        <button
                            type="button"
                            className="account-trigger"
                            onClick={() => setMenuOpen((open) => !open)}
                            aria-expanded={menuOpen}
                        >
                            <span className="account-avatar">{(user.username || 'S').slice(0, 1).toUpperCase()}</span>
                            <span className="account-name">{user.username}</span>
                            <span aria-hidden="true">⌄</span>
                        </button>
                        <div className="account-dropdown">
                            <Link to="/profile" onClick={() => setMenuOpen(false)}>My profile</Link>
                            <Link to="/edit" onClick={() => setMenuOpen(false)}>Edit profile</Link>
                            <Link to="/upload" onClick={() => setMenuOpen(false)}>Upload music</Link>
                            <Link to="/chat" onClick={() => setMenuOpen(false)}>Community chat</Link>
                            <Link to="/feedback" onClick={() => setMenuOpen(false)}>Send feedback</Link>
                            <button type="button" onClick={handleLogout}>Sign out</button>
                        </div>
                    </div>
                ) : (
                    <Link to="/login" className="button button-outline">Sign in</Link>
                )}
            </div>
        </header>
    );
};

export default NavBar;
