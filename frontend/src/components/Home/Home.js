import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
    const navigate = useNavigate();
    const [recentTracks, setRecentTracks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRecentTracks = async () => {
            try {
                const response = await fetch('http://localhost:3000/tracks/recent-tracks'); // Ensure this URL is correct
                if (!response.ok) {
                    throw new Error('Network response was not ok: ' + response.statusText);
                }
                const data = await response.json();
                setRecentTracks(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRecentTracks();
    }, []);

    const handleCreateClick = () => {
        navigate('/upload');
    };

    return (
        <div className='home-page'>
            <div className='main-content'>
                <div className='sidebar-left'>
                    <div className='public-chatrooms'>
                        <h3>Public Chatrooms</h3>
                        {/* Populate chatrooms dynamically if applicable */}
                        <div className='chatroom'>Chat</div>
                        <div className='chatroom'>Chat</div>
                        <div className='chatroom'>Chat</div>
                        <div className='more'>More...</div>
                    </div>
                    <div className='following'>
                        <h3>Following</h3>
                        {/* Populate following users dynamically if applicable */}
                        <div className='user'>
                            <div className='status'>
                                @USERNAME
                                <span>streaming: alkaline</span>
                            </div>
                        </div>
                        <div className='user'>
                            <div className='status'>
                                @USERNAME
                                <span>streaming: dial tone</span>
                            </div>
                        </div>
                        <div className='user'>
                            <div className='status'>
                                @USERNAME
                                <span>streaming: glowworms</span>
                            </div>
                        </div>
                    </div>

                    <div className='create'>
                        <button onClick={handleCreateClick}>Create</button>
                    </div>
                </div>

                <div className='recent-tracks'>
                    <h3>Recently Posted Tracks</h3>
                    {loading ? (
                        <p>Loading...</p>
                    ) : error ? (
                        <p>Error: {error}</p>
                    ) : recentTracks.length > 0 ? (
                        recentTracks.map(track => (
                            <div key={track.id} className='track'>
                                <img src={track.coverImageUrl || '/images/track.jpg'} alt='recent track'/>
                                <div className='track-info'>
                                    <h4>{track.title}</h4>
                                    <p>{track.artist}</p>
                                    <div className='track-details'>
                                        <div className='track-stats'>
                                            <div>Streams</div>
                                            <div>{track.streams || '00'}</div>
                                        </div>
                                        <div className='track-stats'>
                                            <div>Likes</div>
                                            <div>{track.likes || '00'}</div>
                                        </div>
                                        <div className='track-stats'>
                                            <div>Comments</div>
                                            <div>{track.comments || '00'}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className='lyrics'>
                                    <h4>Lyrics</h4>
                                    <p>{track.description}</p>
                                </div>
                                <audio controls src={`/files/${track.audioFile}`}></audio>
                            </div>
                        ))
                    ) : (
                        <p>No recent tracks available</p>
                    )}
                </div>

                <div className='sidebar-right'>
                    <h3>Sound Hub News</h3>
                    {/* Populate news items dynamically if applicable */}
                    <div className='news-item'>text text text...</div>
                    <div className='news-item'>text text text...</div>
                    <div className='news-item'>text text text...</div>
                    <div className='news-item'>text text text...</div>
                </div>
            </div>
        </div>
    );
};

export default Home;
