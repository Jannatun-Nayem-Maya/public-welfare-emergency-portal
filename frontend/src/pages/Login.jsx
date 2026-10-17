import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLang } from '../context/LangContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../components/ui.jsx';

export default function Login() {
  const { t } = useLang();
  const { login } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const loc = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const u = await login(email, password);
      toast(t('সফলভাবে লগইন করেছেন!', 'Logged in successfully!'));
      nav(loc.state?.from || (u.role === 'admin' ? '/admin' : '/'), { replace: true });
    } catch (err) {
      toast(t('ইমেইল অথবা পাসওয়ার্ড সঠিক নয়!', err.message), 'error');
    }
    setBusy(false);
  };

  return (
    <div className="container section auth-wrap">
      <div className="card pad auth-card">
        <div className="center">
          <div className="icon-circle tone-primary big"><i className="fa-solid fa-right-to-bracket" /></div>
          <h2>{t('লগইন করুন', 'Login')}</h2>
          <p className="muted">{t('লগইন করলে রক্তদাতার ফোন নম্বর, বৃত্তি সংরক্ষণ ও জাতীয় ব্লাড ব্যাংক লিংক পাবেন।', 'Log in to see donor phone numbers, save scholarships and open the national blood bank link.')}</p>
        </div>
        <form className="form" onSubmit={submit}>
          <label>{t('ইমেইল', 'Email address')}<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" required autoFocus /></label>
          <label>{t('পাসওয়ার্ড', 'Password')}
            <div className="pw">
              <input type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="button" onClick={() => setShow(!show)} aria-label="Toggle password"><i className={`fa-solid ${show ? 'fa-eye-slash' : 'fa-eye'}`} /></button>
            </div>
          </label>
          <button className="btn btn-primary btn-block btn-lg" disabled={busy}>{busy ? '…' : t('লগইন', 'Login')}</button>
        </form>
        <p className="center muted">{t('অ্যাকাউন্ট নেই?', 'No account yet?')} <Link to="/register" state={loc.state}><strong>{t('রেজিস্ট্রেশন করুন', 'Register')}</strong></Link></p>
      </div>
    </div>
  );
}
