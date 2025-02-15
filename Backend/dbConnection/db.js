require('dotenv').config();
const { Sequelize } = require('sequelize');

// Create Sequelize instance
const sequelize = new Sequelize(
    process.env.DB_NAME,  // Database name
    process.env.DB_USER,  // Username
    process.env.DB_PASSWORD,  // Password
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: "postgres",
        logging: false, // Disable logging for clean output
    }
);

// Connect to the database
const connectDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to the database successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

connectDatabase();

module.exports = sequelize;
