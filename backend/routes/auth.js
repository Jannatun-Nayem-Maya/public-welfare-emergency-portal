import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { protect } from '../middleware/auth.js';

const r = Router();
const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const pub = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  phone: u.phone,
  nid: u.nid,
  district: u.district,
  role: u.role,
  savedScholarships: (u.savedScholarships || []).map(String),
});

r.post('/register', async (req, res) => {
  const { name, email, password, phone, nid, district, role } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required' });
  if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
  if (await User.findOne({ email: email.toLowerCase() })) {
    return res.status(409).json({ message: 'Email already registered' });
  }
  // Admin accounts can never be self-registered
  const safeRole = ['user', 'student', 'volunteer'].includes(role) ? role : 'user';
  const user = await User.create({
    name, email, phone, nid, district,
    role: safeRole,
    password: await bcrypt.hash(password, 10),
  });
  res.status(201).json({ token: sign(user._id), user: pub(user) });
});

r.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: String(email || '').toLowerCase() });
  if (!user || !(await bcrypt.compare(password || '', user.password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  if (user.blocked) return res.status(403).json({ message: 'Your account has been blocked by the admin' });
  res.json({ token: sign(user._id), user: pub(user) });
});

r.get('/me', protect, (req, res) => res.json({ user: pub(req.user) }));

export default r;