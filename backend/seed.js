import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import {
  User, Donor, Scholarship, Alert, Shelter, Hotline, Welfare, VolunteerEvent, BloodRequest,
} from './models/index.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/jonoseba_db';
const daysFromNow = (n) => new Date(Date.now() + n * 86400000);
const monthsAgo = (n) => new Date(Date.now() - n * 30 * 86400000);

// NOTE: Scholarship deadlines, alerts, shelters and donors below are SAMPLE data for the
// project demo. Always verify real deadlines on the official links before applying.
const scholarships = [
  {
    titleBn: 'প্রধানমন্ত্রীর শিক্ষা সহায়তা ট্রাস্ট বৃত্তি', titleEn: "Prime Minister's Education Assistance Trust Stipend",
    providerBn: 'প্রধানমন্ত্রীর শিক্ষা সহায়তা ট্রাস্ট', providerEn: "PM's Education Assistance Trust",
    descBn: 'মাধ্যমিক থেকে স্নাতক পর্যায়ের মেধাবী ও অসচ্ছল শিক্ষার্থীদের জন্য সরকারি উপবৃত্তি।',
    descEn: 'Government stipend for meritorious and financially needy students from secondary to undergraduate level.',
    benefitsBn: 'বার্ষিক শিক্ষা উপবৃত্তি', benefitsEn: 'Annual education stipend',
    category: 'govt', country: 'Bangladesh', levels: ['secondary', 'higher-secondary', 'undergraduate'],
    minGpa: 4.0, gpaScale: 5, fullyFunded: false, deadline: daysFromNow(45), link: 'https://www.pmeat.gov.bd',
  },
  {
    titleBn: 'তুর্কিয়ে বুরসলারি বৃত্তি', titleEn: 'Türkiye Burslari Scholarship',
    providerBn: 'তুরস্ক সরকার', providerEn: 'Government of Türkiye',
    descBn: 'তুরস্কের বিশ্ববিদ্যালয়ে স্নাতক, মাস্টার্স ও পিএইচডির জন্য সম্পূর্ণ অর্থায়িত বৃত্তি।',
    descEn: 'Fully funded scholarship for undergraduate, master’s and PhD study in Türkiye.',
    benefitsBn: 'টিউশন, আবাসন, মাসিক ভাতা, বিমান ভাড়া', benefitsEn: 'Tuition, housing, monthly stipend, airfare',
    category: 'international', country: 'Turkey', levels: ['undergraduate', 'masters', 'phd'],
    minGpa: 3.0, gpaScale: 4, fullyFunded: true, deadline: daysFromNow(120), link: 'https://www.turkiyeburslari.gov.tr',
  },
  {
    titleBn: 'কমনওয়েলথ স্কলারশিপ (যুক্তরাজ্য)', titleEn: 'Commonwealth Scholarship (UK)',
    providerBn: 'যুক্তরাজ্য সরকার (FCDO)', providerEn: 'UK FCDO',
    descBn: 'কমনওয়েলথ দেশের নাগরিকদের জন্য মাস্টার্স ও পিএইচডি বৃত্তি।',
    descEn: 'Master’s and PhD scholarships for citizens of Commonwealth countries.',
    benefitsBn: 'টিউশন, জীবনযাত্রার ভাতা, বিমান ভাড়া', benefitsEn: 'Tuition, living allowance, airfare',
    category: 'international', country: 'UK', levels: ['masters', 'phd'],
    minGpa: 3.3, gpaScale: 4, fullyFunded: true, deadline: daysFromNow(60), link: 'https://cscuk.fcdo.gov.uk',
  },
  {
    titleBn: 'শেভনিং বৃত্তি (যুক্তরাজ্য)', titleEn: 'Chevening Scholarship (UK)',
    providerBn: 'যুক্তরাজ্য সরকার', providerEn: 'UK Government',
    descBn: 'ভবিষ্যৎ নেতাদের জন্য যুক্তরাজ্যে এক বছরের মাস্টার্স বৃত্তি।',
    descEn: 'One-year master’s scholarship in the UK for future leaders; requires work experience.',
    benefitsBn: 'টিউশন, ভাতা, বিমান ভাড়া', benefitsEn: 'Tuition, stipend, airfare',
    category: 'international', country: 'UK', levels: ['masters'],
    minGpa: 3.0, gpaScale: 4, fullyFunded: true, deadline: daysFromNow(25), link: 'https://www.chevening.org',
  },
  {
    titleBn: 'ফুলব্রাইট বৃত্তি (যুক্তরাষ্ট্র)', titleEn: 'Fulbright Scholarship (USA)',
    providerBn: 'মার্কিন যুক্তরাষ্ট্র সরকার', providerEn: 'US Government',
    descBn: 'যুক্তরাষ্ট্রে মাস্টার্স ও পিএইচডির জন্য মর্যাদাপূর্ণ বৃত্তি।',
    descEn: 'Prestigious scholarship for master’s and PhD study in the US.',
    benefitsBn: 'টিউশন, বিমান ভাড়া, মাসিক ভাতা', benefitsEn: 'Tuition, airfare, monthly stipend',
    category: 'international', country: 'USA', levels: ['masters', 'phd'],
    minGpa: 3.3, gpaScale: 4, fullyFunded: true, deadline: daysFromNow(150), link: 'https://bd.usembassy.gov',
  },
  {
    titleBn: 'মনবুকাগাকুশো (MEXT) বৃত্তি – জাপান', titleEn: 'MEXT Scholarship (Japan)',
    providerBn: 'জাপান সরকার', providerEn: 'Government of Japan',
    descBn: 'জাপানের বিশ্ববিদ্যালয়ে স্নাতক ও স্নাতকোত্তর গবেষণার জন্য সম্পূর্ণ অর্থায়িত বৃত্তি।',
    descEn: 'Fully funded scholarship for undergraduate and graduate study in Japan.',
    benefitsBn: 'টিউশন মওকুফ, মাসিক ভাতা, বিমান ভাড়া', benefitsEn: 'Tuition waiver, monthly allowance, airfare',
    category: 'international', country: 'Japan', levels: ['undergraduate', 'masters', 'phd'],
    minGpa: 3.0, gpaScale: 4, fullyFunded: true, deadline: daysFromNow(200), link: 'https://www.studyinjapan.go.jp',
  },
  {
    titleBn: 'DAAD বৃত্তি – জার্মানি', titleEn: 'DAAD Scholarship (Germany)',
    providerBn: 'জার্মান একাডেমিক এক্সচেঞ্জ সার্ভিস', providerEn: 'German Academic Exchange Service',
    descBn: 'জার্মানিতে মাস্টার্স ও গবেষণার জন্য বৃত্তি।',
    descEn: 'Scholarships for master’s and doctoral study in Germany.',
    benefitsBn: 'মাসিক ভাতা, স্বাস্থ্য বীমা, ভ্রমণ ভাতা', benefitsEn: 'Monthly stipend, health insurance, travel allowance',
    category: 'international', country: 'Germany', levels: ['masters', 'phd'],
    minGpa: 3.0, gpaScale: 4, fullyFunded: true, deadline: daysFromNow(90), link: 'https://www.daad.de/en/',
  },
  {
    titleBn: 'চায়না গভর্নমেন্ট স্কলারশিপ (CSC)', titleEn: 'Chinese Government Scholarship (CSC)',
    providerBn: 'চীন সরকার', providerEn: 'Government of China',
    descBn: 'চীনের বিশ্ববিদ্যালয়ে স্নাতক, মাস্টার্স ও পিএইচডির জন্য সম্পূর্ণ বা আংশিক বৃত্তি।',
    descEn: 'Full or partial scholarship for undergraduate, master’s and PhD study in China.',
    benefitsBn: 'টিউশন, আবাসন, মাসিক ভাতা', benefitsEn: 'Tuition, accommodation, monthly stipend',
    category: 'international', country: 'China', levels: ['undergraduate', 'masters', 'phd'],
    minGpa: 3.0, gpaScale: 4, fullyFunded: true, deadline: daysFromNow(170), link: 'https://www.campuschina.org',
  },
  {
    titleBn: 'আইফেল এক্সিলেন্স স্কলারশিপ (ফ্রান্স)', titleEn: 'Eiffel Excellence Scholarship (France)',
    providerBn: 'ফ্রান্সের পররাষ্ট্র মন্ত্রণালয়', providerEn: 'French Ministry for Europe and Foreign Affairs',
    descBn: 'মেধাবী বিদেশি শিক্ষার্থীদের জন্য ফ্রান্সে মাস্টার্স ও পিএইচডি বৃত্তি।',
    descEn: 'Master’s and PhD scholarship in France for top international students.',
    benefitsBn: 'মাসিক ভাতা, ভ্রমণ, স্বাস্থ্য বীমা', benefitsEn: 'Monthly allowance, travel, health insurance',
    category: 'international', country: 'France', levels: ['masters', 'phd'],
    minGpa: 3.3, gpaScale: 4, fullyFunded: false, deadline: daysFromNow(80), link: 'https://www.campusfrance.org',
  },
  {
    titleBn: 'বুয়েট ডিনস লিস্ট ও মেধা বৃত্তি', titleEn: "BUET Dean's List & Merit Stipend",
    providerBn: 'বাংলাদেশ প্রকৌশল বিশ্ববিদ্যালয়', providerEn: 'BUET',
    descBn: 'বুয়েটের স্নাতক শিক্ষার্থীদের জন্য মেধাভিত্তিক বৃত্তি ও টিউশন মওকুফ।',
    descEn: 'Merit-based stipend and fee waiver for BUET undergraduate students.',
    benefitsBn: 'টিউশন মওকুফ ও এক্সিলেন্স অ্যাওয়ার্ড', benefitsEn: 'Tuition waiver and excellence award',
    category: 'university', country: 'Bangladesh', levels: ['undergraduate'],
    minGpa: 3.75, gpaScale: 4, fullyFunded: false, deadline: null, link: 'https://www.buet.ac.bd',
  },
  {
    titleBn: 'ঢাকা বিশ্ববিদ্যালয় ট্রাস্ট ফান্ড বৃত্তি', titleEn: 'Dhaka University Trust Fund Scholarship',
    providerBn: 'ঢাকা বিশ্ববিদ্যালয়', providerEn: 'University of Dhaka',
    descBn: 'বিভিন্ন অনুষদের মেধাবী ও অসচ্ছল শিক্ষার্থীদের জন্য বৃত্তি।',
    descEn: 'Scholarships for meritorious and needy students across faculties.',
    benefitsBn: 'সেমিস্টার ভিত্তিক আর্থিক সহায়তা', benefitsEn: 'Semester-based financial support',
    category: 'university', country: 'Bangladesh', levels: ['undergraduate', 'masters'],
    minGpa: 3.5, gpaScale: 4, fullyFunded: false, deadline: null, link: 'https://www.du.ac.bd',
  },
  {
    titleBn: 'বিইউপি মেধা বৃত্তি', titleEn: 'BUP Merit Scholarship',
    providerBn: 'বাংলাদেশ ইউনিভার্সিটি অব প্রফেশনালস', providerEn: 'Bangladesh University of Professionals',
    descBn: 'সেমিস্টারে শীর্ষ ফলাফল অর্জনকারীদের জন্য ফি মওকুফ।',
    descEn: 'Fee waivers for top-ranking students each semester.',
    benefitsBn: 'টিউশন ফি মওকুফ', benefitsEn: 'Tuition fee waiver',
    category: 'university', country: 'Bangladesh', levels: ['undergraduate', 'masters'],
    minGpa: 3.7, gpaScale: 4, fullyFunded: false, deadline: null, link: 'https://www.bup.edu.bd',
  },
];

