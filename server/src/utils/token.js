import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export const generateAccessToken = (user, res) => {
  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.ACCESS_TOKEN_SECRET || 'access_secret_key_123',
    { expiresIn: '5m' }
  );

  res.cookie('accessToken', token, {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    maxAge: 5 * 60 * 1000, // 5 minutes in ms
  });

  return token;
};

export const generateRefreshToken = (user, res) => {
  const token = jwt.sign(
    { id: user._id },
    process.env.REFRESH_TOKEN_SECRET || 'refresh_secret_key_123',
    { expiresIn: '15d' }
  );

  res.cookie('refreshToken', token, {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days in ms
  });

  return token;
};

export const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};
