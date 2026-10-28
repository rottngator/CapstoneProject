import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiUrl, authHeaders } from '../../api';
import './ProfileView.css';

const ProfileView = () => {
    const [profile, setProfile] = useState(null);
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const headers = authHeaders();
                const [profileResponse, tracksResponse] = await Promise.all([
                    fetch(apiUrl('/user/profile'), { headers }),
                    fetch(apiUrl('/user/tracks'), { headers }),
                ]);
                if (!profileResponse.ok) throw new Error('Could not load your profile.');
                if (!tracksResponse.ok) throw new Error('Could not load your tracks.');
                setProfile(await profileResponse.json());
                setTracks(await tracksResponse.json());
            } catch (loadError) {
                setError(loadError.message);
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, []);

    if (loading) return <main className="page-shell"><p className="status-message">Loading your profile…</p></main>;
    if (error) return <main className="page-shell"><p className="status-message error-message">{error}</p></main>;

    const photo = profile.profilePicture ? apiUrl(profile.profilePicture) : '';
    const banner = profile.banner ? apiUrl(profile.banner) : '';
    const latestTrack = tracks[0];

    return (
        <main className="page-shell profile-page">
            <section className="profile-cover" style={banner ? { backgroundImage: `linear-gradient(90deg, rgba(20,14,32,.65), rgba(20,14,32,.05)), url("${banner}")` } : undefined}>
                <span className="profile-cover-label">SOUND HUB / ARTIST PROFILE</span>
                <Link className="button button-outline profile-edit-link" to="/edit">Edit profile</Link>
            </section>
            <section className="profile-summary surface-card">
                <div className="profile-identity">
                    <div className="profile-avatar">{photo ? <img src={photo} alt={`${profile.name || profile.username}'s profile`} /> : (profile.username || 'S').slice(0, 1).toUpperCase()}</div>
                    <p className="eyebrow">ARTIST PROFILE</p>
                    <h1>{profile.name || profile.username}</h1>
                    <p className="profile-handle">@{profile.username}{profile.pronouns ? ` · ${profile.pronouns}` : ''}</p>
                    {profile.location && <p className="profile-location">{profile.location}</p>}
                    {profile.label && <span className="profile-label">{profile.label}</span>}
                </div>
                <div className="profile-bio">
                    <p className="eyebrow">THE PERSON BEHIND THE MUSIC</p>
                    <h2>About</h2>
                    <p>{profile.about || 'This artist is letting the music do the talking.'}</p>
                </div>
                <div className="profile-spotlight">
                    <div className="profile-spotlight-heading">
                        <div><p className="eyebrow">ON REPEAT</p><h2>Latest release</h2></div>
                        <span className="profile-track-count">{tracks.length} {tracks.length === 1 ? 'track' : 'tracks'}</span>
                    </div>
                    {latestTrack ? (
                        <div className="profile-spotlight-track">
                            <img src={latestTrack.coverImageUrl ? apiUrl(latestTrack.coverImageUrl) : '/images/track.jpg'} alt="" />
                            <div><strong>{latestTrack.title}</strong><span>{latestTrack.artist}</span></div>
                            <audio controls preload="none" aria-label={`Play ${latestTrack.title}`}><source src={apiUrl(latestTrack.path)} /></audio>
                        </div>
                    ) : (
                        <p className="profile-no-track">Your first release will appear here.</p>
                    )}
                </div>
            </section>
            <section className="profile-tracks">
                <div className="section-heading">
                    <div><p className="eyebrow">MADE BY YOU</p><h2>Your releases</h2></div>
                    <Link to="/upload" className="button button-primary">＋ Upload track</Link>
                </div>
                {tracks.length === 0 ? (
                    <div className="empty-tracks"><span className="empty-icon">♫</span><h3>Your first release belongs here.</h3><p>When you upload a track, it’ll show up on your profile.</p></div>
                ) : (
                    <div className="profile-track-list">
                        {tracks.map((track) => (
                            <article className="profile-track surface-card" key={track.id}>
                                <span className="track-list-art">♫</span>
                                <div className="profile-track-copy"><h3>{track.title}</h3><p>{track.artist}{track.description ? ` · ${track.description}` : ''}</p></div>
                                <audio controls preload="none" aria-label={`Play ${track.title}`}><source src={apiUrl(track.path)} /></audio>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
};

export default ProfileView;
