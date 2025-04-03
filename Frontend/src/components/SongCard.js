import React from "react";
import styled from "styled-components";
import { FaPlay, FaPause, FaHeart, FaRegHeart } from "react-icons/fa";

const SongCard = ({ 
  song, 
  isPlaying, 
  onPlay, 
  onToggleFavorite,
  isFavorite
}) => {
  return (
    <Card>
      <div className="song-info">
        <h3>{song.title}</h3>
        <p className="artist">{song.artist}</p>
        <p className="genre">{song.genre}</p>
      </div>
      <div className="controls">
        <button 
          onClick={() => onPlay(song)}
          className="play-btn"
        >
          {isPlaying === song._id ? <FaPause /> : <FaPlay />}
        </button>
        <button 
          onClick={() => onToggleFavorite(song._id)}
          className="favorite-btn"
        >
          {isFavorite ? <FaHeart /> : <FaRegHeart />}
        </button>
      </div>
    </Card>
  );
};

const Card = styled.div`
  background: #1a1a1a;
  padding: 15px;
  border-radius: 12px;
  width: 300px;
  margin: 10px;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-5px);
  }

  .song-info {
    text-align: center;
    margin-bottom: 15px;
    
    h3 {
      color: #fff;
      margin: 0;
      font-size: 1.2rem;
    }

    .artist {
      color: #888;
      margin: 5px 0;
      font-size: 0.9rem;
    }

    .genre {
      color: #555;
      font-size: 0.8rem;
    }
  }

  .controls {
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 10px 0;
    border-top: 1px solid #333;

    button {
      background: none;
      border: none;
      color: #fff;
      cursor: pointer;
      padding: 8px;
      border-radius: 50%;
      transition: background-color 0.2s;
      
      &:hover {
        background-color: #333;
      }

      &.play-btn {
        font-size: 1.5rem;
      }

      &.favorite-btn {
        font-size: 1.2rem;
      }
    }
  }
`;

export default SongCard;
