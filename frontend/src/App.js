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
import EditProfile from './components/Profile/EditProfile';
import SearchResults from './components/Search/SearchResults';
import { Link } from 'react-router-dom';

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
                    <Route path="/edit" element={<ProtectedRoute element={EditProfile} />} />
                    <Route path="/upload" element={<ProtectedRoute element={MusicUpload} />} />
                    <Route path="/chat" element={<ProtectedRoute element={CommunityChat} />} />
                    <Route path="/calendar" element={<EventCalendar />} />
                    <Route path="/event/:id" element={<EventDetails />} />
                    <Route path="/feedback" element={<ProtectedRoute element={Feedback} />} />
                    <Route path="/search" element={<SearchResults />} />
                    <Route path="*" element={<main className="page-shell"><section className="surface-card empty-state"><p className="eyebrow">404 · LOST IN THE MIX</p><h1>That page isn’t on this record.</h1><p>Head back to discover something new.</p><Link className="button button-primary" to="/">Back home</Link></section></main>} />
                </Routes>
            </>
        </UserProvider>
    );
};

export default App;
