import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SongCard from '../components/SongCard';
import { FaMusic } from 'react-icons/fa';
import '../styles/Dashboard.css';
import { FaHeart } from "react-icons/fa";

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          setError('Please log in to view favorites');
          return;
        }

        const response = await axios.get(`${process.env.REACT_APP_API_URL}/songs/favorites/${userId}`);
        setFavorites(response.data);
        setError('');
      } catch (error) {
        console.error('Error fetching favorites:', error);
        setError('Failed to fetch favorites. Please try again later.');
      }
    };

    fetchFavorites();
  }, []);

  const toggleFavorite = async (song) => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setError('Please log in to add songs to favorites');
        return;
      }

      const response = await axios.post(`${process.env.REACT_APP_API_URL}/songs/favorite`, {
        userId,
        songId: song._id
      });

      // Update the favorites list
      if (response.data.message === "Song removed from favorites") {
        setFavorites(prev => prev.filter(fav => fav._id !== song._id));
      } else {
        setFavorites(prev => [...prev, song]);
      }

      setError('');
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setError('Failed to update favorites');
    }
  };

  return (
    <div className="favorites-container">
      <div className="app-title">
        <h3><FaMusic /> My Favorites</h3>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="song-grid">
        {favorites.map(song => (
          <SongCard
            key={song._id}
            song={song}
            onToggleFavorite={() => toggleFavorite(song)}
          />
        ))}
      </div>

      {favorites.length === 0 && !error && (
        <div className="no-favorites">
          <p>No favorites yet. Add songs to your favorites by clicking the heart icon.</p>
        </div>
      )}
    </div>
  );
};

export default Favorites;