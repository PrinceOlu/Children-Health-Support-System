const express = require('express');
const router = express.Router();
const {registerUser, loginUser, logoutUser} = require('../Controllers/userController');
const auth = require('../middleware/authMiddleware'); // Import the auth middleware

// Public routes (no auth required)
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes (auth required)
router.post('/logout', auth, logoutUser); // Add auth middleware here

module.exports = router;