import React, { useState } from 'react';

const AddEvent = ({ onAdd }) => {
    const [newEvent, setNewEvent] = useState({
        title: '',
        description: '',
        location: '',
        time: '',
        date: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewEvent((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Send POST request to add the event
            const response = await fetch('http://localhost:3000/events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newEvent),
            });

            if (!response.ok) {
                throw new Error('Failed to add event');
            }

            const addedEvent = await response.json();
            onAdd(addedEvent);
        } catch (error) {
            console.error('Error adding event:', error);
        }
    };

    return (
        <div>
            <h2>Add Event</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Title:</label>
                    <input type="text" name="title" value={newEvent.title} onChange={handleChange} required />
                </div>
                <div>
                    <label>Description:</label>
                    <input type="text" name="description" value={newEvent.description} onChange={handleChange} />
                </div>
                <div>
                    <label>Location:</label>
                    <input type="text" name="location" value={newEvent.location} onChange={handleChange} />
                </div>
                <div>
                    <label>Time:</label>
                    <input type="time" name="time" value={newEvent.time} onChange={handleChange} />
                </div>
                <div>
                    <label>Date:</label>
                    <input type="date" name="date" value={newEvent.date} onChange={handleChange} />
                </div>
                <button type="submit">Add Event</button>
            </form>
        </div>
    );
};

export default AddEvent;
