import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';

const Home = () => {
  const songs = [
    { id: 1, title: "Dynamite", artist: "BTS", image: "/images/Dynamite.jpeg" },
    { id: 2, title: "Love You With All My Heart", artist: "Crush", image: "/images/Queen_of_Tears.jpeg" },
    { id: 3, title: "Spring Snow", artist: "10CM", image: "/images/Spring_Snow.jpeg" },
    { id: 4, title: "Dimple", artist: "BTS", image: "/images/Dimple.jpeg" },
    { id: 5, title: "Pink Venom", artist: "BLACKPINK", image: "/images/Pink_venom.jpeg" },
    { id: 6, title: "DNA", artist: "BTS", image: "/images/DNA.jpeg" },
    { id: 7, title: "Lovesick Girls", artist: "BLACKPINK", image: "/images/lovesick_girls.jpeg" }
  ];

  return (
    <div className="home-container">
     

      {/* App Title */}
      <div className="app-title">
        <h3>Die with 💜Rhy<sup>🎶</sup>Thm🖤</h3>
      </div>

      {/* Scrolling Songs */}
      <div className="scrolling-songs">
        <div className="songs-wrapper">
          {songs.map((song) => (
            <div key={song.id} className="song-card">
              <img src={song.image} alt={song.title} />
              <div className="song-info">
                <h3>{song.title}</h3>
                <p>{song.artist}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
