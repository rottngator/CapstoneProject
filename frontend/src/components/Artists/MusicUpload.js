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
        <div>
            <audio ref={audioRef} src={src} />
            <button onClick={togglePlayPause}>
                {playing ? 'Pause' : 'Play'}
            </button>
        </div>
    );
};

const MusicUpload = () => {
    const [title, setTitle] = useState('');
    const [artist, setArtist] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [fileUrl, setFileUrl] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!file) {
            setError('Please select a file to upload.');
            return;
        }

        setUploading(true);
        setError(''); // Clear any previous errors
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title);
        formData.append('artist', artist);
        formData.append('description', description);

        const token = document.cookie.replace(/(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/, '$1');
        console.log('Token:', token);

        try {
            const response = await fetch('http://localhost:3000/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`, // Ensure token is set correctly
                },
                body: formData,
            });

            if (response.ok) {
                const result = await response.json();
                setFileUrl(result.fileUrl);
                setTitle('');
                setArtist('');
                setDescription('');
                setFile(null);
                alert('File uploaded successfully!');
            } else {
                const result = await response.json();
                setError(result.message || 'File upload failed.');
            }
        } catch (error) {
            console.error('Upload error:', error);
            setError('An error occurred while uploading.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="upload-page">
            <div className="upload-form-container">
                <h1>Upload Music</h1>
                <form className="upload-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="title">Title</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="artist">Artist</label>
                        <input
                            type="text"
                            id="artist"
                            name="artist"
                            value={artist}
                            onChange={(e) => setArtist(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        ></textarea>
                    </div>
                    <div className="form-group">
                        <label htmlFor="file">Music File</label>
                        <input
                            type="file"
                            id="file"
                            name="file"
                            accept=".mp3,.wav,.ogg" // specify accepted file types
                            onChange={(e) => setFile(e.target.files[0])}
                            required
                        />
                    </div>
                    <button type="submit" disabled={uploading}>
                        {uploading ? 'Uploading...' : 'Upload'}
                    </button>
                </form>
                {error && <p className="error-message">{error}</p>}
            </div>
            {fileUrl && (
                <div className="music-player-container">
                    <h2>Music Player</h2>
                    <MusicPlayer src={`http://localhost:3000${fileUrl}`} />
                </div>
            )}
        </div>
    );
};

export default MusicUpload;
