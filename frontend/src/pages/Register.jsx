import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLang } from '../context/LangContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useForm, useToast, DISTRICTS } from '../components/ui.jsx';

const ROLES = [
  ['user', 'fa-user', 'সাধারণ নাগরিক', 'Citizen'],
  ['student', 'fa-user-graduate', 'শিক্ষার্থী', 'Student'],
  ['volunteer', 'fa-hand-holding-heart', 'স্বেচ্ছাসেবক', 'Volunteer'],
];

export default function Register() {
  const { t } = useLang();
  const { register } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const loc = useLocation();
  const [form, bind] = useForm({ name: '', email: '', phone: '', district: '', password: '', role: 'user' });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await register(form);
      toast(t('রেজিস্ট্রেশন সফল হয়েছে!', 'Registration successful!'));
      nav(loc.state?.from || '/', { replace: true });
    } catch (err) { toast(err.message, 'error'); }
    setBusy(false);
  };

  return (
    <div className="container section auth-wrap">
      <div className="card pad auth-card">
        <div className="center">
          <div className="icon-circle tone-accent big"><i className="fa-solid fa-user-plus" /></div>
          <h2>{t('নতুন অ্যাকাউন্ট', 'Create account')}</h2>
        </div>
        <form className="form" onSubmit={submit}>
          <div className="role-pick">
            {ROLES.map(([v, icon, bn, en]) => (
              <button type="button" key={v} className={`role ${form.role === v ? 'on' : ''}`} onClick={() => bind({ target: { name: 'role', value: v } })}>
                <i className={`fa-solid ${icon}`} /> {t(bn, en)}
              </button>
            ))}
          </div>
          <label>{t('পূর্ণ নাম', 'Full name')}<input name="name" value={form.name} onChange={bind} required /></label>
          <label>{t('ইমেইল', 'Email')}<input type="email" name="email" value={form.email} onChange={bind} required /></label>
          <div className="form-grid">
            <label>{t('মোবাইল', 'Mobile')}<input name="phone" value={form.phone} onChange={bind} inputMode="tel" pattern="01[3-9][0-9]{8}" title="01XXXXXXXXX" /></label>
            <label>{t('জেলা', 'District')}
              <select name="district" value={form.district} onChange={bind}>
                <option value="">{t('নির্বাচন করুন', 'Select')}</option>
                {DISTRICTS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </label>
          </div>
          <label>{t('পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)', 'Password (min 6 characters)')}<input type="password" name="password" value={form.password} onChange={bind} minLength={6} required /></label>
          <button className="btn btn-accent btn-block btn-lg" disabled={busy}>{busy ? '…' : t('রেজিস্টার', 'Register')}</button>
        </form>
        <p className="center muted">{t('ইতিমধ্যে অ্যাকাউন্ট আছে?', 'Already have an account?')} <Link to="/login" state={loc.state}><strong>{t('লগইন', 'Login')}</strong></Link></p>
      </div>
    </div>
  );
}
