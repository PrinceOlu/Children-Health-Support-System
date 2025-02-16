require('dotenv').config();
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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

        const token = jwt.sign({ userId: result.rows[0].id,email: result.rows[0].email }, process.env.JWT_SECRET, { expiresIn: '1h' });

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

        // Query the database first
        const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (user.rows.length === 0) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.rows[0].password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Create a new JWT token
        const token = jwt.sign(
            { 
                email: user.rows[0].email,  // Keep email as the primary identifier
                userId: user.rows[0].id     // Include userId as secondary
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );

        // Cache in Redis
        try {
            await redisClient.setEx(email, 3600, token);
        } catch (redisError) {
            console.error("Redis caching error:", redisError);
        }

        res.json({
            msg: 'Login successful',
            token,
            user: {
                id: user.rows[0].id,
                name: user.rows[0].name,
                email: user.rows[0].email
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ msg: 'Server error' });
    }
};

const logoutUser = async (req, res) => {
    console.log("=== Logout Controller Debug ===");
    console.log("Received req.user:", req.user);
    
    try {
        if (!req.user || !req.user.email) {
            console.log("Invalid user data:", req.user);
            return res.status(401).json({ 
                msg: 'Not authenticated',
                debug: { 
                    userExists: !!req.user,
                    receivedUser: req.user
                }
            });
        }

        console.log("Attempting to logout user:", req.user.email);
        
        // Remove token from Redis
        await redisClient.del(req.user.email);
        
        res.json({ 
            msg: 'Logout successful',
            email: req.user.email
        });
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ 
            msg: 'Server error',
            error: error.message
        });
    }
};
module.exports = {
    registerUser, loginUser, logoutUser
}