const express = require("express");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const Song = require("../models/Song");
const User = require("../models/User");

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Upload audio file
router.post("/upload", async (req, res) => {
  try {
    const file = req.files.file;
    const song = new Song({
      title: req.body.title,
      artist: req.body.artist,
      genre: req.body.genre,
      url: `/uploads/${file.name}`
    });

    await song.save();
    
    // Move uploaded file to uploads directory
    const filePath = path.join(uploadDir, file.name);
    await file.mv(filePath);

    res.json(song);
  } catch (error) {
    res.status(500).json({ error: "Failed to upload song" });
  }
});

// Stream audio file
router.get("/stream/:filename", async (req, res) => {
  try {
    // First check if this is a local file
    const filePath = path.join(uploadDir, req.params.filename);
    
    if (fs.existsSync(filePath)) {
      // Handle local file streaming
      const stat = fs.statSync(filePath);
      const fileSize = stat.size;
      const range = req.headers.range;

      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize-1;

        if (start >= fileSize) {
          res.status(416).json({ error: "Requested range not satisfiable" });
          return;
        }

        const chunksize = (end-start)+1;
        const file = fs.createReadStream(filePath, { start, end });
        const head = {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': 'audio/mpeg',
        };

        res.writeHead(206, head);
        file.pipe(res);
      } else {
        const head = {
          'Content-Length': fileSize,
          'Content-Type': 'audio/mpeg',
        };
        res.writeHead(200, head);
        fs.createReadStream(filePath).pipe(res);
      }
    } else {
      // Handle external URLs
      const song = await Song.findOne({ _id: req.params.filename });
      if (!song) {
        return res.status(404).json({ error: "Song not found" });
      }

      // Handle Google Drive URLs
      if (song.url.includes('drive.google.com')) {
        // Extract file ID from the URL
        const fileId = song.url.match(/id=(.*?)&/);
        if (fileId && fileId[1]) {
          // Create the download URL
          const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId[1]}`;
          
          // Make a request to Google Drive
          const response = await axios.get(downloadUrl, {
            responseType: 'stream'
          });

          // Set appropriate headers
          res.setHeader('Content-Type', 'audio/mpeg');
          res.setHeader('Content-Disposition', `inline; filename="${song.title}.mp3"`);
          
          // Pipe the stream to the response
          response.data.pipe(res);
          return;
        }
      }

      // For other external URLs, just redirect
      res.redirect(song.url);
    }
  } catch (error) {
    console.error("Error streaming audio:", error);
    res.status(500).json({ error: "Failed to stream audio file" });
  }
});

// Get all songs
router.get("/", async (req, res) => {
  try {
    const songs = await Song.find().sort({ createdAt: -1 });
    res.json(songs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch songs" });
  }
});

// Get user's favorites
router.get("/favorites/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get all favorite songs
    const favoriteSongs = await Song.find({ _id: { $in: user.favorites } });
    res.json(favoriteSongs);
  } catch (error) {
    console.error("Error fetching favorites:", error);
    res.status(500).json({ error: "Failed to fetch favorites" });
  }
});

// Toggle favorite
router.post("/favorite", async (req, res) => {
  try {
    const { userId, songId } = req.body;
    
    if (!userId || !songId) {
      return res.status(400).json({ error: "User ID and Song ID are required" });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if song exists
    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ error: "Song not found" });
    }

    // Toggle favorite
    if (user.favorites.includes(songId)) {
      user.favorites = user.favorites.filter(id => id !== songId);
      await user.save();
      res.json({ message: "Song removed from favorites" });
    } else {
      user.favorites.push(songId);
      await user.save();
      res.json({ message: "Song added to favorites" });
    }
  } catch (error) {
    console.error("Error toggling favorite:", error);
    res.status(500).json({ error: "Failed to update favorites" });
  }
});

module.exports = router;
