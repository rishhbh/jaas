import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    let token = req.cookies?.accessToken;

    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      // Unauthenticated Guest Mode
      req.user = null;
      return next();
    }

    const secret = process.env.ACCESS_TOKEN_SECRET || 'access_secret_key_123';
    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id);
    if (!user) {
      req.user = null;
      return next();
    }

    req.user = user;
    next();
  } catch (error) {
    // If token verification fails, fall back to guest mode gracefully
    req.user = null;
    next();
  }
};

export default protect;
