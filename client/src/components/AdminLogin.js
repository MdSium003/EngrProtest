import React, { useState } from 'react';

// Access the backend URL from environment variables
const API_URL = process.env.REACT_APP_API_URL;

const AdminLogin = ({ setToken }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // Use the full URL
      const res = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Login failed');
      }
      const data = await res.json();
      localStorage.setItem('token', data.token);
      setToken(data.token);
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div>
      <h2>Admin Login</h2>
      <form onSubmit={handleSubmit} className="form-container">
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
        <button type="submit" className="btn">Login</button>
      </form>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default AdminLogin;
