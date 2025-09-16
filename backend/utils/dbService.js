// Database service with retry logic for Supabase
const pool = require('../config/db');

class DatabaseService {
  static async query(text, params = [], retries = 3) {
    let lastError;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const client = await pool.connect();
        try {
          const result = await client.query(text, params);
          return result;
        } finally {
          client.release();
        }
      } catch (error) {
        lastError = error;
        console.log(`Database query attempt ${attempt} failed:`, error.message);
        
        if (attempt < retries) {
          // Wait before retrying (exponential backoff)
          const delay = Math.pow(2, attempt) * 1000;
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
  }

  static async transaction(callback, retries = 3) {
    let lastError;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
      } catch (error) {
        await client.query('ROLLBACK');
        lastError = error;
        console.log(`Transaction attempt ${attempt} failed:`, error.message);
        
        if (attempt < retries) {
          const delay = Math.pow(2, attempt) * 1000;
          console.log(`Retrying transaction in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } finally {
        client.release();
      }
    }
    
    throw lastError;
  }
}

module.exports = DatabaseService;
