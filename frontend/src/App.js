import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NavBar from './components/Navbar/NavBar';
import Home from './components/Home/Home';
import ProfileView from './components/Profile/ProfileView';
import './App.css';
import MusicUpload from './components/Artists/MusicUpload';

const App = () => {
    return (
        <Router>
            <NavBar />
            <Routes>
                <Route path='/' exact component={Home} />
                <Route path='/profile' component={ProfileView} />
                <Route path='/upload' component={MusicUpload} />
            </Routes>
        </Router>
    );
};

export default App;