const alerts = [
  {
    titleBn: 'বন্যা সতর্কতা: সিলেট ও সুনামগঞ্জ', titleEn: 'Flood warning: Sylhet & Sunamganj',
    bodyBn: 'সুরমা ও কুশিয়ারা নদীর পানি বিপদসীমার কাছাকাছি। নিম্নাঞ্চলের বাসিন্দাদের সতর্ক থাকতে বলা হয়েছে। (ডেমো ডেটা)',
    bodyEn: 'Surma and Kushiyara rivers are near danger level. Residents of low-lying areas should stay alert. (Demo data)',
    district: 'Sylhet', type: 'flood', level: 'red', source: 'BWDB Flood Forecasting & Warning Centre', sourceUrl: 'https://www.ffwc.gov.bd',
  },
  {
    titleBn: 'নদী ভাঙন সতর্কতা: কুড়িগ্রাম', titleEn: 'River erosion alert: Kurigram',
    bodyBn: 'ব্রহ্মপুত্র ও ধরলা তীরবর্তী এলাকায় ভাঙনের ঝুঁকি বেড়েছে। (ডেমো ডেটা)',
    bodyEn: 'Erosion risk has risen along the Brahmaputra and Dharla banks. (Demo data)',
    district: 'Kurigram', type: 'erosion', level: 'orange', source: 'BWDB', sourceUrl: 'https://www.ffwc.gov.bd',
  },
  {
    titleBn: 'ঘূর্ণিঝড় প্রস্তুতি: নোয়াখালী', titleEn: 'Cyclone preparedness: Noakhali',
    bodyBn: 'বঙ্গোপসাগরে লঘুচাপের কারণে উপকূলীয় জেলায় ৩ নম্বর সতর্ক সংকেত। (ডেমো ডেটা)',
    bodyEn: 'Signal 3 for coastal districts due to a low pressure area in the Bay of Bengal. (Demo data)',
    district: 'Noakhali', type: 'cyclone', level: 'yellow', source: 'Bangladesh Meteorological Department', sourceUrl: 'https://www.bmd.gov.bd',
  },
];

