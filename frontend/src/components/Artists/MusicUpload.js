import React, { useState } from 'react';
import './MusicUpload.css';

// MusicPlayer Component
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!file) {
            alert('Please select a file to upload.');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title);
        formData.append('artist', artist);
        formData.append('description', description);

        try {
            const response = await fetch('http://localhost:3000/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${document.cookie.replace(/(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/, '$1')}`, // Add the token if necessary
                },
                body: formData,
            });

            const result = await response.json();
            if (response.ok) {
                setFileUrl(result.fileUrl);
                alert('File uploaded successfully!');
            } else {
                alert('File upload failed.');
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('An error occurred while uploading.');
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
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="file">Music File</label>
                        <input
                            type="file"
                            id="file"
                            name="file"
                            accept="audio/*"
                            onChange={(e) => setFile(e.target.files[0])}
                            required
                        />
                    </div>
                    <button type="submit" className="upload-button" disabled={uploading}>
                        {uploading ? 'Uploading...' : 'Upload'}
                    </button>
                </form>
                {fileUrl && (
                    <div>
                        <div>File available at: <a href={fileUrl} target="_blank" rel="noopener noreferrer">{fileUrl}</a></div>
                        <MusicPlayer src={fileUrl} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default MusicUpload;
