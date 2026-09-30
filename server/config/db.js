/**
 * @file db.js
 * @description Database connection configuration using Mongoose for MongoDB.
 * Establishes and manages the connection lifecycle between the Express server and MongoDB Atlas/local instance.
 */

const mongoose = require('mongoose');

/**
 * connectDB
 * Connects the application to the MongoDB database using the connection string from environment variables.
 * Falls back to local MongoDB instance if neither MONGO_URI nor MONGODB_URI is provided.
 * 
 * @returns {Promise<typeof mongoose>} The active Mongoose connection instance
 */
const connectDB = async () => {
  try {
    // Resolve the MongoDB connection URI from environment variables with fallbacks:
    // 1. MONGO_URI (used by standard hosting like Render / Docker)
    // 2. MONGODB_URI (standard Heroku / Atlas convention)
    // 3. mongodb://localhost:27017/jobboard_v2 (local development default)
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/jobboard_v2';
    
    // Initiate connection with Mongoose default connection pooling
    const conn = await mongoose.connect(mongoUri);
    
    // Log connection confirmation with connected host and database name for verification
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}, database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    // Log any connection failure details (e.g., bad credentials, network timeouts)
    console.error(`[MongoDB] Connection error: ${error.message}`);
    
    // In production environments, exit process on failure so orchestrators (Render, PM2, Docker) can restart or alert
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;

