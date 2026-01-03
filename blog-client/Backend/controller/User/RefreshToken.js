const RefreshToken = require('../../model/User/RefreshToken');
const { 
    generateAccessToken, 
    verifyRefreshToken 
} = require('../../utils/tokenUtils');

const RefreshTokenController = async (req, res) => {
    try {
        // Get refresh token from cookies or request body
        const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({
                message: 'Refresh token not provided',
                success: false,
                error: true
            });
        }

        // Verify refresh token
        let decoded;
        try {
            decoded = verifyRefreshToken(refreshToken);
        } catch (err) {
            // If token is expired or invalid, remove it from database
            await RefreshToken.deleteOne({ token: refreshToken });
            
            return res.status(401).json({
                message: err.name === 'TokenExpiredError' 
                    ? 'Refresh token has expired, please login again' 
                    : 'Invalid refresh token',
                success: false,
                error: true
            });
        }

        // Check if refresh token exists in database
        const storedToken = await RefreshToken.findOne({ 
            token: refreshToken,
            userId: decoded.data._id
        });

        if (!storedToken) {
            return res.status(401).json({
                message: 'Refresh token not found or has been revoked',
                success: false,
                error: true
            });
        }

        // Check if token is expired in database
        if (new Date() > storedToken.expiresAt) {
            await RefreshToken.deleteOne({ _id: storedToken._id });
            return res.status(401).json({
                message: 'Refresh token has expired, please login again',
                success: false,
                error: true
            });
        }

        // Generate new access token
        const tokenData = {
            _id: decoded.data._id,
            username: decoded.data.username
        };

        const newAccessToken = generateAccessToken(tokenData);

        // Cookie options for new access token
        const accessTokenOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
            maxAge: 15 * 60 * 1000 // 15 minutes
        };

        // Send new access token
        res
            .cookie('accessToken', newAccessToken, accessTokenOptions)
            .json({
                message: 'Token refreshed successfully',
                data: {
                    accessToken: newAccessToken,
                    accessTokenExpiresIn: 900 // 15 minutes in seconds
                },
                success: true,
                error: false
            });

        console.log("New Access Token generated for user:", decoded.data.username);
    } catch (error) {
        console.error("Refresh token error:", error);
        return res.status(500).json({
            message: 'Internal server error',
            success: false,
            error: true
        });
    }
};

module.exports = RefreshTokenController;
