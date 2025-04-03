const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate' });
  }
};

module.exports = auth;const express = require("express");
const router = express.Router();
const Song = require("../models/Song");
const User = require("../models/User");
const auth = require("../middleware/auth");

// Toggle favorite
router.post("/favorite", auth, async (req, res) => {
  try {
    const { songId } = req.body;
    
    if (!songId) {
      return res.status(400).json({ error: "Song ID is required" });
    }

    // Check if song exists
    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ error: "Song not found" });
    }

    // Toggle favorite
    if (req.user.favorites.includes(songId)) {
      req.user.favorites = req.user.favorites.filter(id => id !== songId);
      await req.user.save();
      res.json({ message: "Song removed from favorites" });
    } else {
      req.user.favorites.push(songId);
      await req.user.save();
      res.json({ message: "Song added to favorites" });
    }
  } catch (error) {
    console.error("Error toggling favorite:", error);
    res.status(500).json({ error: "Failed to update favorites" });
  }
});

// Get user's favorites
router.get("/favorites/:userId", auth, async (req, res) => {
  try {
    const favoriteSongs = await Song.find({ _id: { $in: req.user.favorites } });
    res.json(favoriteSongs);
  } catch (error) {
    console.error("Error fetching favorites:", error);
    res.status(500).json({ error: "Failed to fetch favorites" });
  }
});

module.exports = router;