const shelters = [
  { nameBn: 'সরকারি জুবিলী উচ্চ বিদ্যালয় আশ্রয়কেন্দ্র', nameEn: 'Government Jubilee High School Shelter', addressBn: 'জিন্দাবাজার, সিলেট সদর', addressEn: 'Zindabazar, Sylhet Sadar', district: 'Sylhet', capacity: 1200, occupied: 850, officerBn: 'জনাব রফিকুল ইসলাম', officerEn: 'Mr. Rafiqul Islam', phone: '01700000000' },
  { nameBn: 'সুনামগঞ্জ সরকারি কলেজ আশ্রয়কেন্দ্র', nameEn: 'Sunamganj Government College Shelter', addressBn: 'কলেজ রোড, সুনামগঞ্জ সদর', addressEn: 'College Road, Sunamganj Sadar', district: 'Sunamganj', capacity: 1500, occupied: 1120, officerBn: 'ড. এনামুল হক', officerEn: 'Dr. Enamul Haque', phone: '01800000000' },
  { nameBn: 'কুড়িগ্রাম সদর সাইক্লোন শেল্টার', nameEn: 'Kurigram Sadar Cyclone Shelter', addressBn: 'কুড়িগ্রাম সদর', addressEn: 'Kurigram Sadar', district: 'Kurigram', capacity: 600, occupied: 120, officerBn: 'জনাব আব্দুল করিম', officerEn: 'Mr. Abdul Karim', phone: '01900000000' },
  { nameBn: 'নোয়াখালী উপকূলীয় বহুমুখী আশ্রয়কেন্দ্র', nameEn: 'Noakhali Coastal Multipurpose Shelter', addressBn: 'হাতিয়া, নোয়াখালী', addressEn: 'Hatiya, Noakhali', district: 'Noakhali', capacity: 900, occupied: 90, officerBn: 'জনাব সালাউদ্দিন', officerEn: 'Mr. Salahuddin', phone: '01600000000' },
];

