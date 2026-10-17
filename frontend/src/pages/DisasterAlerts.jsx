import { useState } from 'react';
import { useLang } from '../context/LangContext.jsx';
import { PageHeader, useApi, Loader, ErrorBox, DISTRICTS } from '../components/ui.jsx';

const TYPES = [['flood', 'বন্যা', 'Flood'], ['cyclone', 'ঘূর্ণিঝড়', 'Cyclone'], ['erosion', 'নদী ভাঙন', 'River erosion']];
const LEVEL_LABEL = { red: ['রেড অ্যালার্ট', 'RED ALERT'], orange: ['কমলা সতর্কতা', 'ORANGE'], yellow: ['হলুদ সতর্কতা', 'YELLOW'] };

export default function DisasterAlerts() {
  const { t, L, num, lang } = useLang();
  const alerts = useApi('/content/alerts');
  const shelters = useApi('/content/shelters');
  const [district, setDistrict] = useState('');
  const [type, setType] = useState('');

  const aList = (alerts.data || []).filter((a) => (!district || a.district === district) && (!type || a.type === type));
  const sList = (shelters.data || []).filter((s) => !district || s.district === district);
  const top = aList.find((a) => a.level === 'red') || aList[0];
  const districts = [...new Set([...(alerts.data || []).map((a) => a.district), ...(shelters.data || []).map((s) => s.district)])].sort();

  return (
    <>
      <PageHeader icon="fa-triangle-exclamation" tone="danger" title={t('দুর্যোগ সতর্কতা ও আশ্রয়কেন্দ্র', 'Disaster Alerts & Emergency Shelters')}
        subtitle={t('বন্যা, ঘূর্ণিঝড় ও নদী ভাঙনের সতর্কতা এবং নিকটস্থ নিরাপদ আশ্রয়কেন্দ্র।', 'Flood, cyclone and erosion alerts with nearby safe shelters.')} />
      <div className="container section">
        <div className="notice notice-info">
          <i className="fa-solid fa-circle-info" /> {t('এখানকার সতর্কতাগুলো ডেমো ডেটা। সরকারি তথ্যের জন্য দেখুন:', 'Alerts here are demo data. For official information see:')}{' '}
          <a href="https://www.ffwc.gov.bd" target="_blank" rel="noopener noreferrer">FFWC (BWDB)</a> · <a href="https://www.bmd.gov.bd" target="_blank" rel="noopener noreferrer">BMD</a>
        </div>

        {top && (
          <div className={`alert-banner level-${top.level}`}>
            <i className="fa-solid fa-bullhorn" />
            <div>
              <h3>{LEVEL_LABEL[top.level][lang === 'bn' ? 0 : 1]}: {L(top, 'title')}</h3>
              <p>{L(top, 'body')}</p>
            </div>
          </div>
        )}

        <div className="card pad">
          <div className="inline-controls">
            <select value={district} onChange={(e) => setDistrict(e.target.value)}>
              <option value="">{t('সকল জেলা', 'All districts')}</option>
              {districts.map((d) => <option key={d}>{d}</option>)}
            </select>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">{t('সকল ধরন', 'All types')}</option>
              {TYPES.map(([v, bn, en]) => <option key={v} value={v}>{t(bn, en)}</option>)}
            </select>
          </div>
        </div>

        <h3 className="section-title sm">{t('সক্রিয় সতর্কতা', 'Active alerts')}</h3>
        {alerts.loading && <Loader />}
        <ErrorBox message={alerts.error} />
        {!alerts.loading && aList.length === 0 && <div className="notice">{t('এই ফিল্টারে কোনো সতর্কতা নেই।', 'No alerts for this filter.')}</div>}
        <div className="grid grid-3">
          {aList.map((a) => (
            <div key={a._id} className={`card pad alert-card level-${a.level}`}>
              <span className="badge level-badge">{LEVEL_LABEL[a.level][lang === 'bn' ? 0 : 1]}</span>
              <h4>{L(a, 'title')}</h4>
              <p className="small">{L(a, 'body')}</p>
              <small className="muted"><i className="fa-solid fa-location-dot" /> {a.district} · <a href={a.sourceUrl} target="_blank" rel="noopener noreferrer">{a.source}</a></small>
            </div>
          ))}
        </div>

        <h3 className="section-title sm">{t('নিরাপদ আশ্রয়কেন্দ্র', 'Safe shelters')}</h3>
        {shelters.loading && <Loader />}
        <div className="grid grid-2">
          {sList.map((s) => {
            const pct = Math.min(100, Math.round((s.occupied / s.capacity) * 100));
            const full = pct >= 90;
            const q = encodeURIComponent(`${s.nameEn} ${s.addressEn}`);
            return (
              <div className="card pad" key={s._id}>
                <div className="toolbar">
                  <h4 className="nomargin">{L(s, 'name')}</h4>
                  <span className={`badge ${full ? 'badge-danger' : 'badge-success'}`}>{full ? t('প্রায় পূর্ণ', 'Nearly full') : t('সক্রিয়', 'Open')}</span>
                </div>
                <p className="muted"><i className="fa-solid fa-location-dot text-danger" /> {L(s, 'address')}</p>
                <div className="progress"><div className={full ? 'danger' : ''} style={{ width: pct + '%' }} /></div>
                <p className="small">{t(`${num(s.occupied)} / ${num(s.capacity)} জন (${num(pct)}%)`, `${s.occupied} / ${s.capacity} people (${pct}%)`)}</p>
                <p className="small"><strong>{t('দায়িত্বপ্রাপ্ত কর্মকর্তা', 'Officer in charge')}:</strong> {L(s, 'officer')}</p>
                <div className="btn-row">
                  <a className="btn btn-outline btn-sm" href={`https://www.google.com/maps/search/?api=1&query=${q}`} target="_blank" rel="noopener noreferrer"><i className="fa-solid fa-diamond-turn-right" /> {t('ম্যাপে দেখুন', 'View on map')}</a>
                  <a className="btn btn-primary btn-sm" href={`tel:${s.phone}`}><i className="fa-solid fa-phone" /> {t('যোগাযোগ', 'Call')}</a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
