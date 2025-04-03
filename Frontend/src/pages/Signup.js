import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/Signup.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Clear error when input changes
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/signup', {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });

      localStorage.setItem('userId', response.data.user.id);
      localStorage.setItem('token', response.data.token);
      
      // Show success message before redirect
      setError('Registration successful! Redirecting...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (error) {
      console.error('Signup error:', error);
      if (error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.error);
      } else if (error.response && error.response.status === 400) {
        setError('Registration failed. Please check your credentials.');
      } else {
        setError('Unable to connect to the server. Please check your network connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-content">
      <div className="auth-header">
        <h2>💜Rhy<sup>🎶</sup>Thm🖤</h2>
      </div>
      <form onSubmit={handleSubmit} className="auth-form">
        <input 
          type="text" 
          name="username" 
          placeholder="Username" 
          onChange={handleChange} 
          value={formData.username}
          required 
          className="auth-input"
          disabled={loading}
          autoComplete="username"
        />
        <input 
          type="email" 
          name="email" 
          placeholder="Email" 
          onChange={handleChange} 
          value={formData.email}
          required 
          className="auth-input"
          disabled={loading}
          autoComplete="email"
        />
        <input 
          type="password" 
          name="password" 
          placeholder="Password" 
          onChange={handleChange} 
          value={formData.password}
          required 
          className="auth-input"
          disabled={loading}
          autoComplete="new-password"
        />
        <input 
          type="password" 
          name="confirmPassword" 
          placeholder="Confirm Password" 
          onChange={handleChange} 
          value={formData.confirmPassword}
          required 
          className="auth-input"
          disabled={loading}
          autoComplete="new-password"
        />
        <button 
          type="submit" 
          className="auth-button"
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Sign up'}
        </button>
      </form>
      {error && <div className="error-message">{error}</div>}
      <div className="auth-footer">
        <p>Already have an account? <Link to="/login" className="auth-link">Login</Link></p>
      </div>
    </div>
  );
};

export default Signup;
