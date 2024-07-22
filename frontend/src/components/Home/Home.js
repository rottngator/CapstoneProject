import React from 'react';
import { useNavigate } from 'react-router-dom'; 
import './Home.css';

const Home = () => {
    const navigate = useNavigate(); 

    const handleCreateClick = () => {
        navigate('/upload'); // Navigate to the MusicUpload page
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
                        <button onClick={handleCreateClick}>Create</button> {/* Add onClick handler */}
                    </div>
                </div>

                <div className='featured-tracks'>
                    <h3>Featured Tracks</h3>
                    <div className='track'>
                        <img src='/frontend/public/images/track.jpg' alt='featured track'/>
                        <div className='track-info'>
                            <h4>Track Title Here</h4>
                            <p>Artist</p>
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
                            <p>text text text text...</p>
                        </div>
                    </div>
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
