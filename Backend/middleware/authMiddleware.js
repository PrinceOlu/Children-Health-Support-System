const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  console.log("=== Auth Middleware Debug ===");
  const token = req.header('Authorization');
  console.log("Received Authorization header:", token);

  if (!token) {
    console.log("No token provided");
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // Extract the token from "Bearer <token>"
    const tokenParts = token.split(' ');
    console.log("Token parts:", tokenParts);

    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
      console.log("Invalid token format");
      return res.status(401).json({ msg: 'Invalid token format' });
    }

    const jwtToken = tokenParts[1];
    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);
    console.log("Decoded token payload:", decoded);

    // Attach the user data to the request object
    req.user = {
      email: decoded.email,  // Make sure we capture email even if it's the only field
      userId: decoded.userId || decoded.id  // Handle both possible field names
    };

    console.log("Final req.user object:", req.user);
    return next();
  } catch (err) {
    console.error("Token verification error:", err);
    return res.status(401).json({ 
      msg: 'Token is not valid',
      error: err.message
    });
  }
};