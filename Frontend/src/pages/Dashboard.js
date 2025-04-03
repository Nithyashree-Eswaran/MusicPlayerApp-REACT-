import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "../styles/Dashboard.css";
import SongCard from '../components/SongCard';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaMusic, FaHeart } from "react-icons/fa";

const Dashboard = () => {
  const [songs, setSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const userId = localStorage.getItem('userId');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const audioRef = useRef(null);

  useEffect(() => {
    if (!userId) {
      navigate('/login');
      return;
    }

    const fetchSongs = async () => {
      try {
        const response = await axios.get('/api/songs');
        setSongs(response.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching songs:", error);
        setError("Failed to load songs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    const fetchFavorites = async () => {
      if (userId) {
        try {
          const response = await axios.get(`/api/songs/favorites/${userId}`);
          setFavorites(response.data);
          setError(null);
        } catch (error) {
          console.error("Error fetching favorites:", error);
          setError("Failed to load favorites. Please try again later.");
        }
      }
    };

    fetchSongs();
    fetchFavorites();

    // Cleanup function
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, [userId, navigate]);

  const playSong = (song) => {
    if (currentSong?._id === song._id) {
      setIsPlaying(!isPlaying);
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    } else {
      setCurrentSong(song);
      setIsPlaying(true);
      if (audioRef.current) {
        // Handle Google Drive URLs
        let audioUrl = song.url;
        if (song.url.includes('drive.google.com')) {
          // Extract file ID from the URL
          const fileId = song.url.match(/id=(.*?)&/);
          if (fileId && fileId[1]) {
            audioUrl = `/api/songs/stream/${song._id}`;
          }
        }
        
        // Set the source and load the audio
        audioRef.current.src = audioUrl;
        audioRef.current.load();
        
        // Play the audio with retry mechanism
        const playPromise = audioRef.current.play();
        if (playPromise) {
          playPromise.catch(error => {
            console.error('Error playing audio:', error);
            setError('Failed to play audio. Please check the song URL.');
            
            // Try to play again after a short delay
            setTimeout(() => {
              audioRef.current.play().catch(error => {
                console.error('Second attempt failed:', error);
                setError('Failed to play audio after multiple attempts.');
              });
            }, 1000);
          });
        }
      }
    }
  };

  const toggleFavorite = async (song) => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      if (!token || !userId) {
        setError('Please log in to add songs to favorites');
        return;
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      await axios.post('/api/songs/favorite', {
        userId,
        songId: song._id
      }, config);

      // Update the song's favorite status
      setSongs(songs.map(s => 
        s._id === song._id ? { ...s, isFavorite: !s.isFavorite } : s
      ));

      // Update the current song's favorite status if it's playing
      if (currentSong?._id === song._id) {
        setCurrentSong({ ...currentSong, isFavorite: !currentSong.isFavorite });
      }

      setError('');
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setError(error.response?.data?.error || 'Failed to update favorites');
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.addEventListener('ended', () => setIsPlaying(false));
      audio.addEventListener('error', (e) => {
        console.error('Audio playback error:', e);
        setError('Failed to play audio. Please check the song URL.');
      });
    }

    return () => {
      if (audio) {
        audio.removeEventListener('ended', () => setIsPlaying(false));
        audio.removeEventListener('error', (e) => {
          console.error('Audio playback error:', e);
          setError('Failed to play audio. Please check the song URL.');
        });
      }
    };
  }, [audioRef]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="dashboard">
      <div className="sidebar">
        <div className="user-info">
          <FaUser size={40} />
          <h3>Your Profile</h3>
          <p>Favorites: {favorites.length}</p>
        </div>
        <nav>
          <Link to="/dashboard" className="active">
            <FaMusic /> All Songs
          </Link>
          <Link to="/favorites">
            <FaHeart /> Favorites
          </Link>
        </nav>
      </div>

      <div className="main-content">
        <div className="welcome-message">
          <h2>Welcome to 💜Rhy<sup>🎶</sup>Thm🖤</h2>
          <p>🌙Fly and Die with RhyThm💫</p>
        </div>
        
        <div className="song-list">
          {songs.map((song) => (
            <SongCard
              key={song._id}
              song={song}
              isPlaying={isPlaying ? currentSong._id : null}
              onPlay={playSong}
              onToggleFavorite={toggleFavorite}
              isFavorite={favorites.includes(song._id)}
            />
          ))}
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </div>

      <audio 
        ref={audioRef} 
      />
    </div>
  );
};

export default Dashboard;
