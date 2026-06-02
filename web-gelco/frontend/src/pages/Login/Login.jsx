import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { login as authLogin, saveToken, forgotPassword } from '../../services/authService';
import { useToast } from '../../services/toastService.jsx';
import './Login.css';

function ForgotPasswordModal({ onClose }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { setError('Ingresa tu correo electronico'); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Ingresa un correo valido'); return; }
    setLoading(true);
    setError('');
    try {
      const result = await forgotPassword(email);
      const token = result.resetToken;
      if (token) {
        navigate(`/reset-password?token=${token}`);
      } else {
        setSent(true);
      }
    } catch (err) {
      setError(err.message || 'No se pudo enviar el enlace');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={e => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose} aria-label="Cerrar">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        {!sent ? (<>
          <div className="auth-modal-icon">🔑</div>
          <h3 className="auth-modal-title">¿Olvidaste tu contraseña?</h3>
          <p className="auth-modal-desc">
            Ingresa el correo con el que te registraste y te enviaremos
            un enlace para restablecer tu contraseña.
          </p>
          <form onSubmit={handleSubmit} noValidate>
            <div className="auth-input-group">
              <label htmlFor="forgot-email">Correo electronico</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 4a1 1 0 011-1h10a1 1 0 011 1v8a1 1 0 01-1 1H3a1 1 0 01-1-1V4z" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M2 4l6 5 6-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </span>
                <input id="forgot-email" type="email" placeholder="ejemplo@correo.com" value={email} onChange={e => { setEmail(e.target.value); setError(''); }} autoFocus />
              </div>
              {error && <p className="auth-field-error">{error}</p>}
            </div>
            <button type="submit" className="auth-btn-submit" disabled={loading}>
              {loading ? <><span className="auth-spinner" /> Enviando...</> : 'Enviar enlace de recuperacion'}
            </button>
          </form>
          <button className="auth-modal-cancel" onClick={onClose}>Cancelar</button>
        </>) : (<>
          <div className="auth-modal-icon auth-modal-icon--success">✉️</div>
          <h3 className="auth-modal-title">¡Revisa tu correo!</h3>
          <p className="auth-modal-desc">
            Si <strong>{email}</strong> esta registrado, recibiras un enlace
            para restablecer tu contraseña en los proximos minutos.
            Revisa tambien tu carpeta de spam.
          </p>
          <button className="auth-btn-submit" onClick={onClose}>Entendido</button>
        </>)}
      </div>
    </div>,
    document.body
  );
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const { show: showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Por favor completa todos los campos', 'warning');
      return;
    }
    setLoading(true);
    try {
      const response = await authLogin({ email, password });
      saveToken(response.token);
      if (!rememberMe) {
        sessionStorage.setItem('session_only', 'true');
      }
      showToast('¡Bienvenid@ de vuelta! 🌸', 'success');
      navigate('/dashboard');
    } catch (err) {
      showToast(err.message || 'Correo o contraseña incorrectos', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const EyeIcon = ({ open }) => open
    ? <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8s2.5-5 6-5 6 5 6 5-2.5 5-6 5-6-5-6-5z" stroke="currentColor" strokeWidth="1.5"/><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/><path d="M2 2l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
    : <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8s2.5-5 6-5 6 5 6 5-2.5 5-6 5-6-5-6-5z" stroke="currentColor" strokeWidth="1.5"/><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/></svg>;

  return (
    <>
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
            <img src="/assets/auth/login-hero.png" alt="Consultora GELCO" className="auth-left-img" onError={e => { e.target.style.display = 'none'; }} />
          </div>
          <div className="auth-left-content">
            <h2 className="auth-left-quote">Tu negocio,<br />en tus <em>manos</em>.<br />Siempre.</h2>
            <p className="auth-left-sub">Mas de 3,200 consultoras en todo el Peru ya gestionan sus ventas, pedidos y clientes con GELCO.</p>
          </div>
          <div className="auth-left-stats">
            <div className="auth-stat-chip"><span className="auth-stat-chip-value">3.2K+</span><span className="auth-stat-chip-label">Consultoras</span></div>
            <div className="auth-stat-chip"><span className="auth-stat-chip-value">98K+</span><span className="auth-stat-chip-label">Pedidos</span></div>
            <div className="auth-stat-chip"><span className="auth-stat-chip-value">99%</span><span className="auth-stat-chip-label">Satisfaccion</span></div>
          </div>
          <div className="auth-testimonial">
            <div className="auth-testimonial-stars">★★★★★</div>
            <p className="auth-testimonial-text">"Con GELCO mis ventas subieron 40% en dos campañas. Ahora manejo todo desde el celular."</p>
            <div className="auth-testimonial-author">
              <div className="auth-testimonial-avatar">CA</div>
              <div>
                <div className="auth-testimonial-name">Carmen Acuña</div>
                <div className="auth-testimonial-role">Consultora · Nivel Oro · Lima Norte</div>
              </div>
            </div>
          </div>
        </div>
        <div className="auth-right">
          <div className="auth-form-wrap">
            <Link to="/" className="auth-back">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Volver al inicio
            </Link>
            <div className="auth-form-header">
              <div className="auth-form-eyebrow">Bienvenida de vuelta</div>
              <h1 className="auth-form-title">Inicia <em>sesion</em><br />en tu cuenta</h1>
              <p className="auth-form-subtitle">Ingresa tus credenciales para acceder a tu panel.</p>
            </div>
            <form onSubmit={handleSubmit} noValidate>
              <div className="auth-input-group">
                <label htmlFor="email">Correo electronico</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4a1 1 0 011-1h10a1 1 0 011 1v8a1 1 0 01-1 1H3a1 1 0 01-1-1V4z" stroke="currentColor" strokeWidth="1.5"/><path d="M2 4l6 5 6-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </span>
                  <input id="email" type="email" placeholder="ejemplo@correo.com" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required />
                </div>
              </div>
              <div className="auth-input-group">
                <label htmlFor="password">Contraseña</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </span>
                  <input id="password" type={showPw ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" required />
                  <button type="button" className="auth-pw-toggle" onClick={() => setShowPw(v => !v)} tabIndex={-1}><EyeIcon open={showPw} /></button>
                </div>
              </div>
              <div className="auth-forgot-row">
                <label className="auth-remember">
                  <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
                  <span>Recordarme</span>
                </label>
                <button type="button" className="auth-forgot" onClick={() => setShowForgot(true)}>¿Olvidaste tu contraseña?</button>
              </div>
              <button type="submit" className="auth-btn-submit" disabled={loading}>
                {loading ? <><span className="auth-spinner" /> Ingresando...</> : <>Ingresar al sistema <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></>}
              </button>
            </form>
            <div className="auth-footer">
              <p className="auth-footer-text">¿Aun no tienes cuenta?{' '}<Link to="/register" className="auth-footer-link">Registrate gratis →</Link></p>
            </div>
          </div>
        </div>
      </div>
      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}
    </>
  );
}
