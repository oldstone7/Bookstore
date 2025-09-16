const { Pool } = require('pg');
require('dotenv').config();

// Local PostgreSQL configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false, // No SSL needed for local development
  // Local PostgreSQL settings
  max: 10, // More connections allowed for local development
  min: 5, // Keep some connections alive
  idleTimeoutMillis: 30000, // 30 seconds
  connectionTimeoutMillis: 5000, // 5 seconds timeout
  // Local development settings
  allowExitOnIdle: false,
});

// Handle pool errors gracefully (don't exit on Supabase connection issues)
pool.on('error', (err) => {
  console.error('Database pool error:', err.message);
  // Don't exit the process, just log the error
  // Supabase connections can be unstable, so we handle it gracefully
});

// Handle client errors
pool.on('connect', (client) => {
  console.log('📡 New database client connected');
});

pool.on('remove', (client) => {
  console.log('📡 Database client removed from pool');
});

// Test the database connection with better error handling
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Successfully connected to the database');
    client.release();
  } catch (err) {
    console.error('❌ Error connecting to the database:', err.message);
    console.error('Please check your DATABASE_URL in the .env file');
    // Don't exit the process, just log the error
    console.log('⚠️  Server will continue running, but database operations may fail');
  }
};

// Test connection on startup (non-blocking)
testConnection();

module.exports = pool;
