import { useState } from 'react';
import { useLang } from '../context/LangContext.jsx';
import { PageHeader, useApi, useToast, Loader, ErrorBox } from '../components/ui.jsx';

export default function EmergencyContacts() {
  const { t, L, lang } = useLang();
  const toast = useToast();
  const { data, loading, error } = useApi('/content/hotlines');
  const [q, setQ] = useState('');

  const list = (data || []).filter((h) =>
    [h.nameBn, h.nameEn, h.descBn, h.descEn, h.number].join(' ').toLowerCase().includes(q.toLowerCase())
  );

  const copy = async (n) => {
    try { await navigator.clipboard.writeText(n); toast(t(`${n} কপি হয়েছে`, `${n} copied`), 'info'); } catch { /* ignore */ }
  };

  return (
    <>
      <PageHeader icon="fa-phone-volume" title={t('জাতীয় জরুরি সেবা ও হটলাইন', 'National Emergency Services & Hotlines')}
        subtitle={t('যেকোনো বিপদে ২৪ ঘণ্টা সহায়তার জন্য নিচের নম্বরগুলোতে কল করুন।', 'Call these numbers for 24/7 help in any emergency.')} />
      <div className="container section">
        <div className="search-box big center-box">
          <i className="fa-solid fa-magnifying-glass" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('সেবা বা নম্বর খুঁজুন (যেমন: ফায়ার, 109)…', 'Search service or number (e.g. fire, 109)…')} />
        </div>
        {loading && <Loader />}
        <ErrorBox message={error} />
        {!loading && list.length === 0 && <div className="notice">{t('কিছু পাওয়া যায়নি।', 'Nothing found.')}</div>}
        <div className="grid grid-3">
          {list.map((h) => (
            <div className={`card pad hotline c-${h.color}`} key={h._id}>
              <div className="icon-circle"><i className={`fa-solid ${h.icon}`} /></div>
              <h4>{L(h, 'name')}</h4>
              <div className="hotline-number">{h.number}</div>
              <p className="muted small">{L(h, 'desc')}</p>
              <div className="btn-row">
                <a href={`tel:${h.number}`} className="btn btn-primary btn-sm"><i className="fa-solid fa-phone" /> {t('এখনই কল করুন', 'Call now')}</a>
                <button className="btn btn-outline btn-sm" onClick={() => copy(h.number)} aria-label="Copy"><i className="fa-regular fa-copy" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
