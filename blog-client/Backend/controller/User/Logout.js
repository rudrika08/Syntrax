const RefreshToken = require('../../model/User/RefreshToken');

async function userLogOut(req, res) {
    try {
        // Get user ID from the authenticated request
        const userId = req.user._id;

        // Remove all refresh tokens for this user from database
        await RefreshToken.deleteMany({ userId });

        // Clear both access and refresh token cookies
        res.clearCookie('accessToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none'
        });
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none'
        });
        // Also clear old 'token' cookie if it exists (backward compatibility)
        res.clearCookie('token');

        res.json({
            message: "User Logged Out Successfully",
            error: false,
            success: true,
            data: []
        });
    } catch (error) {
        console.error("Error during signout:", error);
        res.status(500).json({
            message: "Internal Server Error",
            error: true,
            success: false
        });
    }
}

module.exports = userLogOut;