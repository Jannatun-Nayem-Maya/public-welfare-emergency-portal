import mongoose from 'mongoose';

const { Schema, model } = mongoose;
const opts = { timestamps: true };
const ref = (name) => ({ type: Schema.Types.ObjectId, ref: name });

export const User = model(
  'User',
  new Schema(
    {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, unique: true, lowercase: true, trim: true },
      password: { type: String, required: true },
      phone: String,
      nid: String,
      district: String,
      role: { type: String, enum: ['user', 'student', 'volunteer', 'admin'], default: 'user' },
      blocked: { type: Boolean, default: false },
      savedScholarships: [ref('Scholarship')],
    },
    opts
  )
);

export const BloodRequest = model(
  'BloodRequest',
  new Schema(
    {
      patientName: { type: String, required: true, trim: true },
      bloodGroup: { type: String, required: true, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
      hospital: { type: String, required: true, trim: true },
      contactNumber: { type: String, required: true, trim: true },
      location: { type: String, required: true, trim: true },
      urgency: { type: String, enum: ['Emergency', 'Within 24 Hours', 'Regular'], default: 'Emergency' },
      details: String,
      status: { type: String, enum: ['open', 'fulfilled'], default: 'open' },
      createdBy: ref('User'),
    },
    opts
  )
);

export const Donor = model(
  'Donor',
  new Schema(
    {
      user: ref('User'),
      name: { type: String, required: true, trim: true },
      bloodGroup: { type: String, required: true, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
      location: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      lastDonation: Date,
      available: { type: Boolean, default: true },
    },
    opts
  )
);

export const Scholarship = model(
  'Scholarship',
  new Schema(
    {
      titleBn: String,
      titleEn: { type: String, required: true },
      providerBn: String,
      providerEn: String,
      descBn: String,
      descEn: String,
      benefitsBn: String,
      benefitsEn: String,
      category: { type: String, enum: ['govt', 'international', 'university'], required: true },
      country: String,
      levels: [{ type: String, enum: ['secondary', 'higher-secondary', 'undergraduate', 'masters', 'phd'] }],
      minGpa: Number,
      gpaScale: { type: Number, default: 4 },
      fullyFunded: { type: Boolean, default: false },
      deadline: Date, // null = rolling / ongoing
      link: String,
    },
    opts
  )
);

export const Application = model(
  'Application',
  new Schema(
    {
      trackingId: { type: String, unique: true },
      user: ref('User'),
      type: { type: String, enum: ['relief', 'service'], required: true },
      service: String,
      applicantName: String,
      nid: String,
      phone: String,
      district: String,
      data: Schema.Types.Mixed,
      evidence: String,
      status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
      note: String,
    },
    opts
  )
);

export const Volunteer = model(
  'Volunteer',
  new Schema(
    {
      user: ref('User'),
      name: String,
      phone: String,
      bloodGroup: String,
      area: String,
      interest: String,
    },
    opts
  )
);

// ---- Public content collections (editable in Compass) ----
export const Alert = model(
  'Alert',
  new Schema(
    {
      titleBn: String, titleEn: String, bodyBn: String, bodyEn: String,
      district: String, type: { type: String, enum: ['flood', 'cyclone', 'erosion'] },
      level: { type: String, enum: ['red', 'orange', 'yellow'], default: 'yellow' },
      source: String, sourceUrl: String,
    },
    opts
  )
);

export const Shelter = model(
  'Shelter',
  new Schema(
    {
      nameBn: String, nameEn: String, addressBn: String, addressEn: String,
      district: String, capacity: Number, occupied: Number,
      officerBn: String, officerEn: String, phone: String,
      status: { type: String, default: 'open' },
    },
    opts
  )
);

export const Hotline = model(
  'Hotline',
  new Schema(
    { nameBn: String, nameEn: String, number: String, descBn: String, descEn: String, color: String, icon: String },
    opts
  )
);

export const Welfare = model(
  'Welfare',
  new Schema(
    {
      key: String, titleBn: String, titleEn: String, descBn: String, descEn: String,
      monthly: Number, minAge: Number,
      gender: { type: String, enum: ['any', 'male', 'female'], default: 'any' },
      requires: { type: String, enum: ['none', 'widow', 'disability'], default: 'none' },
      ageNoteBn: String, ageNoteEn: String, color: String,
    },
    opts
  )
);

export const VolunteerEvent = model(
  'VolunteerEvent',
  new Schema(
    {
      titleBn: String, titleEn: String, locationBn: String, locationEn: String,
      date: Date, needed: Number, urgent: { type: Boolean, default: false },
      joined: [ref('User')],
    },
    opts
  )
);