const hotlines = [
  { number: '999', nameBn: 'জাতীয় জরুরি সেবা', nameEn: 'National Emergency Service', descBn: 'পুলিশ, ফায়ার সার্ভিস ও অ্যাম্বুলেন্সের জন্য ২৪ ঘণ্টা টোল-ফ্রি নম্বর।', descEn: 'Free 24/7 line for police, fire service and ambulance.', color: 'primary', icon: 'fa-shield-halved' },
  { number: '102', nameBn: 'ফায়ার সার্ভিস ও সিভিল ডিফেন্স', nameEn: 'Fire Service & Civil Defence', descBn: 'অগ্নিকাণ্ড, ভবন ধস বা উদ্ধার অভিযানে।', descEn: 'For fires, building collapse and rescue operations.', color: 'danger', icon: 'fa-fire-extinguisher' },
  { number: '16263', nameBn: 'স্বাস্থ্য বাতায়ন', nameEn: 'Shastho Batayon (Health)', descBn: 'সরকারি স্বাস্থ্য পরামর্শ ও চিকিৎসক সেবা।', descEn: 'Government health advice and doctor consultation.', color: 'success', icon: 'fa-hospital-user' },
  { number: '109', nameBn: 'নারী ও শিশু নির্যাতন প্রতিরোধ', nameEn: 'Violence Against Women & Children', descBn: 'নারী ও শিশুর প্রতি সহিংসতা রোধে টোল-ফ্রি হেল্পলাইন।', descEn: 'Toll-free helpline against violence towards women and children.', color: 'warning', icon: 'fa-hands-holding-child' },
  { number: '1098', nameBn: 'শিশু হেল্পলাইন', nameEn: 'Child Helpline', descBn: 'বিপদগ্রস্ত শিশুদের সহায়তার জন্য।', descEn: 'Support for children in need or danger.', color: 'warning', icon: 'fa-child' },
  { number: '333', nameBn: 'জাতীয় তথ্য বাতায়ন', nameEn: 'National Information Service', descBn: 'সরকারি সেবার তথ্য ও অভিযোগ জানাতে।', descEn: 'Information about government services and complaints.', color: 'info', icon: 'fa-circle-info' },
  { number: '16430', nameBn: 'জাতীয় আইনগত সহায়তা', nameEn: 'National Legal Aid', descBn: 'বিনামূল্যে আইনি সহায়তা পেতে।', descEn: 'Free legal aid services.', color: 'secondary', icon: 'fa-gavel' },
  { number: '106', nameBn: 'দুদক হটলাইন', nameEn: 'ACC Anti-Corruption Hotline', descBn: 'দুর্নীতি সংক্রান্ত অভিযোগ জানাতে।', descEn: 'Report corruption complaints.', color: 'secondary', icon: 'fa-scale-balanced' },
];

