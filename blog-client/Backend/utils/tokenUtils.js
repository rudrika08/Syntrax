const jwt = require('jsonwebtoken');

// Generate Access Token (short-lived: 15 minutes)
const generateAccessToken = (userData) => {
    return jwt.sign(
        { data: userData },
        process.env.JWT_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m' }
    );
};

// Generate Refresh Token (long-lived: 7 days)
const generateRefreshToken = (userData) => {
    return jwt.sign(
        { data: userData },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d' }
    );
};

// Verify Access Token
const verifyAccessToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};

// Verify Refresh Token
const verifyRefreshToken = (token) => {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

// Get expiry time in milliseconds for refresh token
const getRefreshTokenExpiry = () => {
    const expiry = process.env.REFRESH_TOKEN_EXPIRY || '7d';
    const value = parseInt(expiry);
    const unit = expiry.slice(-1);
    
    switch(unit) {
        case 'd': return value * 24 * 60 * 60 * 1000;
        case 'h': return value * 60 * 60 * 1000;
        case 'm': return value * 60 * 1000;
        default: return 7 * 24 * 60 * 60 * 1000; // Default 7 days
    }
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    getRefreshTokenExpiry
};
