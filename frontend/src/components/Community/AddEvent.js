// AddEvent.js

import React, { useState } from 'react';
import axios from 'axios';

const AddEvent = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [time, setTime] = useState('');
    const [date, setDate] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem('token'); // or however you're storing the token

        try {
            const response = await axios.post('http://localhost:3000/events', {
                title,
                description,
                location,
                time,
                date
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('Event added:', response.data);
        } catch (error) {
            console.error('Error adding event:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description"></textarea>
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" />
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <button type="submit">Add Event</button>
        </form>
    );
};

export default AddEvent;
