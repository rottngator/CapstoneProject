import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
    const navigate = useNavigate();

    // Static data for recent tracks
    const recentTracks = [
        { id: '1', title: 'Track 1', artist: 'Artist 1', description: 'Description for Track 1' },
        { id: '2', title: 'Track 2', artist: 'Artist 2', description: 'Description for Track 2' },
        { id: '3', title: 'Track 3', artist: 'Artist 3', description: 'Description for Track 3' },
    ];

    const handleCreateClick = () => {
        navigate('/upload');
    };

    return (
        <div className='home-page'>
            <div className='main-content'>
                <div className='sidebar-left'>
                    <div className='public-chatrooms'>
                        <h3>Public Chatrooms</h3>
                        <div className='chatroom'>Chat</div>
                        <div className='chatroom'>Chat</div>
                        <div className='chatroom'>Chat</div>
                        <div className='more'>More...</div>
                    </div>
                    <div className='following'>
                        <h3>Following</h3>
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
                    {recentTracks.length > 0 ? (
                        recentTracks.map(track => (
                            <div key={track.id} className='track'>
                                <img src='/images/track.jpg' alt='recent track'/>
                                <div className='track-info'>
                                    <h4>{track.title}</h4>
                                    <p>{track.artist}</p>
                                    <div className='track-details'>
                                        <div className='track-stats'>
                                            <div>Streams</div>
                                            <div>00</div>
                                        </div>
                                        <div className='track-stats'>
                                            <div>Likes</div>
                                            <div>00</div>
                                        </div>
                                        <div className='track-stats'>
                                            <div>Comments</div>
                                            <div>00</div>
                                        </div>
                                    </div>
                                </div>

                                <div className='lyrics'>
                                    <h4>Lyrics</h4>
                                    <p>{track.description}</p>
                                </div>
                                <audio controls src={`/files/${track.id}`}></audio>
                            </div>
                        ))
                    ) : (
                        <p>No recent tracks available</p>
                    )}
                </div>

                <div className='sidebar-right'>
                    <h3>Sound Hub News</h3>
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
