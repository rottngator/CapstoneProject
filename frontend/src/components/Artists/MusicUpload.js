import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiUrl, authHeaders } from '../../api';
import './MusicUpload.css';

const MusicUpload = () => {
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');
    const [artist, setArtist] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const [fileUrl, setFileUrl] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [dragging, setDragging] = useState(false);
    const audioRef = useRef(null);
    const fileInput = useRef(null);

    const selectFile = (selectedFile) => {
        if (!selectedFile) return;
        if (selectedFile.size > 10 * 1024 * 1024) {
            setFile(null);
            setError('That file is over 10 MB. Choose a smaller audio file.');
            return;
        }
        setError('');
        setFile(selectedFile);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!file) {
            setError('Choose an audio file before uploading.');
            return;
        }
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title.trim());
        formData.append('artist', artist.trim());
        formData.append('description', description.trim());

        setSubmitting(true);
        setError('');
        try {
            const response = await fetch(apiUrl('/upload'), {
                method: 'POST',
                headers: authHeaders(),
                body: formData,
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Upload failed.');
            setFileUrl(apiUrl(data.fileUrl));
        } catch (uploadError) {
            setError(uploadError.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="page-shell upload-page">
            <section className="upload-intro">
                <p className="eyebrow">YOUR NEXT RELEASE STARTS HERE</p>
                <h1>Put your sound<br />out into the world.</h1>
                <p>Every great track starts with someone pressing upload. Add a title and artist name, then share your sound with the community.</p>
                <Link to="/" className="text-link">← Back to discovery</Link>
            </section>
            <section className="upload-card surface-card">
                <div className="upload-card-heading">
                    <span className="upload-icon">♫</span>
                    <div><h2>New release</h2><p>Tell us a little about this track.</p></div>
                </div>
                <form className="upload-form" onSubmit={handleSubmit}>
                    <label className="field-label" htmlFor="title">Track title</label>
                    <input id="title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Give it a name" maxLength="160" required />
                    <label className="field-label" htmlFor="artist">Artist</label>
                    <input id="artist" value={artist} onChange={(event) => setArtist(event.target.value)} placeholder="Your artist name" maxLength="120" required />
                    <label className="field-label" htmlFor="description">A note about the track <span>Optional</span></label>
                    <textarea id="description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What inspired this one?" rows="4" maxLength="4000" />
                    <p className="upload-file-label">Your audio file <span>MP3, WAV, OGG, M4A, AAC, or FLAC · up to 10 MB</span></p>
                    <button
                        type="button"
                        className={`upload-dropzone ${dragging ? 'is-dragging' : ''}`}
                        onClick={() => fileInput.current?.click()}
                        onDragOver={(event) => {
                            event.preventDefault();
                            setDragging(true);
                        }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={(event) => {
                            event.preventDefault();
                            setDragging(false);
                            selectFile(event.dataTransfer.files[0]);
                        }}
                        aria-describedby="upload-file-help"
                    >
                        <span className="upload-drop-icon" aria-hidden="true">↑</span>
                        <span className="upload-drop-copy"><strong>{file ? file.name : 'Drop your track here'}</strong><small>{file ? 'Choose a different audio file' : 'or browse files from your device'}</small></span>
                        <span className="button button-outline upload-browse">Browse files</span>
                    </button>
                    <input
                        id="file"
                        ref={fileInput}
                        className="visually-hidden"
                        type="file"
                        accept=".mp3,.wav,.ogg,.m4a,.aac,.flac,.webm,audio/*"
                        onChange={(event) => {
                            selectFile(event.target.files[0] || null);
                            event.target.value = '';
                        }}
                    />
                    <span id="upload-file-help" className="upload-file-help">Audio only. Maximum file size: 10 MB.</span>
                    {file && <p className="selected-file" role="status">Ready to upload · {(file.size / (1024 * 1024)).toFixed(2)} MB</p>}
                    {error && <p className="form-error" role="alert">{error}</p>}
                    <button className="button button-primary upload-submit" type="submit" disabled={submitting}>
                        {submitting ? 'Uploading…' : 'Publish track →'}
                    </button>
                </form>
                {fileUrl && (
                    <div className="upload-success" role="status">
                        <div><strong>It’s out there.</strong><p>Your track is live on Sound Hub.</p></div>
                        <audio ref={audioRef} controls src={fileUrl}>Your browser does not support audio playback.</audio>
                    </div>
                )}
            </section>
        </main>
    );
};

export default MusicUpload;
