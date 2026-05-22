import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register as authRegister, saveToken } from '../../services/authService';
import { useToast } from '../../services/toastService.jsx';
import './Login.css';

// ── Password strength ─────────────────────────────────────────────
function getStrength(pw) {
  if (!pw) return { score: 0, label: '', color: '#e5e7eb' };
  let score = 0;
  if (pw.length >= 8)          score++;
  if (/[A-Z]/.test(pw))        score++;
  if (/[0-9]/.test(pw))        score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map = [
    { label: '',          color: '#e5e7eb' },
    { label: 'Débil',     color: '#ef4444' },
    { label: 'Regular',   color: '#f59e0b' },
    { label: 'Buena',     color: '#10b981' },
    { label: 'Excelente', color: '#059669' },
  ];
  return { ...map[score], score };
}

// ── EyeIcon ───────────────────────────────────────────────────────
const EyeIcon = ({ open }) => open
  ? <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8s2.5-5 6-5 6 5 6 5-2.5 5-6 5-6-5-6-5z" stroke="currentColor" strokeWidth="1.5"/><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/><path d="M2 2l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
  : <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8s2.5-5 6-5 6 5 6 5-2.5 5-6 5-6-5-6-5z" stroke="currentColor" strokeWidth="1.5"/><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/></svg>;

