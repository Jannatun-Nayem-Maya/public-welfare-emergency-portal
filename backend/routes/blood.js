import { Router } from 'express';
import { BloodRequest, Donor } from '../models/index.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const r = Router();
const GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ---- Blood requests ----
r.get('/requests', async (req, res) => {
  const q = {};
  if (GROUPS.includes(req.query.group)) q.bloodGroup = req.query.group;
  if (['open', 'fulfilled'].includes(req.query.status)) q.status = req.query.status;
  res.json(await BloodRequest.find(q).sort({ createdAt: -1 }).limit(100));
});

r.post('/requests', protect, async (req, res) => {
  const { patientName, bloodGroup, hospital, contactNumber, location, urgency, details } = req.body;
  if (!patientName || !GROUPS.includes(bloodGroup) || !hospital || !contactNumber || !location) {
    return res.status(400).json({ message: 'Please fill in all required fields' });
  }
  const doc = await BloodRequest.create({
    patientName, bloodGroup, hospital, contactNumber, location, urgency, details, createdBy: req.user._id,
  });
  res.status(201).json(doc);
});

r.patch('/requests/:id/fulfill', protect, async (req, res) => {
  const doc = await BloodRequest.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Request not found' });
  const owner = String(doc.createdBy) === String(req.user._id);
  if (!owner && req.user.role !== 'admin') return res.status(403).json({ message: 'Not allowed' });
  doc.status = 'fulfilled';
  await doc.save();
  res.json(doc);
});

// ---- Donors (phone numbers only visible to logged-in users) ----
r.get('/donors', optionalAuth, async (req, res) => {
  const q = { available: true };
  if (GROUPS.includes(req.query.group)) q.bloodGroup = req.query.group;
  if (req.query.location) q.location = new RegExp(escapeRegex(String(req.query.location)), 'i');
  const donors = await Donor.find(q).sort({ createdAt: -1 }).limit(100).lean();
  res.json(donors.map((d) => (req.user ? d : { ...d, phone: null })));
});

r.post('/donors', protect, async (req, res) => {
  const { name, bloodGroup, location, phone, lastDonation, available } = req.body;
  if (!name || !GROUPS.includes(bloodGroup) || !location || !phone) {
    return res.status(400).json({ message: 'Please fill in all required fields' });
  }
  const doc = await Donor.findOneAndUpdate(
    { user: req.user._id },
    { user: req.user._id, name, bloodGroup, location, phone, lastDonation: lastDonation || null, available: available !== false },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  res.status(201).json(doc);
});

r.get('/donors/mine', protect, async (req, res) => {
  res.json(await Donor.findOne({ user: req.user._id }));
});

export default r;
