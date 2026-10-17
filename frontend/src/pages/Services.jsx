import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../context/LangContext.jsx';
import { PageHeader } from '../components/ui.jsx';

const services = [
  { icon: 'fa-id-card', href: 'https://services.nidw.gov.bd', ext: true, tag: 'official', bn: ['জাতীয় পরিচয়পত্র (NID)', 'নতুন এনআইডি আবেদন, তথ্য সংশোধন এবং ডাউনলোড সেবা।', 'সেবা নিন'], en: ['National ID (NID)', 'New NID application, data correction and download services.', 'Access Service'] },
  { icon: 'fa-passport', href: 'https://www.epassport.gov.bd', ext: true, tag: 'official', bn: ['ই-পাসপোর্ট সেবা', 'অনলাইন পাসপোর্ট আবেদন, ফি প্রদান ও স্ট্যাটাস চেক।', 'সেবা নিন'], en: ['E-Passport Services', 'Online passport application, fee payment and status check.', 'Access Service'] },
  { icon: 'fa-baby', href: 'https://bdris.gov.bd', ext: true, tag: 'official', bn: ['জন্ম ও মৃত্যু নিবন্ধন', 'নতুন নিবন্ধন আবেদন ও অনলাইন সনদ যাচাই।', 'সেবা নিন'], en: ['Birth & Death Registration', 'New registration and online certificate verification.', 'Access Service'] },
  { icon: 'fa-hands-holding-child', href: '/relief-apply', tag: 'portal', bn: ['ত্রাণ সহায়তা', 'দুর্যোগপীড়িত এলাকার জন্য ত্রাণ সহায়তার আবেদন।', 'আবেদন করুন'], en: ['Relief Aid', 'Relief aid application for disaster-affected people.', 'Apply Now'] },
  { icon: 'fa-droplet', href: '/health', tag: 'portal', bn: ['রক্তদাতা ও রক্তের অনুরোধ', 'রক্তদাতা খুঁজুন এবং জরুরি অনুরোধ পোস্ট করুন।', 'দেখুন'], en: ['Blood Donation', 'Find donors and post emergency blood requests.', 'Explore'] },
  { icon: 'fa-triangle-exclamation', href: '/disaster-alerts', tag: 'portal', bn: ['দুর্যোগ সতর্কতা', 'আবহাওয়া ও প্রাকৃতিক দুর্যোগের আগাম সতর্কতা।', 'বিস্তারিত'], en: ['Disaster Alerts', 'Early warnings about weather and natural disasters.', 'View Alerts'] },
  { icon: 'fa-people-group', href: '/welfare-programs', tag: 'portal', bn: ['কল্যাণ কর্মসূচি', 'সামাজিক নিরাপত্তা ভাতার যোগ্যতা ও আবেদন।', 'দেখুন'], en: ['Welfare Programs', 'Social safety net eligibility and application.', 'Explore'] },
  { icon: 'fa-phone-volume', href: '/emergency-contacts', tag: 'portal', bn: ['জরুরি যোগাযোগ', 'গুরুত্বপূর্ণ হটলাইন নম্বরগুলো খুঁজে নিন।', 'দেখুন'], en: ['Emergency Contacts', 'Find important emergency hotline numbers.', 'View'] },
  { icon: 'fa-hand-holding-heart', href: '/volunteer', tag: 'portal', bn: ['স্বেচ্ছাসেবক', 'জনসেবামূলক কাজে স্বেচ্ছাসেবক হিসেবে যুক্ত হন।', 'দেখুন'], en: ['Volunteer', 'Join community service activities as a volunteer.', 'Explore'] },
  { icon: 'fa-file-signature', href: '/service-apply/general', tag: 'portal', bn: ['সাধারণ সেবার আবেদন', 'নাগরিক সনদ, সহায়তা বা অন্যান্য সেবার জন্য আবেদন।', 'আবেদন করুন'], en: ['General Service Request', 'Apply for certificates, support or other services.', 'Apply Now'] },
];

export default function Services() {
  const { t, lang } = useLang();
  const [q, setQ] = useState('');
  const [tag, setTag] = useState('all');

  const list = services.filter((s) => {
    const [h, p] = lang === 'bn' ? s.bn : s.en;
    return (tag === 'all' || s.tag === tag) && (h + ' ' + p).toLowerCase().includes(q.toLowerCase());
  });

  return (
    <>
      <PageHeader icon="fa-building-columns" title={t('নাগরিক সেবা ডিরেক্টরি', 'Digital Citizen Services Directory')}
        subtitle={t('জনসেবা পোর্টালের মাধ্যমে আপনার প্রয়োজনীয় সরকারি সেবা গ্রহণ করুন।', 'Access essential digital government services through Jonoseba Portal.')} />
      <div className="container section">
        <div className="toolbar">
          <div className="search-box">
            <i className="fa-solid fa-magnifying-glass" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('সেবা খুঁজুন…', 'Search services…')} />
          </div>
          <div className="chips">
            {[['all', t('সব', 'All')], ['official', t('সরকারি ওয়েবসাইট', 'Official sites')], ['portal', t('এই পোর্টাল', 'This portal')]].map(([k, l]) => (
              <button key={k} className={`chip ${tag === k ? 'on' : ''}`} onClick={() => setTag(k)}>{l}</button>
            ))}
          </div>
        </div>
        {list.length === 0 && <div className="notice">{t('কোনো সেবা পাওয়া যায়নি।', 'No services found.')}</div>}
        <div className="grid grid-3">
          {list.map((s) => {
            const [h, p, b] = lang === 'bn' ? s.bn : s.en;
            return (
              <div className="card feature" key={s.href}>
                <div className="icon-circle tone-primary"><i className={`fa-solid ${s.icon}`} /></div>
                {s.ext && <span className="badge badge-soft"><i className="fa-solid fa-shield-halved" /> {t('অফিসিয়াল সরকারি সাইট', 'Official gov site')}</span>}
                <h3>{h}</h3>
                <p className="muted">{p}</p>
                {s.ext
                  ? <a href={s.href} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">{b} <i className="fa-solid fa-arrow-up-right-from-square" /></a>
                  : <Link to={s.href} className="btn btn-outline btn-sm">{b}</Link>}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
