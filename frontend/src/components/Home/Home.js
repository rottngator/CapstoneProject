import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
    const [recentTracks, setRecentTracks] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTracks = async () => {
            try {
                const response = await fetch('http://localhost:3000/uploads'); // Updated URL
                const data = await response.json();
                setRecentTracks(data);  // Directly set the recent tracks
            } catch (error) {
                console.error('Error fetching tracks:', error);
            }
        };
        fetchTracks();
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
                        recentTracks.map(upload => (
                            <div key={upload._id} className='track'>
                                <img src='/images/track.jpg' alt='recent track'/>
                                <div className='track-info'>
                                    <h4>{upload.metadata.title}</h4>
                                    <p>{upload.metadata.artist}</p>
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
                                    <p>{upload.metadata.description}</p>
                                </div>
                                <audio controls src={`http://localhost:3000/files/${upload._id}`}></audio>
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
