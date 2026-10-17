import { Router } from 'express';
import { Scholarship, User } from '../models/index.js';
import { protect } from '../middleware/auth.js';

const r = Router();

r.get('/', async (req, res) => {
  res.json(await Scholarship.find().sort({ deadline: 1 }));
});

// Toggle bookmark for the logged-in user
r.post('/:id/save', protect, async (req, res) => {
  const id = String(req.params.id);
  const user = await User.findById(req.user._id);
  const has = user.savedScholarships.some((s) => String(s) === id);
  user.savedScholarships = has
    ? user.savedScholarships.filter((s) => String(s) !== id)
    : [...user.savedScholarships, id];
  await user.save();
  res.json({ saved: !has, savedScholarships: user.savedScholarships.map(String) });
});

export default r;
