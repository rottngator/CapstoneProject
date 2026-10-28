import React, { useContext, useEffect, useRef, useState } from 'react';
import { UserContext } from '../Authentication/UserContext';
import { apiUrl, authHeaders } from '../../api';
import './CommunityChat.css';

const CommunityChat = () => {
    const { user } = useContext(UserContext);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [error, setError] = useState('');
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(true);
    const messageList = useRef(null);

    useEffect(() => {
        const controller = new AbortController();
        let timeout;
        const loadMessages = async () => {
            try {
                const response = await fetch(apiUrl('/chat/messages'), {
                    headers: authHeaders(),
                    signal: controller.signal,
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || 'Could not load messages.');
                setMessages(data);
                setError('');
            } catch (loadError) {
                if (loadError.name !== 'AbortError') setError(loadError.message);
            } finally {
                setLoading(false);
                if (!controller.signal.aborted) timeout = setTimeout(loadMessages, 5000);
            }
        };
        loadMessages();
        return () => {
            controller.abort();
            clearTimeout(timeout);
        };
    }, []);

    useEffect(() => {
        if (messageList.current) messageList.current.scrollTop = messageList.current.scrollHeight;
    }, [messages]);

    const handleSendMessage = async (event) => {
        event.preventDefault();
        const message = input.trim();
        if (!message || sending) return;
        setSending(true);
        setError('');
        try {
            const response = await fetch(apiUrl('/chat/messages'), {
                method: 'POST',
                headers: authHeaders(true),
                body: JSON.stringify({ message }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Could not send message.');
            setMessages((current) => current.some((item) => item.id === data.id) ? current : [...current, data]);
            setInput('');
        } catch (sendError) {
            setError(sendError.message);
        } finally {
            setSending(false);
        }
    };

    return (
        <main className="page-shell chat-page">
            <section className="chat-intro"><p className="eyebrow">THE COMMUNITY MIXER</p><h1>Good sounds.<br />Better company.</h1><p>Meet the artists, listeners, and curious ears around Sound Hub.</p></section>
            <section className="chat-container surface-card">
                <header className="chat-header"><span className="chat-room-icon">♫</span><div><h2>Community chat</h2><p><span className="live-dot" /> &nbsp;Open conversation</p></div></header>
                <div className="chat-messages" ref={messageList} aria-live="polite">
                    {loading && <p className="chat-placeholder">Tuning into the room…</p>}
                    {!loading && messages.length === 0 && <div className="chat-placeholder"><span>◌</span><p>The room is quiet. Start the conversation.</p></div>}
                    {messages.map((message) => (
                        <article key={message.id} className={`message ${message.username === user?.username ? 'message-own' : ''}`}>
                            <span className="message-avatar">{(message.username || '?').slice(0, 1).toUpperCase()}</span>
                            <div><p className="message-meta"><strong>{message.username}</strong><time>{new Date(message.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</time></p><p className="message-body">{message.message}</p></div>
                        </article>
                    ))}
                </div>
                {error && <p className="form-error chat-error" role="alert">{error}</p>}
                <form className="chat-input" onSubmit={handleSendMessage}>
                    <input type="text" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Add something to the conversation…" maxLength="1000" aria-label="Message" />
                    <button className="button button-primary" type="submit" disabled={!input.trim() || sending}>{sending ? 'Sending…' : 'Send ↗'}</button>
                </form>
                <p className="chat-footnote">Be kind. This is a shared room, not a stage.</p>
            </section>
        </main>
    );
};

export default CommunityChat;
