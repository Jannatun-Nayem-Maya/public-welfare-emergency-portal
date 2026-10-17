import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api } from '../api.js';

// ---------- Toasts ----------
const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);
  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="toast-stack">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <i className={`fa-solid ${t.type === 'error' ? 'fa-circle-exclamation' : t.type === 'info' ? 'fa-circle-info' : 'fa-circle-check'}`} />
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
export const useToast = () => useContext(ToastContext);

// ---------- Data fetching hook ----------
export function useApi(path, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(() => {
    setLoading(true);
    return api(path)
      .then((d) => { setData(d); setError(''); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [path]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [path, ...deps]);
  return { data, loading, error, reload: load, setData };
}

// ---------- Form helper ----------
export function useForm(initial) {
  const [values, setValues] = useState(initial);
  const bind = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }));
  return [values, bind, setValues];
}

// ---------- Small shared components ----------
export function PageHeader({ icon, title, subtitle, tone = 'primary' }) {
  return (
    <div className={`page-header tone-${tone}`}>
      <div className="container">
        <h1><i className={`fa-solid ${icon}`} /> {title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </div>
  );
}

export function Loader({ text = '…' }) {
  return <div className="loader"><span className="spinner" /> {text}</div>;
}

export function ErrorBox({ message }) {
  return message ? <div className="notice notice-danger"><i className="fa-solid fa-circle-exclamation" /> {message}</div> : null;
}

export function Modal({ onClose, children }) {
  useEffect(() => {
    const h = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close"><i className="fa-solid fa-xmark" /></button>
        {children}
      </div>
    </div>
  );
}

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
export const DISTRICTS = ['Dhaka', 'Chattogram', 'Sylhet', 'Sunamganj', 'Rajshahi', 'Khulna', 'Barishal', 'Rangpur', 'Mymensingh', 'Kurigram', 'Noakhali', 'Cox\'s Bazar', 'Barguna', 'Cumilla', 'Gazipur', 'Narayanganj', 'Bogura', 'Jashore'];
