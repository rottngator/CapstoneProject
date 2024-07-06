import React, { useState } from 'react';
import './MusicUpload.css';

const MusicUpload = () => {
    const [title, setTitle] = useState('');
    const [artist, setArtist] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle file upload logic here
        console.log({ title, artist, description, file });
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
                    <button type="submit" className="upload-button">Upload</button>
                </form>
            </div>
        </div>
    );
};

export default MusicUpload;
