import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useLang } from '../context/LangContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { PageHeader, useForm, useToast, DISTRICTS } from '../components/ui.jsx';

const DISASTERS = [['flash-flood', 'আকস্মিক বন্যা', 'Flash flood'], ['cyclone', 'ঘূর্ণিঝড় ও জলোচ্ছ্বাস', 'Cyclone & storm surge'], ['erosion', 'নদী ভাঙন', 'River bank erosion'], ['drought', 'খরা / অন্যান্য', 'Drought / other']];
const DAMAGE = [['severe', 'সম্পূর্ণ ঘরবাড়ি ক্ষতিগ্রস্ত', 'Home fully damaged'], ['moderate', 'আংশিক ক্ষতিগ্রস্ত', 'Partially damaged'], ['minor', 'খাদ্য ও পানীয় সংকট', 'Food & water shortage']];
const INIT = { applicantName: '', nid: '', phone: '', guardian: '', district: '', upazila: '', union: '', disaster: '', damage: '', description: '', payMethod: '', payNumber: '' };

export default function ReliefApply() {
  const { t } = useLang();
  const { user } = useAuth();
  const toast = useToast();
  const [form, bind, setForm] = useForm({ ...INIT, applicantName: user?.name || '', phone: user?.phone || '', nid: user?.nid || '' });
  const [file, setFile] = useState(null);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (file && file.size > 5 * 1024 * 1024) return toast(t('ফাইল ৫ মেগাবাইটের বেশি হতে পারবে না', 'File must be under 5 MB'), 'error');
    const fd = new FormData();
    fd.append('type', 'relief');
    fd.append('service', 'Disaster Relief');
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (file) fd.append('evidence', file);
    setSending(true);
    try {
      const app = await api('/applications', { method: 'POST', form: fd });
      setDone(app.trackingId);
      toast(t('ত্রাণের আবেদন সফলভাবে জমা হয়েছে!', 'Relief application submitted successfully!'));
    } catch (err) { toast(err.message, 'error'); }
    setSending(false);
  };

  if (done) {
    return (
      <div className="container section narrow">
        <div className="card pad center success-card">
          <i className="fa-solid fa-circle-check big-icon" />
          <h2>{t('আবেদন জমা হয়েছে', 'Application submitted')}</h2>
          <p>{t('আপনার ট্র্যাকিং আইডি:', 'Your tracking ID:')}</p>
          <div className="tracking">{done}</div>
          <p className="muted">{t('আবেদনের অবস্থা আপনার ড্যাশবোর্ডে দেখতে পারবেন।', 'You can follow the status on your dashboard.')}</p>
          <Link to="/dashboard" className="btn btn-primary">{t('ড্যাশবোর্ডে যান', 'Go to dashboard')}</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader icon="fa-hand-holding-dollar" tone="success" title={t('দুর্যোগ ত্রাণ সহায়তা আবেদন', 'Disaster Relief Application')}
        subtitle={t('বন্যা, ঘূর্ণিঝড় বা অন্যান্য দুর্যোগে ক্ষতিগ্রস্ত পরিবারের জন্য আবেদন ফরম।', 'Application form for families affected by floods, cyclones and other disasters.')} />
      <div className="container section narrow">
        <div className="notice">
          <ul className="plain">
            <li>{t('সঠিক এনআইডি ও সচল মোবাইল নম্বর দিন।', 'Provide a valid NID and an active mobile number.')}</li>
            <li>{t('ক্ষতির প্রমাণ হিসেবে ছবি বা ডকুমেন্ট (JPG, PNG, PDF – সর্বোচ্চ ৫ MB) আপলোড করুন।', 'Upload a photo or document as proof (JPG, PNG, PDF – max 5 MB).')}</li>
            <li>{t('আবেদন যাচাই শেষে অনুমোদন হলে সহায়তা প্রদান করা হবে।', 'Aid is provided after verification and approval.')}</li>
          </ul>
        </div>
        <form className="card pad form" onSubmit={submit}>
          <h4>{t('১. ব্যক্তিগত তথ্য', '1. Personal information')}</h4>
          <div className="form-grid">
            <label>{t('পূর্ণ নাম *', 'Full name *')}<input name="applicantName" value={form.applicantName} onChange={bind} required /></label>
            <label>{t('এনআইডি নম্বর *', 'NID number *')}<input name="nid" value={form.nid} onChange={bind} pattern="[0-9]{10}|[0-9]{13}|[0-9]{17}" title={t('১০, ১৩ বা ১৭ ডিজিট', '10, 13 or 17 digits')} required /></label>
            <label>{t('মোবাইল নম্বর *', 'Mobile number *')}<input name="phone" value={form.phone} onChange={bind} inputMode="tel" pattern="01[3-9][0-9]{8}" title="01XXXXXXXXX" required /></label>
            <label>{t('পিতা / স্বামীর নাম', 'Father / spouse name')}<input name="guardian" value={form.guardian} onChange={bind} /></label>
          </div>
          <h4>{t('২. ঠিকানা ও ক্ষয়ক্ষতি', '2. Address & damage')}</h4>
          <div className="form-grid">
            <label>{t('জেলা *', 'District *')}
              <select name="district" value={form.district} onChange={bind} required>
                <option value="">{t('নির্বাচন করুন', 'Select')}</option>
                {DISTRICTS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </label>
            <label>{t('উপজেলা *', 'Upazila *')}<input name="upazila" value={form.upazila} onChange={bind} required /></label>
            <label>{t('ইউনিয়ন / ওয়ার্ড / গ্রাম', 'Union / ward / village')}<input name="union" value={form.union} onChange={bind} /></label>
            <label>{t('দুর্যোগের ধরন *', 'Disaster type *')}
              <select name="disaster" value={form.disaster} onChange={bind} required>
                <option value="">{t('নির্বাচন করুন', 'Select')}</option>
                {DISASTERS.map(([v, bn, en]) => <option key={v} value={v}>{t(bn, en)}</option>)}
              </select>
            </label>
            <label>{t('ক্ষতির মাত্রা *', 'Damage level *')}
              <select name="damage" value={form.damage} onChange={bind} required>
                <option value="">{t('নির্বাচন করুন', 'Select')}</option>
                {DAMAGE.map(([v, bn, en]) => <option key={v} value={v}>{t(bn, en)}</option>)}
              </select>
            </label>
          </div>
          <label>{t('ক্ষতির বিবরণ *', 'Damage description *')}<textarea name="description" rows="3" value={form.description} onChange={bind} required /></label>
          <h4>{t('৩. প্রমাণক ও সহায়তা গ্রহণের মাধ্যম', '3. Evidence & payment method')}</h4>
          <div className="form-grid">
            <label>{t('প্রমাণক আপলোড *', 'Upload evidence *')}<input type="file" accept="image/jpeg,image/png,application/pdf" onChange={(e) => setFile(e.target.files[0] || null)} required /></label>
            <label>{t('গ্রহণের মাধ্যম *', 'Payment method *')}
              <select name="payMethod" value={form.payMethod} onChange={bind} required>
                <option value="">{t('নির্বাচন করুন', 'Select')}</option>
                <option>bKash</option><option>Nagad</option><option>Rocket</option><option>Bank account</option>
              </select>
            </label>
            <label>{t('অ্যাকাউন্ট / ওয়ালেট নম্বর *', 'Account / wallet number *')}<input name="payNumber" value={form.payNumber} onChange={bind} required /></label>
          </div>
          <button className="btn btn-accent btn-lg" disabled={sending}>{sending ? t('জমা হচ্ছে…', 'Submitting…') : t('আবেদন জমা দিন', 'Submit application')}</button>
        </form>
      </div>
    </>
  );
}
