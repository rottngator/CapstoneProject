import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import NavBar from './components/NavBar';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import UploadPage from './pages/UploadPage';
import './App.css';

const App = () => {
    return (
        <Router>
            <NavBar />
            <Switch>
                <Route path='/' exact component={HomePage} />
                <Route path='/profile' component={ProfilePage} />
                <Route path='/upload' component={UploadPage} />
            </Switch>
        </Router>
    );
};

export default App;
