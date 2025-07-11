const UserModel = require('../../model/User/UserModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

        // Check if JWT_SECRET is available
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ message: 'JWT secret not found', success: false });
        }

        // Generate a JWT token
        const tokenData = {
            _id: user._id,
            username: user.username
        };

        const token = jwt.sign(
            { data: tokenData },
            process.env.JWT_SECRET,
            { expiresIn: '1h' } 
        );

        // Cookie options
        const tokenOptions = {
            // domain: '.vercel.app',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'none', 
        };

        // Send the token in a cookie and the response
        res.cookie('token', token, tokenOptions).json({
            message: "Signin successful",
            data: {
                token,
                expiresIn: 3600 
            },
            success: true
        });
    console.log("token", token);
    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ message: 'Internal server error', success: false });
    }
};

module.exports = LoginController;
