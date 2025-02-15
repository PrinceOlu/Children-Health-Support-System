require('dotenv').config();
const { Pool } = require('pg');

// Create a connection pool
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// Test database connection
const connectDatabase = async () => {
    try {
        const client = await pool.connect(); // Acquire a client from the pool
        console.log('✅ Connected to the database successfully');
        client.release(); // Release the client back to the pool
    } catch (error) {
        console.error('❌ Error connecting to the database:', error);
        process.exit(1); // Exit the process if the database connection fails
    }
};

connectDatabase();

module.exports = pool;
