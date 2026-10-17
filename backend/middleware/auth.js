import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

const getToken = (req) => {
  const h = req.headers.authorization || '';
  return h.startsWith('Bearer ') ? h.slice(7) : null;
};

export const protect = async (req, res, next) => {
  const token = getToken(req);
  if (!token) return res.status(401).json({ message: 'Please login first' });
  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(id);
    if (!user) throw new Error('no user');
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Session expired, please login again' });
  }
};

// Attaches req.user when a valid token is present, but never blocks the request
export const optionalAuth = async (req, res, next) => {
  const token = getToken(req);
  if (token) {
    try {
      const { id } = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(id);
    } catch {
      /* ignore */
    }
  }
  next();
};

export const adminOnly = (req, res, next) =>
  req.user?.role === 'admin' ? next() : res.status(403).json({ message: 'Admins only' });