const welfare = [
  { key: 'old-age', titleBn: 'বয়স্ক ভাতা', titleEn: 'Old Age Allowance', descBn: 'প্রবীণ ও অসচ্ছল নাগরিকদের জন্য মাসিক আর্থিক সহায়তা।', descEn: 'Monthly financial support for elderly, low-income citizens.', monthly: 600, minAge: 62, gender: 'any', requires: 'none', ageNoteBn: 'পুরুষ ৬৫+, নারী ৬২+ বছর', ageNoteEn: 'Men 65+, women 62+', color: 'success' },
  { key: 'widow', titleBn: 'বিধবা ও স্বামী নিগৃহীতা ভাতা', titleEn: 'Widow & Deserted Women Allowance', descBn: 'অসহায় বিধবা ও স্বামী পরিত্যক্তা নারীদের জন্য সহায়তা।', descEn: 'Support for destitute widows and deserted women.', monthly: 500, minAge: 18, gender: 'female', requires: 'widow', ageNoteBn: 'বিধবা বা স্বামী পরিত্যক্তা নারী', ageNoteEn: 'Widowed or deserted women', color: 'primary' },
  { key: 'disability', titleBn: 'অসচ্ছল প্রতিবন্ধী ভাতা', titleEn: 'Disability Allowance', descBn: 'সমাজসেবা অধিদপ্তরে নিবন্ধিত প্রতিবন্ধী ব্যক্তিদের জন্য ভাতা।', descEn: 'Allowance for persons with disabilities registered with the Department of Social Services.', monthly: 850, minAge: 0, gender: 'any', requires: 'disability', ageNoteBn: 'নিবন্ধিত প্রতিবন্ধী ব্যক্তি', ageNoteEn: 'Registered person with disability', color: 'warning' },
];

