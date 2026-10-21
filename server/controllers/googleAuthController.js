const User = require('../models/User');
const googleClient = require('../config/googleAuth');

exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, error: 'Token is required' });
    }

    // Verify token using Google OAuth library
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture: profileImage } = payload;

    // Search MongoDB user by email
    let user = await User.findOne({ email });

    if (user) {
      // If user exists but didn't log in via Google before, link the account
      if (!user.googleId) {
        user.googleId = googleId;
        user.profileImage = user.profileImage || profileImage;
        user.authProvider = 'google'; // or 'local+google'
        await user.save();
      }
    } else {
      // If not exists, create new user
      user = await User.create({
        name,
        email,
        googleId,
        profileImage,
        role: 'tourist',
        authProvider: 'google',
        // Password is not provided, handled by model schema changes
      });
    }

    // Generate existing JWT token
    const jwtToken = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage
      }
    });

  } catch (error) {
    console.error('Google Auth Error:', error.message);
    res.status(401).json({ success: false, error: 'Invalid Google Token' });
  }
};
