const UserModel = require('../../model/User/UserModel');
const RefreshToken = require('../../model/User/RefreshToken');
const { OAuth2Client } = require('google-auth-library');
const { 
    generateAccessToken, 
    generateRefreshToken, 
    getRefreshTokenExpiry 
} = require('../../utils/tokenUtils');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const GoogleAuthController = async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({ 
                message: 'Google credential is required', 
                success: false 
            });
        }

        // Verify Google token
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;

        // Check if user already exists with this Google ID
        let user = await UserModel.findOne({ googleId });

        if (!user) {
            // Check if user exists with same email (might have signed up with email/password)
            user = await UserModel.findOne({ email });

            if (user) {
                // Link Google account to existing user
                user.googleId = googleId;
                user.profilePicture = picture;
                user.authProvider = user.authProvider === 'local' ? 'local' : 'google';
                await user.save();
            } else {
                // Create new user with Google account
                // Generate a unique username from email or name
                let baseUsername = email.split('@')[0] || name.replace(/\s+/g, '').toLowerCase();
                let username = baseUsername;
                let counter = 1;

                // Ensure username is unique
                while (await UserModel.findOne({ username })) {
                    username = `${baseUsername}${counter}`;
                    counter++;
                }

                user = await UserModel.create({
                    username,
                    email,
                    googleId,
                    profilePicture: picture,
                    authProvider: 'google'
                });
            }
        }

        // Generate tokens
        const tokenData = {
            _id: user._id,
            username: user.username
        };

        const accessToken = generateAccessToken(tokenData);
        const refreshToken = generateRefreshToken(tokenData);

        // Calculate refresh token expiry date
        const refreshTokenExpiry = new Date(Date.now() + getRefreshTokenExpiry());

        // Remove any existing refresh tokens for this user
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
            maxAge: 15 * 60 * 1000 // 15 minutes
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
                message: "Google login successful",
                data: {
                    accessToken,
                    refreshToken,
                    accessTokenExpiresIn: 900,
                    refreshTokenExpiresIn: 604800,
                    user: {
                        _id: user._id,
                        username: user.username,
                        email: user.email,
                        profilePicture: user.profilePicture
                    }
                },
                success: true
            });

        console.log("Google login successful for user:", user.username);
    } catch (err) {
        console.error("Google auth error:", err);
        return res.status(500).json({ 
            message: 'Google authentication failed', 
            success: false,
            error: err.message
        });
    }
};

module.exports = GoogleAuthController;
