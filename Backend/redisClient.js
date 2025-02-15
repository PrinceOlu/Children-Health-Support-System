const redis = require('redis');
require('dotenv').config(); 

// Create a Redis client and connect to the Redis server
const redisClient = redis.createClient({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,      
});

// Check for Redis connection success
redisClient.on('connect', () => {
    console.log('Connected to Redis');
});

redisClient.on('error', (err) => {
    console.log('Error connecting to Redis:', err);
});

// Export the Redis client
module.exports = redisClient;
