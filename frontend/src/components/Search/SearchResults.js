import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './SearchResults.css';

const SearchResults = () => {
    const location = useLocation();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const query = new URLSearchParams(location.search).get('query');

    useEffect(() => {
        const fetchResults = async () => {
            setLoading(true);
            try {
                const response = await fetch(`http://localhost:3000/search?query=${encodeURIComponent(query)}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch results');
                }
                const data = await response.json();
                setResults(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        if (query) {
            fetchResults();
        }
    }, [query]);

    if (loading) {
        return <div className="loading-spinner">Loading...</div>;
    }

    if (error) {
        return <div className="error-message">Error: {error}</div>;
    }

    if (results.length === 0) {
        return <div className="no-results-message">No results found for "{query}"</div>;
    }

    return (
        <div className="search-results-container">
            <h2>Search Results for "{query}"</h2>
            <ul className="results-list">
                {results.map((result, index) => (
                    <li key={index} className="result-item">
                        <img src={result.avatarUrl || '/images/default-avatar.png'} alt={`${result.username}'s avatar`} className="result-avatar" />
                        <div className="result-info">
                            <h3 className="result-username">
                                {highlightText(result.username, query)}
                            </h3>
                            <p className="result-details">
                                {highlightText(result.bio, query)}
                            </p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

// Helper function to highlight search query in the result text
const highlightText = (text, query) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) => (
        part.toLowerCase() === query.toLowerCase() ? <span key={index} className="highlight">{part}</span> : part
    ));
};

export default SearchResults;
