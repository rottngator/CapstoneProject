import React from 'react';
import { Routes, Route } from 'react-router-dom';
import NavBar from './components/Navbar/NavBar';
import Home from './components/Home/Home';
import ProfileView from './components/Profile/ProfileView';
import './App.css';
import MusicUpload from './components/Artists/MusicUpload';
import Register from './components/Authentication/Register';
import Login from './components/Authentication/Login';
import CommunityChat from './components/Community/CommunityChat';
import EventCalendar from './components/Community/EventCalendar';
import EventDetails from './components/Community/EventDetails';
import About from './components/Official/About';
import Feedback from './components/Community/Feedback';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import { UserProvider } from './components/Authentication/UserContext';

const events = [
    { id: 1, date: new Date(2024, 6, 10), title: 'Event 1', description: 'Description 1', location: 'Location 1', time: '10:00 AM' },
    { id: 2, date: new Date(2024, 6, 15), title: 'Event 2', description: 'Description 2', location: 'Location 2', time: '2:00 PM' },
];

const App = () => {
    return (
        <UserProvider>
            <>
                <NavBar />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/profile" element={<ProtectedRoute element={ProfileView} />} />
                    <Route path="/upload" element={<ProtectedRoute element={MusicUpload} />} />
                    <Route path="/chat" element={<ProtectedRoute element={CommunityChat} />} />
                    <Route path="/calendar" element={<ProtectedRoute element={EventCalendar} />} />
                    <Route path="/event/:id" element={<ProtectedRoute element={() => <EventDetails events={events} />} />} />
                    <Route path="/feedback" element={<ProtectedRoute element={Feedback} />} />
                </Routes>
            </>
        </UserProvider>
    );
};

export default App;
