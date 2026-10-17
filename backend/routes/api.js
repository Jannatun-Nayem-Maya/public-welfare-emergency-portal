import { Router } from 'express';
import multer from 'multer';
import {
  Alert, Shelter, Hotline, Welfare, VolunteerEvent, Volunteer, Application,
} from '../models/index.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const r = Router();

// ---- Read-only public content ----
const content = { alerts: Alert, shelters: Shelter, hotlines: Hotline, welfare: Welfare };
r.get('/content/:type', async (req, res) => {
  const Model = content[req.params.type];
  if (!Model) return res.status(404).json({ message: 'Unknown content type' });
  res.json(await Model.find().sort({ createdAt: 1 }));
});

// ---- Volunteer events ----
r.get('/events', optionalAuth, async (req, res) => {
  const events = await VolunteerEvent.find().sort({ date: 1 }).lean();
  res.json(
    events.map((e) => ({
      ...e,
      joinedCount: e.joined.length,
      joinedByMe: req.user ? e.joined.some((u) => String(u) === String(req.user._id)) : false,
      joined: undefined,
    }))
  );
});

r.post('/events/:id/join', protect, async (req, res) => {
  const ev = await VolunteerEvent.findById(req.params.id);
  if (!ev) return res.status(404).json({ message: 'Event not found' });
  const has = ev.joined.some((u) => String(u) === String(req.user._id));
  if (!has && ev.joined.length >= ev.needed) return res.status(400).json({ message: 'This event is already full' });
  ev.joined = has ? ev.joined.filter((u) => String(u) !== String(req.user._id)) : [...ev.joined, req.user._id];
  await ev.save();
  res.json({ joinedByMe: !has, joinedCount: ev.joined.length });
});

r.post('/volunteers', protect, async (req, res) => {
  const { name, phone, bloodGroup, area, interest } = req.body;
  if (!name || !phone || !area) return res.status(400).json({ message: 'Name, phone and area are required' });
  const doc = await Volunteer.findOneAndUpdate(
    { user: req.user._id },
    { user: req.user._id, name, phone, bloodGroup, area, interest },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  res.status(201).json(doc);
});

// ---- Applications (relief + general services) ----
const storage = multer.diskStorage({
  destination: 'uploads',
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/[^\w.-]/g, '_')),
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) =>
    /^(image\/(jpeg|png)|application\/pdf)$/.test(file.mimetype)
      ? cb(null, true)
      : cb(new Error('Only JPG, PNG or PDF files are allowed')),
});

r.post('/applications', protect, upload.single('evidence'), async (req, res) => {
  const { type, service, applicantName, nid, phone, district, ...rest } = req.body;
  if (!['relief', 'service'].includes(type)) return res.status(400).json({ message: 'Invalid application type' });
  if (!applicantName || !phone) return res.status(400).json({ message: 'Name and phone are required' });
  if (type === 'relief' && !req.file) return res.status(400).json({ message: 'Please upload an evidence photo or document' });
  const app = await Application.create({
    trackingId: 'JS-' + Date.now().toString(36).toUpperCase() + Math.floor(Math.random() * 90 + 10),
    user: req.user._id,
    type, service, applicantName, nid, phone, district,
    data: rest,
    evidence: req.file ? '/uploads/' + req.file.filename : undefined,
  });
  res.status(201).json(app);
});

r.get('/applications/mine', protect, async (req, res) => {
  res.json(await Application.find({ user: req.user._id }).sort({ createdAt: -1 }));
});

export default r;
