import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useLang } from '../context/LangContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { PageHeader, useApi, useForm, useToast, Loader, ErrorBox, BLOOD_GROUPS } from '../components/ui.jsx';

export default function Volunteer() {
  const { t, L, num, fmtDate } = useLang();
  const { user } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const events = useApi('/events', [user?.id]);
  const [form, bind] = useForm({ name: user?.name || '', phone: user?.phone || '', bloodGroup: '', area: user?.district || '', interest: 'relief' });
  const [busy, setBusy] = useState(null);

  const register = async (e) => {
    e.preventDefault();
    if (!user) return nav('/login', { state: { from: '/volunteer' } });
    try {
      await api('/volunteers', { method: 'POST', body: form });
      toast(t('স্বেচ্ছাসেবক হিসেবে নিবন্ধিত হয়েছেন!', 'Registered as a volunteer successfully!'));
    } catch (err) { toast(err.message, 'error'); }
  };

  const join = async (ev) => {
    if (!user) { toast(t('যুক্ত হতে লগইন করুন', 'Please log in to join'), 'info'); return nav('/login', { state: { from: '/volunteer' } }); }
    setBusy(ev._id);
    try {
      const r = await api(`/events/${ev._id}/join`, { method: 'POST' });
      toast(r.joinedByMe ? t('আপনি যুক্ত হয়েছেন। ধন্যবাদ!', 'You have joined. Thank you!') : t('অংশগ্রহণ বাতিল করা হয়েছে', 'Participation cancelled'), 'info');
      events.reload();
    } catch (err) { toast(err.message, 'error'); }
    setBusy(null);
  };

  return (
    <>
      <PageHeader icon="fa-users-rectangle" tone="gold" title={t('স্বেচ্ছাসেবক নিবন্ধন ও কার্যক্রম', 'Volunteer Registration & Programmes')}
        subtitle={t('দুর্যোগ মোকাবিলা, ত্রাণ বিতরণ, রক্তদান ও জনসেবায় অংশ নিন।', 'Join disaster response, relief distribution, blood donation and community work.')} />
      <div className="container section">
        <div className="split even">
          <form className="card pad form" onSubmit={register}>
            <h3 className="card-title"><i className="fa-solid fa-user-plus text-success" /> {t('নতুন স্বেচ্ছাসেবক নিবন্ধন', 'Volunteer registration')}</h3>
            {!user && <div className="notice"><i className="fa-solid fa-lock" /> {t('নিবন্ধন করতে লগইন প্রয়োজন।', 'Login is required to register.')} <Link to="/login" state={{ from: '/volunteer' }}><strong>{t('লগইন', 'Login')}</strong></Link></div>}
            <label>{t('পূর্ণ নাম', 'Full name')}<input name="name" value={form.name} onChange={bind} required /></label>
            <div className="form-grid">
              <label>{t('মোবাইল নম্বর', 'Mobile number')}<input name="phone" value={form.phone} onChange={bind} inputMode="tel" pattern="01[3-9][0-9]{8}" title="01XXXXXXXXX" required /></label>
              <label>{t('রক্তের গ্রুপ', 'Blood group')}
                <select name="bloodGroup" value={form.bloodGroup} onChange={bind}>
                  <option value="">{t('নির্বাচন করুন', 'Select')}</option>
                  {BLOOD_GROUPS.map((g) => <option key={g}>{g}</option>)}
                </select>
              </label>
            </div>
            <label>{t('এলাকা / উপজেলা / জেলা', 'Area / upazila / district')}<input name="area" value={form.area} onChange={bind} required /></label>
            <label>{t('আগ্রহের ক্ষেত্র', 'Area of interest')}
              <select name="interest" value={form.interest} onChange={bind}>
                <option value="relief">{t('দুর্যোগ ব্যবস্থাপনা ও ত্রাণ বিতরণ', 'Disaster management & relief')}</option>
                <option value="health">{t('রক্তদান ও স্বাস্থ্য ক্যাম্পেইন', 'Blood donation & health camps')}</option>
                <option value="education">{t('শিক্ষা ও সচেতনতা', 'Education & awareness')}</option>
              </select>
            </label>
            <button className="btn btn-accent btn-block">{t('নিবন্ধন সম্পন্ন করুন', 'Complete registration')}</button>
          </form>

          <div>
            <h3 className="card-title"><i className="fa-solid fa-calendar-days text-danger" /> {t('চলমান স্বেচ্ছাসেবী কার্যক্রম', 'Upcoming programmes')}</h3>
            {events.loading && <Loader />}
            <ErrorBox message={events.error} />
            {(events.data || []).map((ev) => {
              const pct = Math.min(100, Math.round((ev.joinedCount / ev.needed) * 100));
              const full = ev.joinedCount >= ev.needed && !ev.joinedByMe;
              return (
                <div className="card pad mb" key={ev._id}>
                  <div className="toolbar">
                    <h4 className="nomargin">{L(ev, 'title')}</h4>
                    <span className={`badge ${ev.urgent ? 'badge-danger' : 'badge-success'}`}>{ev.urgent ? t('জরুরি', 'Urgent') : t('আসন্ন', 'Upcoming')}</span>
                  </div>
                  <p className="muted small"><i className="fa-regular fa-calendar" /> {fmtDate(ev.date)} · <i className="fa-solid fa-location-dot" /> {L(ev, 'location')}</p>
                  <div className="progress"><div style={{ width: pct + '%' }} /></div>
                  <p className="small">{t(`${num(ev.joinedCount)} / ${num(ev.needed)} জন স্বেচ্ছাসেবক`, `${ev.joinedCount} / ${ev.needed} volunteers`)}</p>
                  <button className={`btn btn-sm ${ev.joinedByMe ? 'btn-success' : 'btn-outline'}`} disabled={busy === ev._id || full} onClick={() => join(ev)}>
                    {ev.joinedByMe ? <><i className="fa-solid fa-check" /> {t('যুক্ত আছেন (বাতিল করুন)', 'Joined (tap to cancel)')}</> : full ? t('পূর্ণ', 'Full') : t('যুক্ত হোন', 'Join')}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
