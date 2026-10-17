import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../context/LangContext.jsx';

const slides = [
  { img: 'slide1.jpg', bg: 'linear-gradient(135deg,#0d4738,#1a7a5e)', bn: ['শিক্ষা ও স্কলারশিপ তথ্য', 'দেশি-বিদেশি সরকারি ও বেসরকারি বৃত্তির তথ্য ও নির্দেশিকা।'], en: ['Education & Scholarship Info', 'Find scholarship guidance and application support easily.'], to: '/scholarship' },
  { img: 'slide2.jpg', bg: 'linear-gradient(135deg,#8f2d14,#d95d39)', bn: ['জরুরি রক্তদান সেবা', 'রক্তদাতা খুঁজুন অথবা রক্তের অনুরোধ পোস্ট করুন।'], en: ['Emergency Blood Service', 'Post emergency blood requests and connect with donors quickly.'], to: '/health' },
  { img: 'slide3.jpg', bg: 'linear-gradient(135deg,#123c5a,#2a7ab0)', bn: ['স্মার্ট নাগরিক সেবা ও ডিজিটাল নিরাপত্তা', 'নাগরিকদের তথ্য সুরক্ষায় নিরাপদ ও আধুনিক প্রযুক্তি।'], en: ['Smart Governance & Security', 'Securing citizen data with modern digital infrastructure.'], to: '/services' },
  { img: 'slide4.jpg', bg: 'linear-gradient(135deg,#3b2a63,#7457b8)', bn: ['আইনি সহায়তা ও অধিকার', 'বিনামূল্যে আইনি সহায়তা হেল্পলাইন ও নাগরিক অধিকার তথ্য।'], en: ['Legal Aid & Citizen Rights', 'Free legal aid helplines and citizen rights information.'], to: '/emergency-contacts' },
  { img: 'slide5.jpg', bg: 'linear-gradient(135deg,#0d4738,#d95d39)', bn: ['জনসেবা — এক ঠিকানায় ডিজিটাল সেবা', 'একই জায়গায় সকল প্রয়োজনীয় সরকারি ও নাগরিক সেবা।'], en: ['Jonoseba — Digital Citizen Portal', 'All essential public services in one platform.'], to: '/services' },
];

const features = [
  { to: '/health', icon: 'fa-hand-holding-droplet', tone: 'danger', bn: ['রক্তদান কেন্দ্র', 'জরুরি রক্তের অনুরোধ দিন বা রক্তদাতা খুঁজুন।', 'প্রবেশ করুন'], en: ['Blood Hub', 'Post urgent blood requests or find donors.', 'Enter Hub'] },
  { to: '/scholarship', icon: 'fa-graduation-cap', tone: 'primary', bn: ['বৃত্তি ডিরেক্টরি', 'ফিল্টার, ডেডলাইন কাউন্টডাউন ও যোগ্যতা যাচাই।', 'বিস্তারিত দেখুন'], en: ['Scholarships', 'Filters, deadline countdowns and an eligibility finder.', 'View Details'] },
  { to: '/disaster-alerts', icon: 'fa-triangle-exclamation', tone: 'warning', bn: ['দুর্যোগ সতর্কতা', 'বন্যা-ঘূর্ণিঝড়ের আপডেট ও নিকটস্থ আশ্রয়কেন্দ্র।', 'সতর্কতা দেখুন'], en: ['Disaster Alerts', 'Flood and cyclone updates with nearby shelters.', 'View Alerts'] },
  { to: '/welfare-programs', icon: 'fa-people-group', tone: 'success', bn: ['কল্যাণ কর্মসূচি', 'ভাতার যোগ্যতা যাচাই করে সরাসরি আবেদন করুন।', 'যোগ্যতা দেখুন'], en: ['Welfare Programs', 'Check allowance eligibility and apply directly.', 'Check Eligibility'] },
  { to: '/volunteer', icon: 'fa-hand-holding-heart', tone: 'accent', bn: ['স্বেচ্ছাসেবক', 'চলমান কার্যক্রমে যুক্ত হয়ে দেশের সেবা করুন।', 'যুক্ত হোন'], en: ['Volunteer', 'Join ongoing community programmes.', 'Join Now'] },
  { to: '/services', icon: 'fa-building-columns', tone: 'primary', bn: ['ই-গভর্নেন্স সেবা', 'এনআইডি, ই-পাসপোর্ট, জন্ম নিবন্ধন ও আরও অনেক সেবা।', 'সেবা দেখুন'], en: ['Citizen Services', 'NID, e-passport, birth registration and more.', 'Explore Services'] },
];

export default function Home() {
  const { t, lang } = useLang();
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setI((x) => (x + 1) % slides.length), 4500);
    return () => clearInterval(id);
  }, [paused]);

  const s = slides[i];
  const [title, sub] = lang === 'bn' ? s.bn : s.en;

  return (
    <div className="container section">
      <div className="hero" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        {slides.map((x, idx) => (
          <div
            key={x.img}
            className={`hero-slide ${idx === i ? 'active' : ''}`}
            style={{ backgroundImage: `linear-gradient(rgba(0,0,0,.25),rgba(0,0,0,.55)), url(/images/${x.img}), ${x.bg}` }}
          />
        ))}
        <div className="hero-caption">
          <h2>{title}</h2>
          <p>{sub}</p>
          <Link to={s.to} className="btn btn-accent">{t('এখনই দেখুন', 'Explore now')} <i className="fa-solid fa-arrow-right" /></Link>
        </div>
        <button className="hero-nav prev" onClick={() => setI((i - 1 + slides.length) % slides.length)} aria-label="Previous"><i className="fa-solid fa-chevron-left" /></button>
        <button className="hero-nav next" onClick={() => setI((i + 1) % slides.length)} aria-label="Next"><i className="fa-solid fa-chevron-right" /></button>
        <div className="hero-dots">
          {slides.map((_, idx) => (
            <button key={idx} className={idx === i ? 'on' : ''} onClick={() => setI(idx)} aria-label={`Slide ${idx + 1}`} />
          ))}
        </div>
      </div>

      <a href="tel:999" className="emergency-strip">
        <i className="fa-solid fa-phone-volume" />
        <span>{t('জরুরি সাহায্য প্রয়োজন? পুলিশ, ফায়ার ও অ্যাম্বুলেন্সের জন্য কল করুন', 'Need urgent help? Call for police, fire and ambulance')}</span>
        <strong>999</strong>
      </a>

      <h2 className="section-title">{t('আমাদের সেবাসমূহ', 'Our Services')}</h2>
      <div className="grid grid-3">
        {features.map((f) => {
          const [h, p, b] = lang === 'bn' ? f.bn : f.en;
          return (
            <div className="card feature" key={f.to}>
              <div className={`icon-circle tone-${f.tone}`}><i className={`fa-solid ${f.icon}`} /></div>
              <h3>{h}</h3>
              <p className="muted">{p}</p>
              <Link to={f.to} className="btn btn-outline btn-sm">{b}</Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
