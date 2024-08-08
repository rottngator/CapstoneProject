import React from 'react';
import { Routes, Route } from 'react-router-dom';
import NavBar from './components/Navbar/NavBar';
import Home from './components/Home/Home';
import ProfileView from './components/Profile/ProfileView';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
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
import EditProfile from './components/Profile/EditProfile';
import { EventProvider } from './components/Community/EventContext';
import SearchResults from './components/Search/SearchResults';

const App = () => {
    return (
        <UserProvider>
            <EventProvider> {/* Wrap with EventProvider */}
                <>
                    <NavBar />
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/profile" element={<ProtectedRoute element={ProfileView} />} />
                        <Route path='/edit' element={<ProtectedRoute element={EditProfile} />} />
                        <Route path="/upload" element={<ProtectedRoute element={MusicUpload} />} />
                        <Route path="/chat" element={<ProtectedRoute element={CommunityChat} />} />
                        <Route path="/calendar" element={<ProtectedRoute element={EventCalendar} />} />
                        <Route path="/event/:id" element={<ProtectedRoute element={EventDetails} />} />
                        <Route path="/feedback" element={<ProtectedRoute element={Feedback} />} />
                        <Route path='/search' ekey="search" element={<ProtectedRoute element={SearchResults} />} />
                    </Routes>
                </>
            </EventProvider>
        </UserProvider>
    );
};

export default App;
