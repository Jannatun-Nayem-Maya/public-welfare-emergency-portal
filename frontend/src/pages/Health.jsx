import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useLang } from '../context/LangContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { PageHeader, useApi, useForm, useToast, Loader, ErrorBox, BLOOD_GROUPS } from '../components/ui.jsx';
import BloodBankLink from '../components/BloodBankLink.jsx';

// Who can donate to whom (red cell compatibility)
const CAN_DONATE_TO = {
  'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
  'O+': ['O+', 'A+', 'B+', 'AB+'],
  'A-': ['A-', 'A+', 'AB-', 'AB+'],
  'A+': ['A+', 'AB+'],
  'B-': ['B-', 'B+', 'AB-', 'AB+'],
  'B+': ['B+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+'],
};

function timeAgo(date, lang) {
  const mins = Math.max(1, Math.floor((Date.now() - new Date(date)) / 60000));
  const bn = lang === 'bn';
  if (mins < 60) return bn ? `${mins} মিনিট আগে` : `${mins} min ago`;
  const h = Math.floor(mins / 60);
  if (h < 24) return bn ? `${h} ঘণ্টা আগে` : `${h}h ago`;
  const d = Math.floor(h / 24);
  return bn ? `${d} দিন আগে` : `${d}d ago`;
}