const events = [
  { titleBn: 'বন্যা দুর্গতদের মাঝে ত্রাণ বিতরণ – সিলেট', titleEn: 'Flood relief distribution – Sylhet', locationBn: 'সিলেট সদর', locationEn: 'Sylhet Sadar', date: daysFromNow(3), needed: 50, urgent: true },
  { titleBn: 'রক্তদান ও ফ্রি মেডিকেল ক্যাম্প – ঢাকা বিশ্ববিদ্যালয়', titleEn: 'Blood donation & free medical camp – Dhaka University', locationBn: 'ঢাকা বিশ্ববিদ্যালয়', locationEn: 'University of Dhaka', date: daysFromNow(10), needed: 20, urgent: false },
  { titleBn: 'উপকূলীয় এলাকায় ঘূর্ণিঝড় সচেতনতা কর্মসূচি', titleEn: 'Cyclone awareness programme – coastal area', locationBn: 'নোয়াখালী', locationEn: 'Noakhali', date: daysFromNow(18), needed: 30, urgent: false },
];

const donorSeeds = [
  ['মো. তানভীর আহমেদ', 'A+', 'Sylhet Sadar', 3],
  ['Fatema Akter', 'O+', 'Dhanmondi, Dhaka', 5],
  ['Sabbir Rahman', 'B+', 'Sunamganj Sadar', 4],
  ['Nusrat Jahan', 'AB+', 'Chattogram', 6],
  ['Rakib Hasan', 'O-', 'Dhaka', 2],
  ['Mim Chowdhury', 'A-', 'Rajshahi', 8],
  ['Imran Hossain', 'B-', 'Khulna', 4],
  ['Tasnim Ara', 'AB-', 'Barishal', 7],
].map(([name, bloodGroup, location, ago], i) => ({
  name, bloodGroup, location, phone: `0171100${String(1000 + i)}`, lastDonation: monthsAgo(ago), available: true,
}));

await mongoose.connect(MONGO_URI);
console.log('Connected. Seeding…');

await Promise.all([
  Scholarship.deleteMany({}), Alert.deleteMany({}), Shelter.deleteMany({}), Hotline.deleteMany({}),
  Welfare.deleteMany({}), VolunteerEvent.deleteMany({}), Donor.deleteMany({ user: { $exists: false } }),
]);

await Scholarship.insertMany(scholarships);
await Alert.insertMany(alerts);
await Shelter.insertMany(shelters);
await Hotline.insertMany(hotlines);
await Welfare.insertMany(welfare);
await VolunteerEvent.insertMany(events);
await Donor.insertMany(donorSeeds);

if ((await BloodRequest.countDocuments()) === 0) {
  await BloodRequest.insertMany([
    { patientName: 'Sample Patient', bloodGroup: 'B+', hospital: 'Dhaka Medical College Hospital', contactNumber: '01711000000', location: 'Dhaka', urgency: 'Emergency', details: 'Sample request – 2 bags needed (demo data).' },
  ]);
}

const adminEmail = (process.env.ADMIN_EMAIL || 'admin@jonoseba.gov.bd').toLowerCase();
if (!(await User.findOne({ email: adminEmail }))) {
  await User.create({
    name: 'Jonoseba Admin', email: adminEmail, role: 'admin',
    password: await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@12345', 10),
  });
  console.log('Admin created:', adminEmail);
}

console.log('Seed complete ✔');
await mongoose.disconnect();
