import { Link } from 'react-router-dom';
import { useLang } from '../context/LangContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { PageHeader, useApi, Loader, ErrorBox } from '../components/ui.jsx';
import { BLOOD_BANK_URL } from '../components/BloodBankLink.jsx';

export const STATUS = {
  pending: ['যাচাইাধীন', 'Pending', 'badge-warning'],
  approved: ['অনুমোদিত', 'Approved', 'badge-success'],
  rejected: ['বাতিল', 'Rejected', 'badge-danger'],
};

export default function CitizenDashboard() {
  const { t, num, fmtDate, lang } = useLang();
  const { user } = useAuth();
  const { data, loading, error } = useApi('/applications/mine');
  const apps = data || [];
  const count = (s) => apps.filter((a) => a.status === s).length;

  return (
    <>
      <PageHeader icon="fa-user-tie" title={t(`স্বাগতম, ${user.name}`, `Welcome, ${user.name}`)}
        subtitle={`${user.email}${user.phone ? ' · ' + user.phone : ''}${user.district ? ' · ' + user.district : ''}`} />
      <div className="container section">
        <div className="stat-row">
          <div className="stat"><strong>{num(apps.length)}</strong><span>{t('মোট আবেদন', 'Total applications')}</span></div>
          <div className="stat ok"><strong>{num(count('approved'))}</strong><span>{t('অনুমোদিত', 'Approved')}</span></div>
          <div className="stat warn"><strong>{num(count('pending'))}</strong><span>{t('যাচাইাধীন', 'Pending')}</span></div>
          <div className="stat"><strong>{num(user.savedScholarships?.length || 0)}</strong><span>{t('সংরক্ষিত বৃত্তি', 'Saved scholarships')}</span></div>
        </div>

        <div className="quick-actions">
          <Link to="/relief-apply" className="btn btn-outline"><i className="fa-solid fa-hand-holding-dollar" /> {t('ত্রাণ আবেদন', 'Relief application')}</Link>
          <Link to="/service-apply/general" className="btn btn-outline"><i className="fa-solid fa-file-signature" /> {t('সেবার আবেদন', 'Service request')}</Link>
          <Link to="/scholarship" className="btn btn-outline"><i className="fa-solid fa-graduation-cap" /> {t('বৃত্তি', 'Scholarships')}</Link>
          <a href={BLOOD_BANK_URL} target="_blank" rel="noopener noreferrer" className="btn btn-accent"><i className="fa-solid fa-droplet" /> {t('জাতীয় ব্লাড ব্যাংক', 'National Blood Bank')}</a>
        </div>

        <div className="card pad">
          <h3 className="card-title"><i className="fa-solid fa-clock-rotate-left text-primary" /> {t('আবেদনের ইতিহাস ও অবস্থা', 'Application history & status')}</h3>
          {loading && <Loader />}
          <ErrorBox message={error} />
          {!loading && apps.length === 0 && <div className="notice">{t('আপনি এখনো কোনো আবেদন করেননি।', 'You have not submitted any applications yet.')}</div>}
          {apps.length > 0 && (
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>{t('আইডি', 'ID')}</th><th>{t('সেবা', 'Service')}</th><th>{t('তারিখ', 'Date')}</th><th>{t('অবস্থা', 'Status')}</th><th>{t('মন্তব্য', 'Note')}</th></tr></thead>
                <tbody>
                  {apps.map((a) => (
                    <tr key={a._id}>
                      <td><strong>{a.trackingId}</strong></td>
                      <td>{a.service}</td>
                      <td>{fmtDate(a.createdAt)}</td>
                      <td><span className={`badge ${STATUS[a.status][2]}`}>{STATUS[a.status][lang === 'bn' ? 0 : 1]}</span></td>
                      <td className="muted small">{a.note || '—'}</td>
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
