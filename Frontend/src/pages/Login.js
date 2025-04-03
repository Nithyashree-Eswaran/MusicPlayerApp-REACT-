import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('/api/auth/login', {
        username,
        password
      });

      // Store user ID in localStorage
      localStorage.setItem('userId', response.data.userId);
      localStorage.setItem('token', response.data.token);

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.error || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="auth-content">
      <div className="auth-header">
        <h2>💜Rhy<sup>🎶</sup>Thm🖤</h2>
      </div>
      <div className="login-box">
        <h2>Login</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <input 
              type="text" 
              id="username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
              className="auth-input"
              autoComplete="username"
            />
          </div>
          <div className="form-group">
            <input 
              type="password" 
              id="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              className="auth-input"
              autoComplete="current-password"
            />
          </div>
          <button 
            type="submit" 
            className="auth-button"
          >
            Login
          </button>
        </form>
      </div>
      <div className="auth-footer">
        <p>Don't have an account? <Link to="/signup" className="auth-link">Sign up</Link></p>
      </div>
    </div>
  );
};

export default Login;
