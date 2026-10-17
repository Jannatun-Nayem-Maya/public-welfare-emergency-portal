import { useState } from 'react';
import { api } from '../api.js';
import { useLang } from '../context/LangContext.jsx';
import { PageHeader, useApi, useToast, Loader, ErrorBox } from '../components/ui.jsx';
import { STATUS } from './CitizenDashboard.jsx';

export default function AdminDashboard() {
  const { t, num, fmtDate, lang } = useLang();
  const toast = useToast();
  const [filter, setFilter] = useState('pending');
  const stats = useApi('/admin/stats');
  const apps = useApi('/admin/applications?status=' + filter, [filter]);

  const decide = async (id, status) => {
    const note = status === 'rejected' ? window.prompt(t('বাতিলের কারণ (ঐচ্ছিক):', 'Reason for rejection (optional):')) || '' : '';
    try {
      await api(`/admin/applications/${id}`, { method: 'PATCH', body: { status, note } });
      toast(status === 'approved' ? t('অনুমোদন করা হয়েছে', 'Approved') : t('বাতিল করা হয়েছে', 'Rejected'), 'info');
      apps.reload();
      stats.reload();
    } catch (e) { toast(e.message, 'error'); }
  };

  const s = stats.data || {};
  const cards = [
    ['fa-users', s.users, t('মোট ব্যবহারকারী', 'Registered users'), ''],
    ['fa-inbox', s.pending, t('অপেক্ষমাণ আবেদন', 'Pending applications'), 'warn'],
    ['fa-circle-check', s.approved, t('অনুমোদিত', 'Approved'), 'ok'],
    ['fa-house-chimney-medical', s.shelters, t('সক্রিয় আশ্রয়কেন্দ্র', 'Active shelters'), ''],
    ['fa-droplet', s.openBlood, t('চলমান রক্তের অনুরোধ', 'Open blood requests'), 'warn'],
    ['fa-hand-holding-droplet', s.donors, t('নিবন্ধিত রক্তদাতা', 'Registered donors'), ''],
  ];

  return (
    <>
      <PageHeader icon="fa-user-shield" tone="dark" title={t('প্রশাসক ড্যাশবোর্ড', 'Admin Control Panel')}
        subtitle={t('আবেদন যাচাই ও পোর্টাল ম্যানেজমেন্ট', 'Verify applications and monitor the portal')} />
      <div className="container section">
        <ErrorBox message={stats.error} />
        <div className="stat-row">
          {cards.map(([icon, val, label, tone]) => (
            <div className={`stat ${tone}`} key={label}><i className={`fa-solid ${icon}`} /><strong>{num(val ?? 0)}</strong><span>{label}</span></div>
          ))}
        </div>

        <div className="card pad">
          <div className="toolbar">
            <h3 className="card-title nomargin"><i className="fa-solid fa-list-check text-success" /> {t('আবেদন ভেরিফিকেশন কিউ', 'Application verification queue')}</h3>
            <div className="chips">
              {['pending', 'approved', 'rejected', ''].map((f) => (
                <button key={f} className={`chip ${filter === f ? 'on' : ''}`} onClick={() => setFilter(f)}>
                  {f ? STATUS[f][lang === 'bn' ? 0 : 1] : t('সব', 'All')}
                </button>
              ))}
            </div>
          </div>
          {apps.loading && <Loader />}
          <ErrorBox message={apps.error} />
          {!apps.loading && (apps.data || []).length === 0 && <div className="notice">{t('কোনো আবেদন নেই।', 'No applications.')}</div>}
          {(apps.data || []).length > 0 && (
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>ID</th><th>{t('নাম', 'Name')}</th><th>NID</th><th>{t('সেবা', 'Service')}</th><th>{t('জেলা', 'District')}</th><th>{t('তারিখ', 'Date')}</th><th>{t('প্রমাণ', 'Evidence')}</th><th>{t('অবস্থা / অ্যাকশন', 'Status / action')}</th></tr></thead>
                <tbody>
                  {apps.data.map((a) => (
                    <tr key={a._id}>
                      <td><strong>{a.trackingId}</strong></td>
                      <td>{a.applicantName}<br /><small className="muted">{a.phone}</small></td>
                      <td>{a.nid || '—'}</td>
                      <td>{a.service}</td>
                      <td>{a.district || '—'}</td>
                      <td>{fmtDate(a.createdAt)}</td>
                      <td>{a.evidence ? <a href={a.evidence} target="_blank" rel="noopener noreferrer"><i className="fa-solid fa-paperclip" /> {t('দেখুন', 'View')}</a> : '—'}</td>
                      <td>
                        {a.status === 'pending' ? (
                          <div className="btn-row">
                            <button className="btn btn-success btn-sm" onClick={() => decide(a._id, 'approved')}><i className="fa-solid fa-check" /></button>
                            <button className="btn btn-danger btn-sm" onClick={() => decide(a._id, 'rejected')}><i className="fa-solid fa-xmark" /></button>
                          </div>
                        ) : <span className={`badge ${STATUS[a.status][2]}`}>{STATUS[a.status][lang === 'bn' ? 0 : 1]}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
