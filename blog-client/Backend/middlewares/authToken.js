const jwt = require('jsonwebtoken');
const { verifyAccessToken } = require('../utils/tokenUtils');

async function authToken(req, res, next) {
  try {
    // Extract access token from cookies or authorization header
    const accessToken = req.cookies?.accessToken || 
                        req.cookies?.token || // Backward compatibility
                        req.headers.authorization?.split(' ')[1];

    if (!accessToken) {
      return res.status(401).json({
        message: "No access token provided",
        data: [],
        error: true,
        success: false,
        tokenExpired: false
      });
    }

    // Verify the access token
    try {
      const decoded = verifyAccessToken(accessToken);
      // Save the decoded user data to the request object
      req.user = decoded.data;
      console.log('Decoded User:', req.user); // For debugging, remove in production
      next(); // Continue to the next middleware or route handler
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          message: "Access token has expired",
          data: [],
          error: true,
          success: false,
          tokenExpired: true // Flag to trigger token refresh on frontend
        });
      }
      
      return res.status(401).json({
        message: "Invalid access token, please login again",
        data: [],
        error: true,
        success: false,
        tokenExpired: false
      });
    }
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(500).json({
      message: "An error occurred during authentication",
      data: [],
      error: true,
      success: false
    });
  }
}

module.exports = authToken;
