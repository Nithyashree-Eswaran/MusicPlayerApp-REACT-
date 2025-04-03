import React, { useEffect, useState } from "react";
import axios from "axios";

function SongsList() {
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/songs") 
      .then((response) => {
        setSongs(response.data);
      })
      .catch((error) => console.error("Error fetching songs:", error));
  }, []);

  return (
    <div className="songs-list">
      <h2>Available Songs</h2>
      {songs.length === 0 ? (
        <p>Loading songs...</p>
      ) : (
        <ul>
          {songs.map((song) => (
            <li key={song._id}>
              <img src={song.coverImage} alt={song.title} className="cover" />
              <div>
                <h3>{song.title}</h3>
                <p>{song.artist}</p>
                <audio controls>
                  <source src={song.audioUrl} type="audio/mp3" />
                  Your browser does not support the audio tag.
                </audio>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SongsList;
