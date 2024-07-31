import React, { useState } from 'react';
import './MusicUpload.css';

const MusicPlayer = ({ src }) => {
    const [playing, setPlaying] = useState(false);
    const audioRef = React.createRef();

    const togglePlayPause = () => {
        if (playing) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setPlaying(!playing);
    };

    return (
        <div className="music-player">
            <audio ref={audioRef} src={src} />
            <button onClick={togglePlayPause}>
                {playing ? 'Pause' : 'Play'}
            </button>
        </div>
    );
};

const MusicUpload = () => {
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');
    const [artist, setArtist] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const [fileUrl, setFileUrl] = useState(null);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
    
        if (!file) {
            setError('Please select a file to upload.');
            return;
        }
    
        console.log('Submitting file:', file); // Debugging line
    
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title);
        formData.append('artist', artist);
        formData.append('description', description);
    
        try {
            const response = await fetch('http://localhost:3000/upload', {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Something went wrong');
            }
    
            const data = await response.json();
            setFileUrl(`http://localhost:3000${data.fileUrl}`);
        } catch (err) {
            setError(err.message);
        }
    };
    
    

    return (
        <div className="upload-container">
            <form onSubmit={handleSubmit}>
                <h2>Upload Music</h2>
                {error && <p className="error">{error}</p>}
                <div>
                    <label htmlFor="title">Title</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="artist">Artist</label>
                    <input
                        type="text"
                        id="artist"
                        value={artist}
                        onChange={(e) => setArtist(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    ></textarea>
                </div>
                <div>
                    <label htmlFor="file">File</label>
                    <input
                        type="file"
                        id="file"
                        accept="audio/*"
                        onChange={handleFileChange}
                        required
                    />
                </div>
                <button type="submit">Upload</button>
            </form>
            {fileUrl && (
                <div className="uploaded-music">
                    <h3>Uploaded Music:</h3>
                    <MusicPlayer src={fileUrl} />
                </div>
            )}
        </div>
    );
};

export default MusicUpload;
