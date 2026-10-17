import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../context/LangContext.jsx';
import { PageHeader, useApi, Loader, ErrorBox } from '../components/ui.jsx';

export default function WelfarePrograms() {
  const { t, L, num } = useLang();
  const { data, loading, error } = useApi('/content/welfare');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [widow, setWidow] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [checked, setChecked] = useState(false);

  const eligibleFor = (p) => {
    if (!checked) return null;
    const a = Number(age);
    if (p.requires === 'widow') return gender === 'female' && widow;
    if (p.requires === 'disability') return disabled;
    // Old age: men 65+, women 62+
    if (p.key === 'old-age') return gender === 'female' ? a >= 62 : gender === 'male' ? a >= 65 : false;
    return false;
  };

  const anyEligible = (data || []).some((p) => eligibleFor(p));

  return (
    <>
      <PageHeader icon="fa-hand-holding-heart" tone="success" title={t('সামাজিক নিরাপত্তা কর্মসূচি ও ভাতা', 'Social Welfare Programs & Allowances')}
        subtitle={t('বয়স্ক, বিধবা ও প্রতিবন্ধী ভাতার যোগ্যতা যাচাই করে সরাসরি আবেদন করুন।', 'Check eligibility for old-age, widow and disability allowances, then apply.')} />
      <div className="container section">
        <div className="notice notice-info"><i className="fa-solid fa-circle-info" /> {t(
          'ভাতার পরিমাণ ও যোগ্যতা সময়ের সাথে পরিবর্তন হতে পারে। চূড়ান্ত তথ্যের জন্য সমাজসেবা অধিদপ্তর বা স্থানীয় ইউনিয়ন পরিষদে যোগাযোগ করুন।',
          'Amounts and rules can change over time. Confirm with the Department of Social Services or your local union parishad.')}</div>

        <div className="card pad finder-card">
          <h3 className="card-title"><i className="fa-solid fa-clipboard-check text-primary" /> {t('যোগ্যতা যাচাই করুন', 'Eligibility checker')}</h3>
          <div className="form-grid">
            <label>{t('বয়স', 'Age')}<input type="number" min="0" max="120" value={age} onChange={(e) => { setAge(e.target.value); setChecked(false); }} /></label>
            <label>{t('লিঙ্গ', 'Gender')}
              <select value={gender} onChange={(e) => { setGender(e.target.value); setChecked(false); }}>
                <option value="">{t('নির্বাচন করুন', 'Select')}</option>
                <option value="male">{t('পুরুষ', 'Male')}</option>
                <option value="female">{t('নারী', 'Female')}</option>
              </select>
            </label>
          </div>
          <div className="chips">
            {gender === 'female' && <label className="check"><input type="checkbox" checked={widow} onChange={(e) => { setWidow(e.target.checked); setChecked(false); }} /> {t('বিধবা / স্বামী পরিত্যক্তা', 'Widowed / deserted')}</label>}
            <label className="check"><input type="checkbox" checked={disabled} onChange={(e) => { setDisabled(e.target.checked); setChecked(false); }} /> {t('নিবন্ধিত প্রতিবন্ধী', 'Registered with a disability')}</label>
          </div>
          <button className="btn btn-primary" disabled={!gender || (age === '' && !disabled && !widow)} onClick={() => setChecked(true)}>{t('যাচাই করুন', 'Check now')}</button>
          {checked && (
            <p className={`notice mt-sm ${anyEligible ? 'notice-success' : ''}`}>
              {anyEligible
                ? t('আপনি নিচের চিহ্নিত কর্মসূচির জন্য সম্ভাব্য যোগ্য।', 'You may be eligible for the highlighted programmes below.')
                : t('দেওয়া তথ্যে কোনো কর্মসূচির জন্য যোগ্য মনে হচ্ছে না। অন্য কর্মসূচির জন্য ইউনিয়ন পরিষদে খোঁজ নিন।', 'Based on these details you do not appear to qualify. Check with your union parishad for other schemes.')}
            </p>
          )}
        </div>

        {loading && <Loader />}
        <ErrorBox message={error} />
        <div className="grid grid-3">
          {(data || []).map((p) => {
            const ok = eligibleFor(p);
            return (
              <div key={p._id} className={`card pad welfare ${ok ? 'eligible' : ''} ${ok === false ? 'dim' : ''}`}>
                {ok && <span className="badge badge-success"><i className="fa-solid fa-check" /> {t('সম্ভাব্য যোগ্য', 'Likely eligible')}</span>}
                <h3>{L(p, 'title')}</h3>
                <p className="muted small">{L(p, 'desc')}</p>
                <ul className="facts">
                  <li><i className="fa-solid fa-user-check" /> <strong>{t('যোগ্যতা', 'Eligibility')}:</strong> {L(p, 'ageNote')}</li>
                  <li><i className="fa-solid fa-bangladeshi-taka-sign" /> <strong>{t('মাসিক', 'Monthly')}:</strong> ৳{num(p.monthly)}</li>
                  <li><i className="fa-solid fa-calendar" /> <strong>{t('বার্ষিক', 'Yearly')}:</strong> ৳{num((p.monthly * 12).toLocaleString('en-US'))}</li>
                </ul>
                <Link to={`/service-apply/${p.key}`} className="btn btn-outline btn-block">{t('অনলাইনে আবেদন করুন', 'Apply online')}</Link>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
