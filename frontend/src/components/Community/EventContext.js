import React, { createContext, useState, useContext } from 'react';

const EventContext = createContext();

export const EventProvider = ({ children }) => {
    const [events, setEvents] = useState([
        { id: 1, date: new Date(2024, 6, 10), title: 'Event 1', description: 'Description 1', location: 'Location 1', time: '10:00 AM' },
        { id: 2, date: new Date(2024, 6, 15), title: 'Event 2', description: 'Description 2', location: 'Location 2', time: '2:00 PM' },
    ]);

    return (
        <EventContext.Provider value={{ events, setEvents }}>
            {children}
        </EventContext.Provider>
    );
};

export const useEvents = () => {
    return useContext(EventContext);
};
