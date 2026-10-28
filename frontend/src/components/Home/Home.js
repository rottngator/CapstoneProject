import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiUrl } from '../../api';
import { UserContext } from '../Authentication/UserContext';
import './Home.css';

const Home = () => {
    const { user } = useContext(UserContext);
    const [tracks, setTracks] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        const loadHome = async () => {
            setLoading(true);
            setError('');
            try {
                const [tracksResponse, eventsResponse] = await Promise.all([
                    fetch(apiUrl('/tracks/recent-tracks')),
                    fetch(apiUrl('/events')),
                ]);
                if (!tracksResponse.ok) throw new Error('Could not load recent tracks.');
                if (!eventsResponse.ok) throw new Error('Could not load community events.');
                setTracks(await tracksResponse.json());
                setEvents(await eventsResponse.json());
            } catch (loadError) {
                setError(loadError.message === 'Failed to fetch'
                    ? 'We could not reach Sound Hub. Check that the music library is online, then try again.'
                    : loadError.message);
            } finally {
                setLoading(false);
            }
        };
        loadHome();
    }, [retryCount]);

    const featuredTrack = tracks.find((track) => track.isFeatured) || tracks[0];

    return (
        <main className="home-page page-shell">
            <section className="welcome-row">
                <div>
                    <p className="eyebrow">INDEPENDENT SOUNDS, SHARED LOUDLY</p>
                    <h1>Find your next favorite sound.</h1>
                    <p className="welcome-copy">Independent artists. Fresh perspectives. A community that listens.</p>
                </div>
                <Link to={user ? '/upload' : '/register'} className="button button-primary">＋ <span>{user ? 'Share your music' : 'Join the community'}</span></Link>
            </section>

            <nav className="discovery-shortcuts" aria-label="Explore Sound Hub">
                <a className="discovery-shortcut is-current" href="#recent-releases">New releases <span aria-hidden="true">↓</span></a>
                <Link className="discovery-shortcut" to="/register">Join the community <span aria-hidden="true">↗</span></Link>
                <Link className="discovery-shortcut" to="/calendar">Community events <span aria-hidden="true">↗</span></Link>
            </nav>

            {featuredTrack ? (
                <section className="featured-release">
                    <div className="featured-copy">
                        <p className="eyebrow"><span aria-hidden="true">✦</span> &nbsp; FEATURED RELEASE</p>
                        <h2>{featuredTrack.title}</h2>
                        <p className="featured-artist">{featuredTrack.artist}</p>
                        <p className="featured-description">{featuredTrack.description || 'A new sound from the Sound Hub community.'}</p>
                        <audio controls preload="none" aria-label={`Play featured track ${featuredTrack.title}`}>
                            <source src={apiUrl(featuredTrack.path)} />
                            Your browser does not support audio playback.
                        </audio>
                    </div>
                    <div className={`featured-art ${featuredTrack.coverImageUrl ? 'has-cover' : ''}`} aria-hidden="true">
                        {featuredTrack.coverImageUrl ? (
                            <img src={apiUrl(featuredTrack.coverImageUrl)} alt="" />
                        ) : (
                            <img src="/images/The Sound Hub Logo.png" alt="" />
                        )}
                    </div>
                    <div className="featured-index"><span>01</span><span> / FEATURED</span></div>
                </section>
            ) : (
                <section className="featured-release featured-empty">
                    <div className="featured-copy">
                        <p className="eyebrow">THE FIRST TRACK IS YOURS</p>
                        <h2>Your stage<br />is waiting.</h2>
                        <p className="featured-description">Be the first to share a new sound with the community.</p>
                        <Link className="button button-light" to={user ? '/upload' : '/register'}>{user ? 'Upload your first track' : 'Join to share your music'}</Link>
                    </div>
                    <div className="featured-art" aria-hidden="true"><img src="/images/The Sound Hub Logo.png" alt="" /></div>
                </section>
            )}

            <div className="discovery-grid">
                <section className="recent-section" id="recent-releases">
                    <div className="section-heading">
                        <div>
                            <p className="eyebrow">OUT IN THE WORLD</p>
                            <h2>Fresh from the community</h2>
                        </div>
                        <span className="section-note">Fresh finds from the community</span>
                    </div>
                    {loading ? (
                        <p className="status-message">Tuning in to the latest releases…</p>
                    ) : error ? (
                        <div className="home-load-error" role="alert">
                            <span aria-hidden="true">!</span>
                            <div><strong>We hit a quiet spot.</strong><p>{error}</p><button className="button button-outline" type="button" onClick={() => setRetryCount((count) => count + 1)}>Try again</button></div>
                        </div>
                    ) : tracks.length === 0 ? (
                        <div className="empty-tracks">
                            <span className="empty-icon">♫</span>
                            <h3>It’s quiet in here. For now.</h3>
                            <p>Upload a track and make this community your first audience.</p>
                            <Link to={user ? '/upload' : '/register'} className="text-link">{user ? 'Share your first release →' : 'Join Sound Hub to upload →'}</Link>
                        </div>
                    ) : (
                        <div className="track-grid">
                            {tracks.map((track, index) => (
                                <article className={`track-card track-card-${index % 4}`} key={track.id}>
                                    <div className="track-art">
                                        <img src={track.coverImageUrl ? apiUrl(track.coverImageUrl) : '/images/track.jpg'} alt="" />
                                        <a
                                            className="track-play"
                                            href={apiUrl(track.path)}
                                            target="_blank"
                                            rel="noreferrer"
                                            aria-label={`Listen to ${track.title}`}
                                        >▶</a>
                                        <span className="track-number">{String(index + 1).padStart(2, '0')}</span>
                                    </div>
                                    <h3>{track.title}</h3>
                                    <p>{track.artist}</p>
                                    <audio controls preload="none" aria-label={`Audio player for ${track.title}`}>
                                        <source src={apiUrl(track.path)} />
                                        Your browser does not support audio playback.
                                    </audio>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
                <aside className="community-panel">
                    <div className="community-panel-heading">
                        <div>
                            <p className="eyebrow">MEET UP, TUNE IN</p>
                            <h2>On the calendar</h2>
                        </div>
                        <span className="live-dot" aria-label="Community events" />
                    </div>
                    {events.length > 0 ? (
                        <div className="event-preview-list">
                            {events.slice(0, 3).map((event) => (
                                <Link className="event-preview" to={`/event/${event.id}`} key={event.id}>
                                    <span className="event-date">{new Date(`${event.date}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                    <span><strong>{event.title}</strong><small>{event.location} · {event.time}</small></span>
                                    <span className="event-arrow">↗</span>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="event-empty">
                            <span className="event-calendar-icon">◷</span>
                            <p>No events on the calendar yet.</p>
                            <span>Good things start with a first invite.</span>
                        </div>
                    )}
                    <Link to="/calendar" className="text-link">Explore community events →</Link>
                </aside>
            </div>
            <footer className="home-footer"><span>INDEPENDENT SOUNDS, SHARED LOUDLY.</span><Link to="/about">The Sound Hub story</Link></footer>
        </main>
    );
};

export default Home;
