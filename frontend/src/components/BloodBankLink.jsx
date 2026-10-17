import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useLang } from '../context/LangContext.jsx';

export const BLOOD_BANK_URL = 'https://www.bloodbank.org.bd/';

// Shows the official national blood bank link only to logged-in users
export default function BloodBankLink() {
  const { user } = useAuth();
  const { t } = useLang();

  if (user) {
    return (
      <div className="bloodbank-card unlocked">
        <div className="bb-icon"><i className="fa-solid fa-hand-holding-droplet" /></div>
        <div className="bb-body">
          <h4>{t('জাতীয় ব্লাড ব্যাংক পোর্টাল', 'National Blood Bank Portal')}</h4>
          <p>{t(
            'লগইন করা ব্যবহারকারী হিসেবে আপনি সরাসরি অফিসিয়াল ব্লাড ব্যাংক ওয়েবসাইটে যেতে পারেন।',
            'As a logged-in user you can go straight to the official blood bank website.'
          )}</p>
        </div>
        <a href={BLOOD_BANK_URL} target="_blank" rel="noopener noreferrer" className="btn btn-accent">
          {t('ব্লাড ব্যাংকে যান', 'Visit Blood Bank')} <i className="fa-solid fa-arrow-up-right-from-square" />
        </a>
      </div>
    );
  }

  return (
    <div className="bloodbank-card locked">
      <div className="bb-icon"><i className="fa-solid fa-lock" /></div>
      <div className="bb-body">
        <h4>{t('জাতীয় ব্লাড ব্যাংক পোর্টাল', 'National Blood Bank Portal')}</h4>
        <p>{t('এই লিংকটি দেখতে অনুগ্রহ করে লগইন করুন।', 'Please log in to access this link.')}</p>
      </div>
      <Link to="/login" state={{ from: '/health' }} className="btn btn-primary">
        {t('লগইন করুন', 'Login')}
      </Link>
    </div>
  );
}
