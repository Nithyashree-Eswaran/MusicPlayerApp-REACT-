require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Function to start the server after connecting to MongoDB
async function startServer() {
  try {
    await connectDB(); // Ensure database connection is established
    console.log("MongoDB connected successfully");

    // Routes
    app.use("/api/auth", require("./routes/auth"));
    app.use("/api/songs", require("./routes/songs"));

    // Global Error Handler
    app.use((err, req, res, next) => {
      console.error("Global Error:", err.stack);
      res.status(err.status || 500).json({
        message: err.message || "Something went wrong!"
      });
    });

    // Start the server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error("Error starting server:", err.message);
    process.exit(1); // Exit process with failure
  }
}

startServer();
