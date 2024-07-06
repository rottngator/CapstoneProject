import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NavBar from './components/Navbar/NavBar';
import Home from './components/Home/Home';
import ProfileView from './components/Profile/ProfileView';
import './App.css';
import MusicUpload from './components/Artists/MusicUpload';
import Register from './components/Authentication/Register';
import Login from './components/Authentication/Login';

const App = () => {
    return (
        <Router>
            <NavBar />
            <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/profile' element={<ProfileView />} />
                <Route path='/upload' element={<MusicUpload />} />
                <Route path='/register' element={<Register />} />
                <Route path='/login' element={<Login />} />
            </Routes>
        </Router>
    );
};

export default App;
