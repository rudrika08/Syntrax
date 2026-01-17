const UserModel = require('../../model/User/UserModel');

const UpdateProfileController = async (req, res) => {
    try {
        const userId = req.user._id;
        const { username, email, bio, profilePicture } = req.body;

        // Find user
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: 'User not found',
                success: false
            });
        }

        // Check if username is being changed and if it's already taken
        if (username && username !== user.username) {
            const existingUser = await UserModel.findOne({ username });
            if (existingUser) {
                return res.status(400).json({
                    message: 'Username already taken',
                    success: false
                });
            }
        }

        // Update fields
        if (username) user.username = username;
        if (email !== undefined) user.email = email;
        if (bio !== undefined) user.bio = bio;
        if (profilePicture !== undefined) user.profilePicture = profilePicture;

        await user.save();

        return res.status(200).json({
            message: 'Profile updated successfully',
            success: true,
            data: {
                _id: user._id,
                username: user.username,
                email: user.email,
                bio: user.bio,
                profilePicture: user.profilePicture,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        return res.status(500).json({
            message: 'Internal server error',
            success: false
        });
    }
};

module.exports = UpdateProfileController;
