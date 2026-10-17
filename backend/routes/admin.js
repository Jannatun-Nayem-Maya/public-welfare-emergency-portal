import { Router } from 'express';
import {
  User, Application, Shelter, BloodRequest, Donor, Volunteer,
} from '../models/index.js';
import { protect, adminOnly } from '../middleware/auth.js';

const r = Router();
r.use(protect, adminOnly);

r.get('/stats', async (req, res) => {
  const [users, pending, approved, rejected, shelters, openBlood, donors, volunteers] = await Promise.all([
    User.countDocuments(),
    Application.countDocuments({ status: 'pending' }),
    Application.countDocuments({ status: 'approved' }),
    Application.countDocuments({ status: 'rejected' }),
    Shelter.countDocuments({ status: 'open' }),
    BloodRequest.countDocuments({ status: 'open' }),
    Donor.countDocuments(),
    Volunteer.countDocuments(),
  ]);
  res.json({ users, pending, approved, rejected, shelters, openBlood, donors, volunteers });
});

r.get('/applications', async (req, res) => {
  const q = {};
  if (['pending', 'approved', 'rejected'].includes(req.query.status)) q.status = req.query.status;
  res.json(await Application.find(q).sort({ createdAt: -1 }).limit(200));
});

r.patch('/applications/:id', async (req, res) => {
  const { status, note } = req.body;
  if (!['approved', 'rejected', 'pending'].includes(status)) return res.status(400).json({ message: 'Invalid status' });
  const doc = await Application.findByIdAndUpdate(req.params.id, { status, note }, { new: true });
  if (!doc) return res.status(404).json({ message: 'Application not found' });
  res.json(doc);
});

export default r;