export default function Health() {
  const { t, lang, num } = useLang();
  const { user } = useAuth();
  const toast = useToast();
  const { data, loading, error, reload } = useApi('/blood/requests');
  const [form, bind, setForm] = useForm({ patientName: '', bloodGroup: '', hospital: '', contactNumber: '', location: '', urgency: 'Emergency', details: '' });
  const [filter, setFilter] = useState('');
  const [onlyOpen, setOnlyOpen] = useState(true);
  const [sending, setSending] = useState(false);
  const [recipient, setRecipient] = useState('A+');

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await api('/blood/requests', { method: 'POST', body: form });
      toast(t('রক্তদানের অনুরোধ সফলভাবে পোস্ট করা হয়েছে!', 'Blood request posted successfully!'));
      setForm({ patientName: '', bloodGroup: '', hospital: '', contactNumber: '', location: '', urgency: 'Emergency', details: '' });
      reload();
    } catch (err) { toast(err.message, 'error'); }
    setSending(false);
  };

  const fulfill = async (id) => {
    try { await api(`/blood/requests/${id}/fulfill`, { method: 'PATCH' }); toast(t('অনুরোধটি পূরণ হয়েছে হিসেবে চিহ্নিত করা হয়েছে', 'Marked as fulfilled')); reload(); }
    catch (err) { toast(err.message, 'error'); }
  };

  const list = (data || []).filter((r) => (!filter || r.bloodGroup === filter) && (!onlyOpen || r.status === 'open'));
  const donorsFor = Object.keys(CAN_DONATE_TO).filter((g) => CAN_DONATE_TO[g].includes(recipient));
  const urgencyLabel = { Emergency: t('জরুরি', 'Emergency'), 'Within 24 Hours': t('২৪ ঘণ্টার মধ্যে', 'Within 24 Hours'), Regular: t('সাধারণ', 'Regular') };

  return (
    <>
      <PageHeader icon="fa-droplet" tone="danger" title={t('স্বাস্থ্য ও রক্তদান কেন্দ্র', 'Health & Blood Hub')}
        subtitle={t('জরুরি রক্তের অনুরোধ জানান, রক্তদাতা খুঁজুন এবং সচেতন হোন।', 'Post emergency blood requests, find donors and learn the facts.')} />
      <div className="container section">
        <BloodBankLink />

        <div className="split">
          <div>
            <div className="card pad">
              <h3 className="card-title"><i className="fa-solid fa-droplet text-danger" /> {t('জরুরি রক্তের অনুরোধ জানান', 'Post Blood Request')}</h3>
              {user ? (
                <form onSubmit={submit} className="form">
                  <label>{t('রোগীর নাম', 'Patient Name')}<input name="patientName" value={form.patientName} onChange={bind} required /></label>
                  <label>{t('রক্তের গ্রুপ', 'Blood Group')}
                    <select name="bloodGroup" value={form.bloodGroup} onChange={bind} required>
                      <option value="">{t('নির্বাচন করুন', 'Select')}</option>
                      {BLOOD_GROUPS.map((g) => <option key={g}>{g}</option>)}
                    </select>
                  </label>
                  <label>{t('হাসপাতাল / ঠিকানা', 'Hospital / Address')}<input name="hospital" value={form.hospital} onChange={bind} required /></label>
                  <label>{t('যোগাযোগের নম্বর', 'Contact Number')}<input name="contactNumber" value={form.contactNumber} onChange={bind} inputMode="tel" pattern="[0-9+\- ]{8,15}" title="01XXXXXXXXX" required /></label>
                  <label>{t('জেলা / এলাকা', 'Location')}<input name="location" value={form.location} onChange={bind} required /></label>
                  <label>{t('জরুরি অবস্থা', 'Urgency')}
                    <select name="urgency" value={form.urgency} onChange={bind}>
                      <option value="Emergency">{urgencyLabel.Emergency}</option>
                      <option value="Within 24 Hours">{urgencyLabel['Within 24 Hours']}</option>
                      <option value="Regular">{urgencyLabel.Regular}</option>
                    </select>
                  </label>
                  <label>{t('বিস্তারিত (ঐচ্ছিক)', 'Details (optional)')}<textarea name="details" rows="3" value={form.details} onChange={bind} /></label>
                  <button className="btn btn-accent btn-block" disabled={sending}>{sending ? '…' : t('অনুরোধ পোস্ট করুন', 'Submit Request')}</button>
                </form>
              ) : (
                <div className="notice">
                  <i className="fa-solid fa-lock" /> {t('অনুরোধ পোস্ট করতে লগইন করুন।', 'Please log in to post a request.')}{' '}
                  <Link to="/login" state={{ from: '/health' }}><strong>{t('লগইন', 'Login')}</strong></Link>
                </div>
              )}
            </div>

            <div className="card pad mt">
              <h3 className="card-title"><i className="fa-solid fa-flask text-primary" /> {t('রক্ত সামঞ্জস্য যাচাই', 'Blood Compatibility Checker')}</h3>
              <p className="muted small">{t('রোগীর রক্তের গ্রুপ বেছে নিন – কোন গ্রুপের দাতা রক্ত দিতে পারবেন দেখুন।', 'Pick the patient’s blood group to see which donor groups are compatible.')}</p>
              <div className="chips">
                {BLOOD_GROUPS.map((g) => <button key={g} className={`chip ${recipient === g ? 'on' : ''}`} onClick={() => setRecipient(g)}>{g}</button>)}
              </div>
              <p className="mt-sm">{t('উপযুক্ত দাতা:', 'Compatible donors:')}{' '}
                {donorsFor.map((g) => <span key={g} className="badge badge-danger">{g}</span>)}
              </p>
              <Link to="/blood-donors" className="btn btn-outline btn-sm">{t('এই গ্রুপের দাতা খুঁজুন', 'Find donors')} →</Link>
            </div>
          </div>

          <div>
            <div className="card pad">
              <h3 className="card-title"><i className="fa-brands fa-youtube text-danger" /> {t('রক্তদান নিয়ে সচেতনতা', 'Awareness on Blood Donation')}</h3>
              <div className="video">
                <iframe src="https://www.youtube.com/embed/T4hUVf3Ux6I" title="Blood donation awareness" allow="encrypted-media" allowFullScreen />
              </div>
            </div>

            <div className="toolbar mt">
              <h3 className="card-title nomargin">{t('সাম্প্রতিক রক্তের অনুরোধসমূহ', 'Recent Blood Requests')}</h3>
              <div className="inline-controls">
                <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                  <option value="">{t('সব গ্রুপ', 'All groups')}</option>
                  {BLOOD_GROUPS.map((g) => <option key={g}>{g}</option>)}
                </select>
                <label className="check"><input type="checkbox" checked={onlyOpen} onChange={(e) => setOnlyOpen(e.target.checked)} /> {t('শুধু চলমান', 'Open only')}</label>
              </div>
            </div>

            {loading && <Loader />}
            <ErrorBox message={error} />
            {!loading && list.length === 0 && <div className="notice">{t('বর্তমানে কোনো রক্তদানের অনুরোধ নেই।', 'No blood requests available right now.')}</div>}
            {list.map((r) => (
              <div className={`card pad req ${r.status}`} key={r._id}>
                <div className="req-group">{r.bloodGroup}</div>
                <div className="req-body">
                  <h4>{r.patientName} {r.status === 'fulfilled' && <span className="badge badge-success">{t('পূরণ হয়েছে', 'Fulfilled')}</span>}</h4>
                  <p className="muted"><i className="fa-solid fa-location-dot text-danger" /> {r.hospital}, {r.location}</p>
                  <p><i className="fa-solid fa-phone" /> <a href={`tel:${r.contactNumber}`}>{r.contactNumber}</a> · <small className="muted">{timeAgo(r.createdAt, lang)}</small></p>
                  {r.details && <small className="muted">{r.details}</small>}
                </div>
                <div className="req-side">
                  <span className={`badge ${r.urgency === 'Emergency' ? 'badge-danger' : 'badge-warning'}`}>{urgencyLabel[r.urgency]}</span>
                  {r.status === 'open' && user && (String(r.createdBy) === user.id || user.role === 'admin') && (
                    <button className="btn btn-outline btn-sm" onClick={() => fulfill(r._id)}>{t('পূরণ হয়েছে', 'Mark fulfilled')}</button>
                  )}
                </div>
              </div>
            ))}
            <p className="muted small">{t(`মোট ${num(list.length)} টি অনুরোধ দেখানো হচ্ছে`, `Showing ${list.length} request(s)`)}</p>
          </div>
        </div>
      </div>
    </>
  );
}
