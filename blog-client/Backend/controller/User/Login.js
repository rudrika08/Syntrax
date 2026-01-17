const UserModel = require('../../model/User/UserModel');
const RefreshToken = require('../../model/User/RefreshToken');
const bcrypt = require('bcryptjs');
const { 
    generateAccessToken, 
    generateRefreshToken, 
    getRefreshTokenExpiry 
} = require('../../utils/tokenUtils');

const LoginController = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if required fields are present
        if (!username || !password) {
            return res.status(400).json({ message: 'All fields are required', success: false });
        }

        // Check if the user exists
        const user = await UserModel.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'User not found', success: false });
        }

        // Check if the password is correct
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect password', success: false });
        }

        // Check if JWT secrets are available
        if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
            return res.status(500).json({ message: 'JWT secrets not found', success: false });
        }

        // Token data payload
        const tokenData = {
            _id: user._id,
            username: user.username
        };

        // Generate Access Token (short-lived)
        const accessToken = generateAccessToken(tokenData);

        // Generate Refresh Token (long-lived)
        const refreshToken = generateRefreshToken(tokenData);

        // Calculate refresh token expiry date
        const refreshTokenExpiry = new Date(Date.now() + getRefreshTokenExpiry());

        // Remove any existing refresh tokens for this user (optional: for single device login)
        await RefreshToken.deleteMany({ userId: user._id });

        // Store refresh token in database
        await RefreshToken.create({
            userId: user._id,
            token: refreshToken,
            expiresAt: refreshTokenExpiry
        });

        // Cookie options for access token
        const accessTokenOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'none', 
        };

        // Cookie options for refresh token
        const refreshTokenOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        };

        // Send tokens in cookies and response
        res
            .cookie('accessToken', accessToken, accessTokenOptions)
            .cookie('refreshToken', refreshToken, refreshTokenOptions)
            .json({
                message: "Signin successful",
                data: {
                    accessToken,
                    refreshToken,
                    accessTokenExpiresIn: 900, // 15 minutes in seconds
                    refreshTokenExpiresIn: 604800 // 7 days in seconds
                },
                success: true
            });

        console.log("Access Token:", accessToken);
        console.log("Refresh Token generated for user:", user.username);
    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ message: 'Internal server error', success: false });
    }
};

module.exports = LoginController;
