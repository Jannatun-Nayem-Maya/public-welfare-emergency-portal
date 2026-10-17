import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useLang } from '../context/LangContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { PageHeader, useForm, useToast, DISTRICTS } from '../components/ui.jsx';

const SERVICES = [
  ['general', 'সাধারণ সেবা', 'General service'],
  ['citizen-certificate', 'নাগরিক সনদ', 'Citizenship certificate'],
  ['character-certificate', 'চারিত্রিক সনদ', 'Character certificate'],
  ['old-age', 'বয়স্ক ভাতা', 'Old age allowance'],
  ['widow', 'বিধবা ভাতা', 'Widow allowance'],
  ['disability', 'প্রতিবন্ধী ভাতা', 'Disability allowance'],
  ['welfare', 'অন্যান্য কল্যাণ কর্মসূচি', 'Other welfare programme'],
];

export default function ServiceApply() {
  const { name } = useParams();
  const { t } = useLang();
  const { user } = useAuth();
  const toast = useToast();
  const [form, bind] = useForm({
    service: SERVICES.some((s) => s[0] === name) ? name : 'general',
    applicantName: user?.name || '', nid: user?.nid || '', phone: user?.phone || '', district: user?.district || '', details: '',
  });
  const [done, setDone] = useState(null);
  const [sending, setSending] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const label = SERVICES.find((s) => s[0] === form.service)?.[2] || form.service;
      const app = await api('/applications', { method: 'POST', body: { ...form, service: label, type: 'service' } });
      setDone(app.trackingId);
      toast(t('আবেদন সফলভাবে জমা হয়েছে!', 'Application submitted successfully!'));
    } catch (err) { toast(err.message, 'error'); }
    setSending(false);
  };

  if (done) {
    return (
      <div className="container section narrow">
        <div className="card pad center success-card">
          <i className="fa-solid fa-circle-check big-icon" />
          <h2>{t('আবেদন জমা হয়েছে', 'Application submitted')}</h2>
          <div className="tracking">{done}</div>
          <p className="muted">{t('অবস্থা জানতে ড্যাশবোর্ড দেখুন।', 'Check your dashboard for status updates.')}</p>
          <Link to="/dashboard" className="btn btn-primary">{t('ড্যাশবোর্ড', 'Dashboard')}</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader icon="fa-file-signature" title={t('নাগরিক সেবার আবেদন', 'Citizen Service Application')} subtitle={t('প্রয়োজনীয় তথ্য দিয়ে আবেদন জমা দিন।', 'Fill in the details and submit your request.')} />
      <div className="container section narrow">
        <form className="card pad form" onSubmit={submit}>
          <label>{t('সেবার ধরন *', 'Service *')}
            <select name="service" value={form.service} onChange={bind}>
              {SERVICES.map(([v, bn, en]) => <option key={v} value={v}>{t(bn, en)}</option>)}
            </select>
          </label>
          <div className="form-grid">
            <label>{t('পূর্ণ নাম *', 'Full name *')}<input name="applicantName" value={form.applicantName} onChange={bind} required /></label>
            <label>{t('এনআইডি নম্বর', 'NID number')}<input name="nid" value={form.nid} onChange={bind} pattern="[0-9]{10}|[0-9]{13}|[0-9]{17}" title={t('১০, ১৩ বা ১৭ ডিজিট', '10, 13 or 17 digits')} /></label>
            <label>{t('মোবাইল নম্বর *', 'Mobile number *')}<input name="phone" value={form.phone} onChange={bind} inputMode="tel" pattern="01[3-9][0-9]{8}" title="01XXXXXXXXX" required /></label>
            <label>{t('জেলা', 'District')}
              <select name="district" value={form.district} onChange={bind}>
                <option value="">{t('নির্বাচন করুন', 'Select')}</option>
                {DISTRICTS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </label>
          </div>
          <label>{t('বিস্তারিত', 'Details')}<textarea name="details" rows="4" value={form.details} onChange={bind} /></label>
          <button className="btn btn-accent btn-lg" disabled={sending}>{sending ? '…' : t('আবেদন জমা দিন', 'Submit application')}</button>
        </form>
      </div>
    </>
  );
}
