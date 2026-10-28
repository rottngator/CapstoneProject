import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { apiUrl } from '../../api';
import './SearchResults.css';

const SearchResults = () => {
    const location = useLocation();
    const query = new URLSearchParams(location.search).get('query') || '';
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(Boolean(query));
    const [error, setError] = useState('');

    useEffect(() => {
        if (!query.trim()) {
            setLoading(false);
            setResults([]);
            return undefined;
        }
        const controller = new AbortController();
        const loadResults = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await fetch(apiUrl(`/search?query=${encodeURIComponent(query)}`), { signal: controller.signal });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || 'Could not search artists.');
                setResults(data);
            } catch (searchError) {
                if (searchError.name !== 'AbortError') setError(searchError.message);
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        };
        loadResults();
        return () => controller.abort();
    }, [query]);

    return (
        <main className="page-shell search-results-container">
            <p className="eyebrow">FIND YOUR PEOPLE</p>
            <h1>{query ? <>Artists for “{query}”</> : 'Find an artist'}</h1>
            {!query && <p className="search-hint">Search the Sound Hub community by artist name using the search bar above.</p>}
            {loading ? <p className="status-message">Looking around the community…</p> : null}
            {error ? <p className="status-message error-message">{error}</p> : null}
            {!loading && !error && !results.length && <div className="empty-tracks"><span className="empty-icon">⌕</span><h2>No artists found yet.</h2><p>Try a different name or a broader search.</p></div>}
            {!loading && !error && results.length > 0 && (
                <ul className="results-list">
                    {results.map((result) => (
                        <li key={result.id} className="result-item surface-card">
                            {result.avatarUrl ? <img src={apiUrl(result.avatarUrl)} alt="" className="result-avatar" /> : <span className="result-avatar result-avatar-fallback">{result.username.slice(0, 1).toUpperCase()}</span>}
                            <div className="result-info"><h2>{result.username}</h2><p>{result.bio || 'Independent artist on Sound Hub.'}</p></div>
                            <span className="artist-badge">ARTIST</span>
                        </li>
                    ))}
                </ul>
            )}
        </main>
    );
};

export default SearchResults;
