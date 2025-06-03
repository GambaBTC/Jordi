import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import FestivalList from './components/FestivalList';
import FestivalCalendar from './components/FestivalCalendar';
import FestivalMap from './components/FestivalMap';
import AdminPanel from './components/AdminPanel';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function App() {
  const [festivals, setFestivals] = useState([]);
  const [filter, setFilter] = useState('all');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
    fetchFestivals();
  }, [filter]);

  const fetchFestivals = async () => {
    try {
      const response = await axios.get(`${API_URL}/festivals${filter !== 'all' ? `?region=${filter}` : ''}`);
      setFestivals(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching festivals:', error);
      setLoading(false);
    }
  };

  const handleLogin = async (username, password) => {
    try {
      const response = await axios.post(`${API_URL}/login`, { username, password });
      localStorage.setItem('token', response.data.token);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <div className="App">
        <header className="app-header">
          <div className="container">
            <h1>VolkFest Austria</h1>
            <nav>
              <Link to="/">Liste</Link>
              <Link to="/calendar">Kalender</Link>
              <Link to="/map">Karte</Link>
              {isAuthenticated && <Link to="/admin">Admin</Link>}
              {isAuthenticated && <button onClick={handleLogout} className="logout-btn">Logout</button>}
            </nav>
          </div>
        </header>

        <div className="filter-bar">
          <div className="container">
            <label>Region filtern:</label>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">Alle Regionen</option>
              <option value="tirol">Tirol</option>
              <option value="bayern">Bayern</option>
            </select>
          </div>
        </div>

        <main className="container">
          {loading ? (
            <div className="loading">Laden...</div>
          ) : (
            <Routes>
              <Route path="/" element={<FestivalList festivals={festivals} />} />
              <Route path="/calendar" element={<FestivalCalendar festivals={festivals} />} />
              <Route path="/map" element={<FestivalMap festivals={festivals} />} />
              <Route 
                path="/admin" 
                element={
                  isAuthenticated ? (
                    <AdminPanel onUpdate={fetchFestivals} />
                  ) : (
                    <Navigate to="/" />
                  )
                } 
              />
              <Route 
                path="/login" 
                element={
                  <LoginForm onLogin={handleLogin} isAuthenticated={isAuthenticated} />
                } 
              />
            </Routes>
          )}
        </main>
      </div>
    </Router>
  );
}

function LoginForm({ onLogin, isAuthenticated }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (isAuthenticated) {
    return <Navigate to="/admin" />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await onLogin(username, password);
    if (!success) {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="login-form">
      <h2>Admin Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <div className="error">{error}</div>}
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default App;
