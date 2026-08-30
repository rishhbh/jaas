import { googleClient } from '../config/google.js';
import User from '../models/User.js';
import { generateAccessToken, generateRefreshToken, hashToken } from '../utils/token.js';

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

    if (!user) {
      user = await User.create({
        name: payload.name,
        email: payload.email,
        avatar: payload.picture,
        provider: 'google',
        providerId: payload.sub,
        isVerified: true,
      });
    } else {
      if (!user.providerId) {
        user.provider = 'google';
        user.providerId = payload.sub;
      }

      if (!user.avatar) {
        user.avatar = payload.picture;
      }

      user.isVerified = true;
    }

    generateAccessToken(user, res);

    const refreshToken = generateRefreshToken(user, res);

    user.refreshToken = hashToken(refreshToken);

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully',
    });
  } catch (err) {
    next(err);
  }
};
