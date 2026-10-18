import { Router } from 'express';
import {
  User, Application, Shelter, BloodRequest, Donor, Volunteer,
  Scholarship, Alert, Hotline, Welfare, VolunteerEvent,
} from '../models/index.js';
import { protect, adminOnly } from '../middleware/auth.js';

const r = Router();
r.use(protect, adminOnly);

// ---------------- Stats ----------------
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

// ---------------- Applications ----------------
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

// ---------------- Content management (add / edit / delete) ----------------
// Works for: scholarships, alerts, shelters, hotlines, welfare, events
const CONTENT = {
  scholarships: Scholarship,
  alerts: Alert,
  shelters: Shelter,
  hotlines: Hotline,
  welfare: Welfare,
  events: VolunteerEvent,
};
const READONLY = new Set(['_id', '__v', 'createdAt', 'updatedAt', 'joined']);

const getModel = (req, res) => {
  const M = CONTENT[req.params.type];
  if (!M) res.status(404).json({ message: 'Unknown content type' });
  return M;
};

// keep only fields that exist in the schema (blocks junk / injected fields)
const clean = (M, body) => {
  const out = {};
  for (const key of Object.keys(M.schema.paths)) {
    if (READONLY.has(key) || !(key in body)) continue;
    let v = body[key];
    if (v === '') v = M.schema.paths[key].instance === 'String' ? '' : null;
    out[key] = v;
  }
  return out;
};

r.get('/content/:type', async (req, res) => {
  const M = getModel(req, res);
  if (M) res.json(await M.find().sort({ createdAt: -1 }).limit(300));
});

r.post('/content/:type', async (req, res) => {
  const M = getModel(req, res);
  if (!M) return;
  res.status(201).json(await M.create(clean(M, req.body)));
});

r.put('/content/:type/:id', async (req, res) => {
  const M = getModel(req, res);
  if (!M) return;
  const doc = await M.findByIdAndUpdate(req.params.id, clean(M, req.body), { new: true, runValidators: true });
  if (!doc) return res.status(404).json({ message: 'Item not found' });
  res.json(doc);
});

r.delete('/content/:type/:id', async (req, res) => {
  const M = getModel(req, res);
  if (!M) return;
  const doc = await M.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Item not found' });
  res.json({ ok: true });
});

// ---------------- Blood moderation ----------------
r.get('/blood/requests', async (req, res) => {
  res.json(await BloodRequest.find().sort({ createdAt: -1 }).limit(300));
});
r.delete('/blood/requests/:id', async (req, res) => {
  await BloodRequest.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});
r.get('/blood/donors', async (req, res) => {
  res.json(await Donor.find().sort({ createdAt: -1 }).limit(300));
});
r.delete('/blood/donors/:id', async (req, res) => {
  await Donor.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

// ---------------- Users ----------------
r.get('/users', async (req, res) => {
  const q = {};
  if (req.query.q) {
    const rx = new RegExp(String(req.query.q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    q.$or = [{ name: rx }, { email: rx }, { phone: rx }];
  }
  res.json(await User.find(q).select('-password -savedScholarships').sort({ createdAt: -1 }).limit(300));
});

r.patch('/users/:id', async (req, res) => {
  if (String(req.params.id) === String(req.user._id)) {
    return res.status(400).json({ message: 'You cannot change your own role or block yourself' });
  }
  const update = {};
  if (typeof req.body.blocked === 'boolean') update.blocked = req.body.blocked;
  if (['user', 'student', 'volunteer', 'admin'].includes(req.body.role)) update.role = req.body.role;
  const doc = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-password -savedScholarships');
  if (!doc) return res.status(404).json({ message: 'User not found' });
  res.json(doc);
});

r.delete('/users/:id', async (req, res) => {
  if (String(req.params.id) === String(req.user._id)) return res.status(400).json({ message: 'You cannot delete yourself' });
  await User.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

export default r;