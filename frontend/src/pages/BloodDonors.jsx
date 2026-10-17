import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useLang } from '../context/LangContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { PageHeader, useForm, useToast, Loader, ErrorBox, Modal, BLOOD_GROUPS } from '../components/ui.jsx';
import BloodBankLink from '../components/BloodBankLink.jsx';

const monthsSince = (d) => (d ? Math.floor((Date.now() - new Date(d)) / (30 * 86400000)) : null);

export default function BloodDonors() {
  const { t, num } = useLang();
  const { user } = useAuth();
  const toast = useToast();
  const [group, setGroup] = useState('');
  const [location, setLocation] = useState('');
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReg, setShowReg] = useState(false);
  const [onlyReady, setOnlyReady] = useState(false);
  const [form, bind, setForm] = useForm({ name: '', bloodGroup: '', location: '', phone: '', lastDonation: '' });

  const search = () => {
    setLoading(true);
    const qs = new URLSearchParams();
    if (group) qs.set('group', group);
    if (location.trim()) qs.set('location', location.trim());
    api('/blood/donors?' + qs)
      .then((d) => { setDonors(d); setError(''); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  // Re-search automatically when filters or login state change
  useEffect(() => {
    const id = setTimeout(search, 250);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group, location, user]);

  const openReg = async () => {
    if (!user) return toast(t('দাতা হিসেবে নিবন্ধন করতে লগইন করুন', 'Please log in to register as a donor'), 'info');
    try {
      const mine = await api('/blood/donors/mine');
      setForm(mine
        ? { name: mine.name, bloodGroup: mine.bloodGroup, location: mine.location, phone: mine.phone, lastDonation: mine.lastDonation ? mine.lastDonation.slice(0, 10) : '' }
        : { name: user.name, bloodGroup: '', location: user.district || '', phone: user.phone || '', lastDonation: '' });
    } catch { /* ignore */ }
    setShowReg(true);
  };

  const register = async (e) => {
    e.preventDefault();
    try {
      await api('/blood/donors', { method: 'POST', body: form });
      toast(t('রক্তদাতা হিসেবে নিবন্ধিত হয়েছেন। ধন্যবাদ!', 'You are registered as a donor. Thank you!'));
      setShowReg(false);
      search();
    } catch (err) { toast(err.message, 'error'); }
  };

  const shown = donors.filter((d) => {
    if (!onlyReady) return true;
    const m = monthsSince(d.lastDonation);
    return m === null || m >= 3;
  });

  return (
    <>
      <PageHeader icon="fa-droplet" tone="danger" title={t('জরুরি রক্তদাতা সন্ধান পোর্টাল', 'Emergency Donor Finder')}
        subtitle={t('জরুরি মুহূর্তে রক্তদাতা খুঁজুন অথবা নিজে রক্তদাতা হিসেবে নিবন্ধন করুন।', 'Find blood donors or register yourself as a donor.')} />
      <div className="container section">
        <BloodBankLink />

        <div className="card pad">
          <div className="toolbar">
            <div className="inline-controls grow">
              <select value={group} onChange={(e) => setGroup(e.target.value)}>
                <option value="">{t('সব রক্তের গ্রুপ', 'All blood groups')}</option>
                {BLOOD_GROUPS.map((g) => <option key={g}>{g}</option>)}
              </select>
              <div className="search-box">
                <i className="fa-solid fa-location-dot" />
                <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder={t('জেলা / এলাকা (যেমন: Sylhet)', 'District / area (e.g. Sylhet)')} />
              </div>
              <label className="check"><input type="checkbox" checked={onlyReady} onChange={(e) => setOnlyReady(e.target.checked)} /> {t('রক্তদানে প্রস্তুত (৩+ মাস)', 'Ready to donate (3+ months)')}</label>
            </div>
            <button className="btn btn-accent" onClick={openReg}><i className="fa-solid fa-user-plus" /> {t('দাতা হিসেবে নিবন্ধন', 'Register as donor')}</button>
          </div>
        </div>

        {!user && (
          <div className="notice mt"><i className="fa-solid fa-lock" /> {t('গোপনীয়তার জন্য দাতাদের ফোন নম্বর শুধু লগইন করা ব্যবহারকারীরা দেখতে পাবেন।', 'To protect privacy, donor phone numbers are visible to logged-in users only.')}{' '}
            <Link to="/login" state={{ from: '/blood-donors' }}><strong>{t('লগইন', 'Login')}</strong></Link></div>
        )}

        <h3 className="section-title sm">{t(`উপলব্ধ রক্তদাতা (${num(shown.length)})`, `Available donors (${shown.length})`)}</h3>
        {loading && <Loader />}
        <ErrorBox message={error} />
        {!loading && shown.length === 0 && <div className="notice">{t('কোনো রক্তদাতা পাওয়া যায়নি।', 'No donors found.')}</div>}
        <div className="grid grid-3">
          {shown.map((d) => {
            const m = monthsSince(d.lastDonation);
            const ready = m === null || m >= 3;
            return (
              <div className="card pad donor" key={d._id}>
                <div className="donor-top">
                  <h4>{d.name}</h4>
                  <span className="group-pill">{d.bloodGroup}</span>
                </div>
                <p className="muted"><i className="fa-solid fa-location-dot text-danger" /> {d.location}</p>
                <p className="muted"><i className="fa-regular fa-clock text-success" /> {m === null ? t('আগে রক্ত দেননি', 'First-time donor') : t(`শেষ রক্তদান: ${num(m)} মাস আগে`, `Last donated: ${m} month(s) ago`)}</p>
                <span className={`badge ${ready ? 'badge-success' : 'badge-warning'}`}>{ready ? t('রক্তদানে প্রস্তুত', 'Ready to donate') : t('বিশ্রামে (৩ মাসের কম)', 'Resting (<3 months)')}</span>
                {d.phone
                  ? <a href={`tel:${d.phone}`} className="btn btn-outline btn-block mt-sm"><i className="fa-solid fa-phone" /> {d.phone}</a>
                  : <Link to="/login" state={{ from: '/blood-donors' }} className="btn btn-outline btn-block mt-sm"><i className="fa-solid fa-lock" /> {t('নম্বর দেখতে লগইন', 'Login to see number')}</Link>}
              </div>
            );
          })}
        </div>
      </div>

      {showReg && (
        <Modal onClose={() => setShowReg(false)}>
          <h3>{t('রক্তদাতা নিবন্ধন', 'Donor registration')}</h3>
          <form className="form" onSubmit={register}>
            <label>{t('নাম', 'Name')}<input name="name" value={form.name} onChange={bind} required /></label>
            <label>{t('রক্তের গ্রুপ', 'Blood group')}
              <select name="bloodGroup" value={form.bloodGroup} onChange={bind} required>
                <option value="">{t('নির্বাচন করুন', 'Select')}</option>
                {BLOOD_GROUPS.map((g) => <option key={g}>{g}</option>)}
              </select>
            </label>
            <label>{t('জেলা / এলাকা', 'District / area')}<input name="location" value={form.location} onChange={bind} required /></label>
            <label>{t('মোবাইল নম্বর', 'Mobile number')}<input name="phone" value={form.phone} onChange={bind} inputMode="tel" required /></label>
            <label>{t('শেষ রক্তদানের তারিখ (ঐচ্ছিক)', 'Last donation date (optional)')}<input type="date" name="lastDonation" value={form.lastDonation} onChange={bind} max={new Date().toISOString().slice(0, 10)} /></label>
            <button className="btn btn-accent btn-block">{t('সংরক্ষণ করুন', 'Save')}</button>
          </form>
        </Modal>
      )}
    </>
  );
}