// ── Modal Términos y Condiciones ──────────────────────────────────
function TermsModal({ onAccept, onClose }) {
  const [scrolled, setScrolled] = useState(false);

  const handleScroll = (e) => {
    const el = e.target;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20) setScrolled(true);
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal auth-modal--terms" onClick={e => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose} aria-label="Cerrar">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        <h3 className="auth-modal-title">Términos y Condiciones</h3>
        <p className="auth-modal-desc">Última actualización: enero 2026 · Lee hasta el final para aceptar.</p>

        <div className="terms-scroll-area" onScroll={handleScroll}>
          <h4>1. Aceptación de los términos</h4>
          <p>Al crear una cuenta en GELCO, aceptas quedar vinculada a estos Términos y Condiciones. Si no estás de acuerdo con alguna parte, no debes utilizar el servicio.</p>

          <h4>2. Descripción del servicio</h4>
          <p>GELCO es una plataforma de gestión de ventas por catálogo diseñada para consultoras y distribuidores independientes en el territorio peruano. Permite registrar pedidos, gestionar clientes, visualizar catálogos de productos y acceder a capacitaciones.</p>

          <h4>3. Uso de la cuenta</h4>
          <p>Eres responsable de mantener la confidencialidad de tus credenciales de acceso. GELCO no será responsable de pérdidas derivadas del uso no autorizado de tu cuenta. Debes notificarnos inmediatamente ante cualquier uso no autorizado.</p>

          <h4>4. Privacidad y datos personales</h4>
          <p>Recopilamos y procesamos tus datos personales de acuerdo con la Ley N.° 29733 — Ley de Protección de Datos Personales del Perú. Tus datos serán utilizados exclusivamente para la prestación del servicio y no serán compartidos con terceros sin tu consentimiento, salvo obligación legal.</p>

          <h4>5. Conducta del usuario</h4>
          <p>Te comprometes a utilizar GELCO de manera ética y legal. Está prohibido registrar información falsa, usar el sistema para actividades fraudulentas o intentar acceder a cuentas ajenas.</p>

          <h4>6. Propiedad intelectual</h4>
          <p>Todo el contenido de GELCO — incluyendo diseño, código, textos y marca — es propiedad de GELCO y está protegido por las leyes de propiedad intelectual. No puedes reproducir, distribuir ni modificar ningún elemento sin autorización expresa.</p>

          <h4>7. Limitación de responsabilidad</h4>
          <p>GELCO no garantiza la disponibilidad continua del servicio y no será responsable por daños indirectos, pérdidas de ingresos o interrupciones del negocio derivadas del uso o imposibilidad de uso de la plataforma.</p>

          <h4>8. Modificaciones</h4>
          <p>Nos reservamos el derecho de modificar estos términos en cualquier momento. Te notificaremos por correo electrónico ante cambios significativos. El uso continuado del servicio tras la notificación implica la aceptación de los nuevos términos.</p>

          <h4>9. Cancelación</h4>
          <p>Puedes cancelar tu cuenta en cualquier momento desde la configuración de tu perfil. GELCO puede suspender o cancelar cuentas que incumplan estos términos sin previo aviso.</p>

          <h4>10. Ley aplicable</h4>
          <p>Estos términos se rigen por las leyes de la República del Perú. Cualquier disputa será resuelta ante los tribunales competentes de Lima.</p>

          <h4>11. Contacto</h4>
          <p>Para consultas sobre estos términos, escríbenos a: <strong>legal@gelco.pe</strong></p>
        </div>

        {!scrolled && (
          <p className="terms-scroll-hint">↓ Desplázate hasta el final para poder aceptar</p>
        )}

        <div className="terms-actions">
          <button className="auth-modal-cancel" onClick={onClose}>Cancelar</button>
          <button
            className="auth-btn-submit"
            style={{ flex: 1 }}
            disabled={!scrolled}
            onClick={() => { onAccept(); onClose(); }}
          >
            {scrolled ? 'Acepto los términos' : 'Lee los términos primero'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Paso 1: Datos de cuenta + rol ─────────────────────────────────
function Step1({ data, setData, onNext, onOpenTerms }) {
  const [showPw, setShowPw]   = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [errors, setErrors]   = useState({});

  const strength  = useMemo(() => getStrength(data.password), [data.password]);
  const pwMatch   = data.confirmar && data.password === data.confirmar;
  const pwNoMatch = data.confirmar && data.password !== data.confirmar;

  const validate = () => {
    const e = {};
    if (!data.nombre.trim())    e.nombre   = 'Ingresa tu nombre completo';
    if (!data.email.trim())     e.email    = 'Ingresa tu correo';
    else if (!/\S+@\S+\.\S+/.test(data.email)) e.email = 'Correo inválido';
    if (!data.password)         e.password = 'Ingresa una contraseña';
    else if (strength.score < 2) e.password = 'Elige una contraseña más segura';
    if (!data.confirmar)        e.confirmar = 'Confirma tu contraseña';
    else if (data.password !== data.confirmar) e.confirmar = 'Las contraseñas no coinciden';
    if (!data.rol)              e.rol      = 'Elige un tipo de perfil';
    if (!data.terms)            e.terms    = 'Debes aceptar los términos';
    return e;
  };

  const handleNext = (e) => {
    e.preventDefault();
    const e2 = validate();
    setErrors(e2);
    if (Object.keys(e2).length === 0) onNext();
  };

  const f = (field) => (e) => { setData(d => ({ ...d, [field]: e.target.value })); setErrors(er => ({ ...er, [field]: '' })); };

  return (
    <>
      <div className="auth-form-header">
        <div className="auth-form-eyebrow">Paso 1 de 2 · Crea tu cuenta</div>
        <h1 className="auth-form-title">Únete a <em>GELCO</em><br />es gratis</h1>
        <p className="auth-form-subtitle">Sin tarjeta de crédito. Sin compromisos.</p>
      </div>

      <form onSubmit={handleNext} noValidate>
        {/* Nombre */}
        <div className="auth-input-group">
          <label>Nombre completo</label>
          <div className={`auth-input-wrap ${errors.nombre ? 'input-error' : ''}`}>
            <span className="auth-input-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </span>
            <input type="text" placeholder="Tu nombre y apellido" value={data.nombre} onChange={f('nombre')} autoComplete="name" />
          </div>
          {errors.nombre && <p className="auth-field-error">{errors.nombre}</p>}
        </div>

        {/* Email */}
        <div className="auth-input-group">
          <label>Correo electrónico</label>
          <div className={`auth-input-wrap ${errors.email ? 'input-error' : ''}`}>
            <span className="auth-input-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4a1 1 0 011-1h10a1 1 0 011 1v8a1 1 0 01-1 1H3a1 1 0 01-1-1V4z" stroke="currentColor" strokeWidth="1.5"/><path d="M2 4l6 5 6-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </span>
            <input type="email" placeholder="ejemplo@correo.com" value={data.email} onChange={f('email')} autoComplete="email" />
          </div>
          {errors.email && <p className="auth-field-error">{errors.email}</p>}
        </div>

        {/* Password */}
        <div className="auth-input-group">
          <label>Contraseña</label>
          <div className={`auth-input-wrap ${errors.password ? 'input-error' : ''}`}>
            <span className="auth-input-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </span>
            <input type={showPw ? 'text' : 'password'} placeholder="Mínimo 8 caracteres" value={data.password} onChange={f('password')} autoComplete="new-password" />
            <button type="button" className="auth-pw-toggle" onClick={() => setShowPw(v => !v)} tabIndex={-1}><EyeIcon open={showPw} /></button>
          </div>
          {data.password && (
            <div className="pw-strength-wrap">
              <div className="pw-strength-bar"><div className="pw-strength-fill" style={{ width: `${(strength.score/4)*100}%`, background: strength.color }} /></div>
              <span className="pw-strength-label" style={{ color: strength.color }}>{strength.label}</span>
            </div>
          )}
          {errors.password && <p className="auth-field-error">{errors.password}</p>}
        </div>

        {/* Confirmar */}
        <div className="auth-input-group">
          <label>Confirmar contraseña</label>
          <div className={`auth-input-wrap ${pwNoMatch || errors.confirmar ? 'input-error' : pwMatch ? 'input-success' : ''}`}>
            <span className="auth-input-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </span>
            <input type={showPw2 ? 'text' : 'password'} placeholder="Repite tu contraseña" value={data.confirmar} onChange={f('confirmar')} autoComplete="new-password" />
            <button type="button" className="auth-pw-toggle" onClick={() => setShowPw2(v => !v)} tabIndex={-1}><EyeIcon open={showPw2} /></button>
          </div>
          {errors.confirmar && <p className="auth-field-error">{errors.confirmar}</p>}
          {pwMatch && !errors.confirmar && <p className="auth-field-ok">✓ Las contraseñas coinciden</p>}
        </div>

        {/* Rol */}
        <div className="auth-input-group">
          <label>Tipo de perfil</label>
          <div className={`rol-selector ${errors.rol ? 'input-error-border' : ''}`}>
            {[
              { value: 'CONSULTORA',   icon: '/assets/roles/consultora.png',   emoji: '👩‍💼', title: 'Consultora',   desc: 'Vendo por catálogo a clientes directos' },
              { value: 'DISTRIBUIDOR', icon: '/assets/roles/distribuidor.png', emoji: '🚚', title: 'Distribuidor',  desc: 'Gestiono rutas y reparto de pedidos' },
            ].map(r => (
              <label
                key={r.value}
                className={`rol-card ${data.rol === r.value ? 'selected' : ''}`}
                onClick={() => { setData(d => ({ ...d, rol: r.value })); setErrors(er => ({ ...er, rol: '' })); }}
              >
                <input type="radio" name="rol" value={r.value} checked={data.rol === r.value} onChange={() => {}} className="sr-only" />
                <div className="rol-card-img-wrap">
                  <img src={r.icon} alt={r.title} className="rol-card-img"
                    onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                  <div className="rol-card-img-placeholder" style={{ display: 'none' }}>{r.emoji}</div>
                </div>
                <span className="rol-card-title">{r.title}</span>
                <span className="rol-card-desc">{r.desc}</span>
                <span className="rol-check">{data.rol === r.value ? '✓' : ''}</span>
              </label>
            ))}
          </div>
          {errors.rol && <p className="auth-field-error">{errors.rol}</p>}
        </div>

        {/* Términos */}
        <label className="auth-terms">
          <input type="checkbox" checked={data.terms} onChange={e => { setData(d => ({ ...d, terms: e.target.checked })); setErrors(er => ({ ...er, terms: '' })); }} />
          <span className="auth-terms-label">
            Acepto los{' '}
            <button type="button" className="auth-terms-link" onClick={onOpenTerms}>
              Términos y Condiciones
            </button>
            {' '}y la{' '}
            <button type="button" className="auth-terms-link" onClick={onOpenTerms}>
              Política de Privacidad
            </button>
          </span>
        </label>
        {errors.terms && <p className="auth-field-error">{errors.terms}</p>}

        <button type="submit" className="auth-btn-submit">
          Continuar <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </form>

      <div className="auth-footer">
        <p className="auth-footer-text">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="auth-footer-link">Inicia sesión →</Link>
        </p>
      </div>

    </>
  );
}

// ── Paso 2: Perfil completo ───────────────────────────────────────
function Step2({ data, setData, onSubmit, onBack, loading }) {
  const [errors, setErrors] = useState({});
  const [previewFoto, setPreviewFoto] = useState(null);

  const f = (field) => (e) => { setData(d => ({ ...d, [field]: e.target.value })); setErrors(er => ({ ...er, [field]: '' })); };

  const handleFoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setErrors(er => ({ ...er, foto: 'La imagen debe pesar menos de 2 MB' })); return; }
    setData(d => ({ ...d, foto: file }));
    setPreviewFoto(URL.createObjectURL(file));
    setErrors(er => ({ ...er, foto: '' }));
  };

  const validate = () => {
    const e = {};
    if (!data.dni.trim())      e.dni      = 'Ingresa tu DNI';
    else if (!/^\d{8}$/.test(data.dni)) e.dni = 'El DNI debe tener 8 dígitos';
    if (!data.telefono.trim()) e.telefono = 'Ingresa tu teléfono';
    else if (!/^9\d{8}$/.test(data.telefono)) e.telefono = 'Ingresa un celular válido (9XXXXXXXX)';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const e2 = validate();
    setErrors(e2);
    if (Object.keys(e2).length === 0) onSubmit();
  };

  return (
    <>
      <div className="auth-form-header">
        <div className="auth-form-eyebrow">Paso 2 de 2 · Completa tu perfil</div>
        <h1 className="auth-form-title">Cuéntanos<br />sobre <em>ti</em></h1>
        <p className="auth-form-subtitle">
          Esta información nos ayuda a personalizar tu experiencia.
          Puedes editarla después.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate>

        {/* Foto de perfil */}
        <div className="auth-input-group">
          <label>Foto de perfil <span className="optional-label">(opcional)</span></label>
          <div className="foto-upload-wrap">
            <div className="foto-preview">
              {previewFoto
                ? <img src={previewFoto} alt="preview" className="foto-preview-img" />
                : <div className="foto-preview-placeholder">
                    {/* Reemplaza con tu ícono o imagen por defecto */}
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                      <circle cx="16" cy="12" r="6" stroke="#d1d5db" strokeWidth="2"/>
                      <path d="M4 28c0-6.627 5.373-10 12-10s12 3.373 12 10" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
              }
            </div>
            <div className="foto-upload-info">
              <label htmlFor="foto-input" className="btn-upload-foto">
                {previewFoto ? 'Cambiar foto' : 'Subir foto'}
              </label>
              <input id="foto-input" type="file" accept="image/*" onChange={handleFoto} className="sr-only" />
              <span className="foto-hint">JPG, PNG o WEBP · Máx. 2 MB</span>
              {errors.foto && <p className="auth-field-error">{errors.foto}</p>}
            </div>
          </div>
        </div>

        {/* DNI */}
        <div className="auth-input-group">
          <label>DNI <span className="required-label">*</span></label>
          <div className={`auth-input-wrap ${errors.dni ? 'input-error' : ''}`}>
            <span className="auth-input-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M4 9h3M4 11h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><circle cx="10.5" cy="8" r="2" stroke="currentColor" strokeWidth="1.2"/></svg>
            </span>
            <input type="text" placeholder="12345678" maxLength={8} value={data.dni} onChange={f('dni')} inputMode="numeric" />
          </div>
          {errors.dni && <p className="auth-field-error">{errors.dni}</p>}
        </div>

        {/* Teléfono */}
        <div className="auth-input-group">
          <label>Teléfono / Celular <span className="required-label">*</span></label>
          <div className={`auth-input-wrap ${errors.telefono ? 'input-error' : ''}`}>
            <span className="auth-input-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 2a1 1 0 011-1h2.5l1 3-1.5 1a9 9 0 004 4l1-1.5 3 1V12a1 1 0 01-1 1C6.268 13 2 8.732 2 3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
            <input type="tel" placeholder="987654321" maxLength={9} value={data.telefono} onChange={f('telefono')} inputMode="numeric" />
          </div>
          {errors.telefono && <p className="auth-field-error">{errors.telefono}</p>}
        </div>

        {/* Dirección */}
        <div className="auth-input-group">
          <label>Dirección <span className="optional-label">(opcional)</span></label>
          <div className="auth-input-wrap">
            <span className="auth-input-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1a5 5 0 015 5c0 4-5 9-5 9S3 10 3 6a5 5 0 015-5z" stroke="currentColor" strokeWidth="1.5"/><circle cx="8" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.2"/></svg>
            </span>
            <input type="text" placeholder="Av. Ejemplo 123, Lima" value={data.direccion} onChange={f('direccion')} />
          </div>
        </div>

        <div className="step2-actions">
          <button type="button" className="btn-back-step" onClick={onBack}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Atrás
          </button>
          <button type="submit" className="auth-btn-submit" style={{ flex: 1 }} disabled={loading}>
            {loading
              ? <><span className="auth-spinner" /> Creando cuenta...</>
              : <>Crear mi cuenta <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></>
            }
          </button>
        </div>
      </form>

      <div className="auth-footer">
        <p className="auth-footer-text">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="auth-footer-link">Inicia sesión →</Link>
        </p>
      </div>
    </>
  );
}

