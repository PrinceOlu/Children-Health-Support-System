// lets create a controller for user
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');
const pool = require('../dbConnection/db');
const redisClient = require('../redisClient');


// controller for user registration
const registerUser = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { name, email, password } = req.body;

        // Check if user already exists
        const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (user.rows.length > 0) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert user into database
        const result = await pool.query('INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *', [name, email, hashedPassword]);

        const token = jwt.sign({ userId: result.rows[0].id }, config.get('jwtSecret'), { expiresIn: '1h' });

        res.status(201).json({ token, user: { id: result.rows[0].id, name: result.rows[0].name, email: result.rows[0].email } });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }       
}

// controller for user login, using redis for caching
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // First, check if the JWT token for this user is cached in Redis
        redisClient.get(email, async (err, cachedToken) => {
            if (err) {
                console.error("Error reading from Redis:", err);
                return res.status(500).json({ msg: 'Server error' });
            }

            // If we have a cached token, send it back without querying the database
            if (cachedToken) {
                console.log('Returning cached token');
                return res.json({ token: cachedToken });
            }

            // If no cached token, query the database
            const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

            if (user.rows.length === 0) {
                return res.status(400).json({ msg: 'Invalid credentials' });
            }

            const isMatch = await bcrypt.compare(password, user.rows[0].password);
            if (!isMatch) {
                return res.status(400).json({ msg: 'Invalid credentials' });
            }

            // Create a new JWT token
            const token = jwt.sign({ userId: user.rows[0].id }, config.get('jwtSecret'), { expiresIn: '1h' });

            // Cache the JWT token in Redis with an expiration time (e.g., 1 hour)
            redisClient.setex(email, 3600, token); // 3600 seconds = 1 hour

            // Send the response with the token and user data
            res.json({
                msg: 'Login successful',
                token,
                user: {
                    id: user.rows[0].id,
                    name: user.rows[0].name,
                    email: user.rows[0].email
                }
            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server error' });
    }
};
module.exports = {
    registerUser, loginUser
}