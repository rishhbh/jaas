import { googleClient } from '../config/google.js';
import User from '../models/User.js';
import { generateAccessToken, generateRefreshToken, hashToken } from '../utils/token.js';
import { uploadAvatarToCloudinary } from '../services/cloudinary.service.js';

export const googleLogin = async (req, res, next) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: 'Google credential is required',
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload?.email || !payload.email_verified) {
      return res.status(401).json({
        success: false,
        message: 'Google authentication failed',
      });
    }

    let user = await User.findOne({
      email: payload.email,
    }).select('+refreshToken');

    // Process avatar through Cloudinary
    let avatarUrl = payload.picture;
    try {
      avatarUrl = await uploadAvatarToCloudinary(payload.picture, payload.sub || payload.email);
    } catch (e) {
      console.warn('Cloudinary avatar processing notice:', e.message);
    }

    if (!user) {
      user = await User.create({
        name: payload.name,
        email: payload.email,
        avatar: avatarUrl,
        provider: 'google',
        providerId: payload.sub,
        isVerified: true,
      });
    } else {
      if (!user.providerId) {
        user.provider = 'google';
        user.providerId = payload.sub;
      }

      user.avatar = avatarUrl || user.avatar;
      user.isVerified = true;
    }

    generateAccessToken(user, res);

    const refreshToken = generateRefreshToken(user, res);

    user.refreshToken = hashToken(refreshToken);

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isGuest: false,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const logoutUser = async (req, res, next) => {
  try {
    const cookieOptions = {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    };

    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (err) {
    next(err);
  }
};
