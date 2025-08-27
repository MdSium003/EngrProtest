// client/src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, NavLink } from 'react-router-dom';
import FacebookPosts from './components/FacebookPosts';
import Gallery from './components/Gallery';
import Videos from './components/Videos';
import InjuredList from './components/InjuredList';
import AdminLogin from './components/AdminLogin';
import Footer from './components/Footer';
import './App.css';

function App() {
    const [token, setToken] = useState(localStorage.getItem('token'));

    const handleLogout = () => {
        localStorage.removeItem('token');
        setToken(null);
    };

    return (
        <Router>
            <div className="app-container">
                <nav className="navbar">
                    {/* Brand name and logo on the left */}
                    <div className="navbar-brand">
                        <img src="/logo.png" alt="Protest Logo" className="navbar-logo" />
                        {/* Updated Protest Name */}
                        <span>প্রকৌশলী অধিকার আন্দোলন</span>
                    </div>

                    {/* Navigation links and login on the right */}
                    <div className="navbar-right">
                        <NavLink to="/" end>Facebook Posts</NavLink>
                        <NavLink to="/gallery">Gallery</NavLink>
                        <NavLink to="/videos">Videos</NavLink>
                        <NavLink to="/injured">Injured List</NavLink>
                        {token ? (
                            <button onClick={handleLogout} className="logout-btn">Logout</button>
                        ) : (
                            <NavLink to="/admin">Admin Login</NavLink>
                        )}
                    </div>
                </nav>
                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<FacebookPosts token={token} />} />
                        <Route path="/gallery" element={<Gallery token={token} />} />
                        <Route path="/videos" element={<Videos token={token} />} />
                        <Route path="/injured" element={<InjuredList token={token} />} />
                        <Route path="/admin" element={<AdminLogin setToken={setToken} />} />
                    </Routes>
                </main>
                <Footer />
            </div>
        </Router>
    );
}

export default App;