// ── Register principal ────────────────────────────────────────────
export default function Register() {
  const [step, setStep]       = useState(1);
  const [loading, setLoading]   = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const navigate            = useNavigate();
  const { show: showToast } = useToast();

  const [data, setData] = useState({
    nombre: '', email: '', password: '', confirmar: '',
    rol: '', terms: false,
    dni: '', telefono: '', direccion: '', foto: null,
  });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        nombre:   data.nombre,
        email:    data.email,
        password: data.password,
        perfil:   data.rol,
        dni:      data.dni,
        telefono: data.telefono,
        direccion: data.direccion,
      };
      const response = await authRegister(payload);
      saveToken(response.token);
      showToast('¡Cuenta creada con éxito! Bienvenida 🌸', 'success');
      navigate('/dashboard');
    } catch {
      showToast('No se pudo crear la cuenta. Intenta de nuevo.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const LEFT_CONTENT = {
    1: {
      quote: <>Empieza hoy,<br /><em>gratis</em> y sin<br />complicaciones.</>,
      sub: 'Crea tu cuenta en menos de 2 minutos y únete a miles de consultoras que ya transformaron su negocio.',
      extra: (
        <div className="auth-steps">
          {[
            { n: '1', text: 'Crea tu cuenta gratis', active: true },
            { n: '2', text: 'Completa tu perfil',    active: false },
            { n: '3', text: 'Empieza a vender mejor',active: false },
          ].map(s => (
            <div key={s.n} className={`auth-step-item ${s.active ? 'active-step' : ''}`}>
              <div className={`auth-step-num ${s.active ? '' : 'step-inactive'}`}>{s.n}</div>
              <span className="auth-step-text">{s.text}</span>
            </div>
          ))}
        </div>
      ),
    },
    2: {
      quote: <>Casi listo,<br />personaliza<br />tu <em>perfil</em>.</>,
      sub: 'Tu información es segura con nosotros. Usada únicamente para personalizar tu experiencia en GELCO.',
      extra: (
        <div className="auth-steps">
          {[
            { n: '✓', text: 'Cuenta creada',          done: true  },
            { n: '2', text: 'Completa tu perfil',      active: true },
            { n: '3', text: 'Empieza a vender mejor',  active: false },
          ].map((s, i) => (
            <div key={i} className={`auth-step-item ${s.active ? 'active-step' : ''}`}>
              <div className={`auth-step-num ${s.done ? 'step-done' : s.active ? '' : 'step-inactive'}`}>{s.n}</div>
              <span className="auth-step-text">{s.text}</span>
            </div>
          ))}
        </div>
      ),
    },
  };

  const left = LEFT_CONTENT[step];

  return (
    <>
    <div className="auth-page">
      {/* ── PANEL IZQUIERDO ── */}
      <div className="auth-left">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
        <div className="auth-orb auth-orb-3" />

        <div className="auth-left-brand">
          <img src="/assets/logo-empresa.png" alt="GELCO" />
          <span className="auth-left-brand-name">GELCO</span>
        </div>

        {/* Slot imagen — reemplaza src */}
        <div className="auth-left-img-wrap">
          <img src="/assets/auth/register-hero.png" alt="Únete a GELCO"
            className="auth-left-img" onError={e => { e.target.style.display = 'none'; }} />
        </div>

        <div className="auth-left-content">
          <h2 className="auth-left-quote">{left.quote}</h2>
          <p className="auth-left-sub">{left.sub}</p>
        </div>

        {left.extra}

        <div className="auth-testimonial">
          <div className="auth-testimonial-stars">★★★★★</div>
          <p className="auth-testimonial-text">
            "Me registré en 2 minutos y al día siguiente ya tenía
            mis primeros pedidos registrados. Es increíblemente fácil."
          </p>
          <div className="auth-testimonial-author">
            <div className="auth-testimonial-avatar">MR</div>
            <div>
              <div className="auth-testimonial-name">Magdalena Ramos</div>
              <div className="auth-testimonial-role">Consultora · Nivel Plata · SJL</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── PANEL DERECHO ── */}
      <div className="auth-right">
        <div className="auth-form-wrap">
          <Link to={step === 1 ? '/' : '#'} className="auth-back"
            onClick={step === 2 ? (e) => { e.preventDefault(); setStep(1); } : undefined}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {step === 1 ? 'Volver al inicio' : 'Volver al paso anterior'}
          </Link>

          {/* Barra de progreso */}
          <div className="register-progress">
            <div className="register-progress-bar">
              <div className="register-progress-fill" style={{ width: `${(step / 2) * 100}%` }} />
            </div>
            <span className="register-progress-label">Paso {step} de 2</span>
          </div>

          {step === 1 && (
            <Step1 data={data} setData={setData} onNext={() => setStep(2)} onOpenTerms={() => setShowTerms(true)} />
          )}
          {step === 2 && (
            <Step2 data={data} setData={setData} onSubmit={handleSubmit} onBack={() => setStep(1)} loading={loading} />
          )}
        </div>
      </div>
    </div>

      {showTerms && (
        <TermsModal
          onAccept={() => setData(d => ({ ...d, terms: true }))}
          onClose={() => setShowTerms(false)}
        />
      )}
    </>
  );
}