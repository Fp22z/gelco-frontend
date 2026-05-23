import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { resetPassword as authResetPassword } from '../../services/authService';
import { useToast } from '../../services/toastService.jsx';
import './Login.css';

function getStrength(pw) {
  if (!pw) return { score: 0, label: '', color: '#e5e7eb' };
  let score = 0;
  if (pw.length >= 8)          score++;
  if (/[A-Z]/.test(pw))        score++;
  if (/[0-9]/.test(pw))        score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map = [
    { label: '',          color: '#e5e7eb' },
    { label: 'Debil',     color: '#ef4444' },
    { label: 'Regular',   color: '#f59e0b' },
    { label: 'Buena',     color: '#10b981' },
    { label: 'Excelente', color: '#059669' },
  ];
  return { ...map[score], score };
}

const EyeIcon = ({ open }) => open
  ? <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8s2.5-5 6-5 6 5 6 5-2.5 5-6 5-6-5-6-5z" stroke="currentColor" strokeWidth="1.5"/><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/><path d="M2 2l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
  : <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8s2.5-5 6-5 6 5 6 5-2.5 5-6 5-6-5-6-5z" stroke="currentColor" strokeWidth="1.5"/><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/></svg>;

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { show: showToast } = useToast();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const strength = useMemo(() => getStrength(newPassword), [newPassword]);
  const pwMatch = confirmPassword && newPassword === confirmPassword;
  const pwNoMatch = confirmPassword && newPassword !== confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword) { showToast('Ingresa una nueva contraseña', 'warning'); return; }
    if (strength.score < 2) { showToast('Elige una contraseña más segura', 'warning'); return; }
    if (newPassword !== confirmPassword) { showToast('Las contraseñas no coinciden', 'danger'); return; }
    if (!token) { showToast('Token de recuperación no encontrado', 'danger'); return; }

    setLoading(true);
    try {
      await authResetPassword({ token, newPassword });
      setSuccess(true);
      showToast('¡Contraseña actualizada con éxito!', 'success');
    } catch (err) {
      showToast(err.message || 'No se pudo restablecer la contraseña', 'danger');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-left">
          <div className="auth-orb auth-orb-1" />
          <div className="auth-orb auth-orb-2" />
          <div className="auth-orb auth-orb-3" />
          <div className="auth-left-brand">
            <img src="/assets/logo-empresa.png" alt="GELCO" />
            <span className="auth-left-brand-name">GELCO</span>
          </div>
          <div className="auth-left-img-wrap">
            <img src="/assets/auth/login-hero.png" alt="GELCO" className="auth-left-img" onError={e => { e.target.style.display = 'none'; }} />
          </div>
        </div>
        <div className="auth-right">
          <div className="auth-form-wrap">
            <div className="auth-modal-icon auth-modal-icon--success" style={{ fontSize: '48px' }}>✓</div>
            <h1 className="auth-form-title" style={{ textAlign: 'center' }}>¡Contraseña<br /><em>actualizada</em>!</h1>
            <p className="auth-form-subtitle" style={{ textAlign: 'center' }}>
              Tu contraseña ha sido restablecida exitosamente.
              Ya puedes iniciar sesión con tu nueva contraseña.
            </p>
            <Link to="/login" className="auth-btn-submit" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
              Ir a iniciar sesión <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
        <div className="auth-orb auth-orb-3" />
        <div className="auth-left-brand">
          <img src="/assets/logo-empresa.png" alt="GELCO" />
          <span className="auth-left-brand-name">GELCO</span>
        </div>
        <div className="auth-left-img-wrap">
          <img src="/assets/auth/login-hero.png" alt="GELCO" className="auth-left-img" onError={e => { e.target.style.display = 'none'; }} />
        </div>
        <div className="auth-left-content">
          <h2 className="auth-left-quote">Restablece<br />tu <em>contraseña</em></h2>
          <p className="auth-left-sub">Elige una contraseña segura que puedas recordar.</p>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-form-wrap">
          <Link to="/login" className="auth-back">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Volver al inicio de sesión
          </Link>
          <div className="auth-form-header">
            <div className="auth-form-eyebrow">Recuperación de contraseña</div>
            <h1 className="auth-form-title">Nueva<br /><em>contraseña</em></h1>
            <p className="auth-form-subtitle">Ingresa tu nueva contraseña para tu cuenta.</p>
          </div>
          <form onSubmit={handleSubmit} noValidate>
            <div className="auth-input-group">
              <label>Nueva contraseña</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </span>
                <input type={showPw ? 'text' : 'password'} placeholder="Mínimo 8 caracteres" value={newPassword} onChange={e => setNewPassword(e.target.value)} autoComplete="new-password" />
                <button type="button" className="auth-pw-toggle" onClick={() => setShowPw(v => !v)} tabIndex={-1}><EyeIcon open={showPw} /></button>
              </div>
              {newPassword && (
                <div className="pw-strength-wrap">
                  <div className="pw-strength-bar"><div className="pw-strength-fill" style={{ width: `${(strength.score/4)*100}%`, background: strength.color }} /></div>
                  <span className="pw-strength-label" style={{ color: strength.color }}>{strength.label}</span>
                </div>
              )}
            </div>
            <div className="auth-input-group">
              <label>Confirmar contraseña</label>
              <div className={`auth-input-wrap ${pwNoMatch ? 'input-error' : pwMatch ? 'input-success' : ''}`}>
                <span className="auth-input-icon">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </span>
                <input type={showPw2 ? 'text' : 'password'} placeholder="Repite tu contraseña" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} autoComplete="new-password" />
                <button type="button" className="auth-pw-toggle" onClick={() => setShowPw2(v => !v)} tabIndex={-1}><EyeIcon open={showPw2} /></button>
              </div>
              {pwMatch && <p className="auth-field-ok">✓ Las contraseñas coinciden</p>}
              {pwNoMatch && <p className="auth-field-error">Las contraseñas no coinciden</p>}
            </div>
            <button type="submit" className="auth-btn-submit" disabled={loading}>
              {loading ? <><span className="auth-spinner" /> Actualizando...</> : <>Actualizar contraseña <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
