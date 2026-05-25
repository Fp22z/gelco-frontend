import { useState, useMemo, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register as authRegister, registerWithPhoto as authRegisterWithPhoto, saveToken, checkEmail as checkEmailExists } from '../../services/authService';
import { useToast } from '../../services/toastService.jsx';
import './Login.css';

// ── Password validation ────────────────────────────────────────────
function getPasswordChecks(pw) {
  return [
    { label: 'Mínimo 8 caracteres', passed: pw && pw.length >= 8 },
    { label: 'Al menos una mayúscula', passed: pw && /[A-Z]/.test(pw) },
    { label: 'Al menos un número', passed: pw && /[0-9]/.test(pw) },
    { label: 'Al menos un carácter especial', passed: pw && /[^A-Za-z0-9]/.test(pw) },
  ];
}

function getStrength(pw) {
  if (!pw) return { score: 0, label: '', color: '#e5e7eb' };
  let score = 0;
  if (pw.length >= 8)          score++;
  if (/[A-Z]/.test(pw))        score++;
  if (/[0-9]/.test(pw))        score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map = [
    { label: '',          color: '#e5e7eb' },
    { label: 'Muy débil', color: '#ef4444' },
    { label: 'Débil',     color: '#f59e0b' },
    { label: 'Regular',   color: '#f59e0b' },
    { label: 'Buena',     color: '#10b981' },
  ];
  return { ...map[score], score };
}

// ── EyeIcon ───────────────────────────────────────────────────────
const EyeIcon = ({ open }) => open
  ? <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8s2.5-5 6-5 6 5 6 5-2.5 5-6 5-6-5-6-5z" stroke="currentColor" strokeWidth="1.5"/><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/><path d="M2 2l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
  : <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8s2.5-5 6-5 6 5 6 5-2.5 5-6 5-6-5-6-5z" stroke="currentColor" strokeWidth="1.5"/><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/></svg>;

// ── Modal Terminos y Condiciones ──────────────────────────────────
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

        <h3 className="auth-modal-title">Terminos y Condiciones</h3>
        <p className="auth-modal-desc">Ultima actualizacion: enero 2026 · Lee hasta el final para aceptar.</p>

        <div className="terms-scroll-area" onScroll={handleScroll}>
          <h4>1. Aceptacion de los terminos</h4>
          <p>Al crear una cuenta en GELCO, aceptas quedar vinculada a estos Terminos y Condiciones. Si no estas de acuerdo con alguna parte, no debes utilizar el servicio.</p>

          <h4>2. Descripcion del servicio</h4>
          <p>GELCO es una plataforma de gestion de ventas por catalogo disenada para consultoras y distribuidores independientes en el territorio peruano. Permite registrar pedidos, gestionar clientes, visualizar catalogos de productos y acceder a capacitaciones.</p>

          <h4>3. Uso de la cuenta</h4>
          <p>Eres responsable de mantener la confidencialidad de tus credenciales de acceso. GELCO no sera responsable de perdidas derivadas del uso no autorizado de tu cuenta. Debes notificarnos inmediatamente ante cualquier uso no autorizado.</p>

          <h4>4. Privacidad y datos personales</h4>
          <p>Recopilamos y procesamos tus datos personales de acuerdo con la Ley N.° 29733 — Ley de Proteccion de Datos Personales del Peru. Tus datos seran utilizados exclusivamente para la prestacion del servicio y no seran compartidos con terceros sin tu consentimiento, salvo obligacion legal.</p>

          <h4>5. Conducta del usuario</h4>
          <p>Te comprometes a utilizar GELCO de manera etica y legal. Esta prohibido registrar informacion falsa, usar el sistema para actividades fraudulentas o intentar acceder a cuentas ajenas.</p>

          <h4>6. Propiedad intelectual</h4>
          <p>Todo el contenido de GELCO — incluyendo disenio, codigo, textos y marca — es propiedad de GELCO y esta protegido por las leyes de propiedad intelectual. No puedes reproducir, distribuir ni modificar ningun elemento sin autorizacion expresa.</p>

          <h4>7. Limitacion de responsabilidad</h4>
          <p>GELCO no garantiza la disponibilidad continua del servicio y no sera responsable por danios indirectos, perdidas de ingresos o interrupciones del negocio derivadas del uso o imposibilidad de uso de la plataforma.</p>

          <h4>8. Modificaciones</h4>
          <p>Nos reservamos el derecho de modificar estos terminos en cualquier momento. Te notificaremos por correo electronico ante cambios significativos. El uso continuado del servicio tras la notificacion implica la aceptacion de los nuevos terminos.</p>

          <h4>9. Cancelacion</h4>
          <p>Puedes cancelar tu cuenta en cualquier momento desde la configuracion de tu perfil. GELCO puede suspender o cancelar cuentas que incumplan estos terminos sin previo aviso.</p>

          <h4>10. Ley aplicable</h4>
          <p>Estos terminos se rigen por las leyes de la Republica del Peru. Cualquier disputa sera resuelta ante los tribunales competentes de Lima.</p>

          <h4>11. Contacto</h4>
          <p>Para consultas sobre estos terminos, escribenos a: <strong>legal@gelco.pe</strong></p>
        </div>

        {!scrolled && (
          <p className="terms-scroll-hint">↓ Desplazate hasta el final para poder aceptar</p>
        )}

        <div className="terms-actions">
          <button className="auth-modal-cancel" onClick={onClose}>Cancelar</button>
          <button
            className="auth-btn-submit"
            style={{ flex: 1 }}
            disabled={!scrolled}
            onClick={() => { onAccept(); onClose(); }}
          >
            {scrolled ? 'Acepto los terminos' : 'Lee los terminos primero'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal Politica de Privacidad ──────────────────────────────────
function PrivacyPolicyModal({ onClose }) {
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

        <h3 className="auth-modal-title">Politica de Privacidad</h3>
        <p className="auth-modal-desc">Ultima actualizacion: enero 2026 · Tu privacidad es nuestra prioridad.</p>

        <div className="terms-scroll-area" onScroll={handleScroll}>
          <h4>1. Recopilacion de datos</h4>
          <p>En GELCO recopilamos informacion personal que nos proporcionas al registrarte, como nombre, correo electronico, DNI, telefono, direccion y foto de perfil. Tambien podemos recopilar datos de uso de la plataforma, como paginas visitadas, acciones realizadas y tiempo de sesion.</p>

          <h4>2. Uso de datos</h4>
          <p>Utilizamos tu informacion personal para: crear y gestionar tu cuenta, procesar pedidos y transacciones, personalizar tu experiencia en la plataforma, enviarte comunicaciones relacionadas con el servicio, mejorar nuestras funcionalidades y cumplir con obligaciones legales.</p>

          <h4>3. Proteccion de datos (Ley N° 29733)</h4>
          <p>GELCO cumple con la Ley de Proteccion de Datos Personales del Peru (Ley N° 29733) y su reglamento. Implementamos medidas tecnicas y organizativas adecuadas para proteger tus datos personales contra acceso no autorizado, alteracion, divulgacion o destruccion. Tus datos se almacenan de forma segura y solo son accesibles por personal autorizado.</p>

          <h4>4. Cookies</h4>
          <p>Utilizamos cookies y tecnologias similares para mejorar tu experiencia, recordar tus preferencias, analizar el uso de la plataforma y ofrecer contenido relevante. Puedes configurar tu navegador para rechazar cookies, aunque esto puede afectar algunas funcionalidades del servicio.</p>

          <h4>5. Derechos del usuario</h4>
          <p>De acuerdo con la Ley N° 29733, tienes los siguientes derechos sobre tus datos personales:</p>
          <p><strong>Acceso:</strong> Puedes solicitar informacion sobre que datos personales tenemos almacenados.</p>
          <p><strong>Rectificacion:</strong> Puedes solicitar la correccion de datos inexactos o incompletos.</p>
          <p><strong>Cancelacion:</strong> Puedes solicitar la eliminacion de tus datos personales cuando consideres que ya no son necesarios para los fines para los cuales fueron recopilados.</p>
          <p><strong>Oposicion:</strong> Puedes oponerte al tratamiento de tus datos personales para fines especificos.</p>

          <h4>6. Comparticion de datos</h4>
          <p>No vendemos, compartimos ni transferimos tus datos personales a terceros, excepto cuando sea necesario para prestar el servicio (por ejemplo, proveedores de hosting), cuando lo exija la ley, o con tu consentimiento expreso.</p>

          <h4>7. Retencion de datos</h4>
          <p>Conservamos tus datos personales mientras tu cuenta este activa o segun sea necesario para cumplir con nuestras obligaciones legales, resolver disputas y hacer cumplir nuestros acuerdos.</p>

          <h4>8. Modificaciones</h4>
          <p>Nos reservamos el derecho de actualizar esta Politica de Privacidad en cualquier momento. Te notificaremos sobre cambios significativos a traves de la plataforma o por correo electronico.</p>

          <h4>9. Contacto</h4>
          <p>Para ejercer tus derechos, realizar consultas o presentar reclamos sobre el tratamiento de tus datos personales, contactanos en: <strong>privacidad@gelco.pe</strong></p>
        </div>

        {!scrolled && (
          <p className="terms-scroll-hint">↓ Desplazate hasta el final</p>
        )}

        <div className="terms-actions">
          <button className="auth-btn-submit" style={{ flex: 1 }} disabled={!scrolled} onClick={onClose}>
            {scrolled ? 'Entendido' : 'Lee la politica primero'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Paso 1: Datos de cuenta + rol ─────────────────────────────────
function Step1({ data, setData, onNext, onOpenTerms, onOpenPrivacy }) {
  const [showPw, setShowPw]     = useState(false);
  const [showPw2, setShowPw2]   = useState(false);
  const [errors, setErrors]     = useState({});
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailExists, setEmailExists]     = useState(false);
  const emailCheckRef = useRef(null);

  const strength       = useMemo(() => getStrength(data.password), [data.password]);
  const passwordChecks = useMemo(() => getPasswordChecks(data.password), [data.password]);
  const allChecksPassed = passwordChecks.every(c => c.passed);
  const pwMatch     = data.confirmar && data.password === data.confirmar;
  const pwNoMatch   = data.confirmar && data.password !== data.confirmar;
  const isFormReady = data.nombre.trim() && data.email.trim() && /\S+@\S+\.\S+/.test(data.email)
    && !emailChecking && !emailExists && data.password && allChecksPassed && data.confirmar && pwMatch && data.rol && data.terms;

  const checkEmail = useCallback(async (email) => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) return;
    setEmailChecking(true);
    setEmailExists(false);
    try {
      const exists = await checkEmailExists(email);
      setEmailExists(exists);
    } catch {}
    setEmailChecking(false);
  }, []);

  const validate = () => {
    const e = {};
    if (!data.nombre.trim())    e.nombre   = 'Ingresa tu nombre completo';
    if (!data.email.trim())     e.email    = 'Ingresa tu correo';
    else if (!/\S+@\S+\.\S+/.test(data.email)) e.email = 'Correo invalido';
    else if (emailChecking)     e.email    = 'Verificando correo...';
    else if (emailExists)       e.email    = 'Este correo ya esta registrado';
    if (!data.password)         e.password = 'Ingresa una contrasenia';
    else if (!allChecksPassed)  e.password = 'La contrasenia no cumple todos los requisitos';
    if (!data.confirmar)        e.confirmar = 'Confirma tu contrasenia';
    else if (data.password !== data.confirmar) e.confirmar = 'Las contrasenias no coinciden';
    if (!data.rol)              e.rol      = 'Elige un tipo de perfil';
    if (!data.terms)            e.terms    = 'Debes aceptar los terminos';
    return e;
  };

  const handleNext = (e) => {
    e.preventDefault();
    const e2 = validate();
    setErrors(e2);
    if (Object.keys(e2).length === 0) onNext();
  };

  const f = (field) => (e) => {
    setData(d => ({ ...d, [field]: e.target.value }));
    setErrors(er => ({ ...er, [field]: '' }));
    if (field === 'email') {
      if (emailCheckRef.current) clearTimeout(emailCheckRef.current);
      emailCheckRef.current = setTimeout(() => checkEmail(e.target.value), 600);
    }
  };

  return (
    <>
      <div className="auth-form-header">
        <div className="auth-form-eyebrow">Paso 1 de 2 · Crea tu cuenta</div>
        <h1 className="auth-form-title">Unete a <em>GELCO</em><br />es gratis</h1>
        <p className="auth-form-subtitle">Sin tarjeta de credito. Sin compromisos.</p>
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
          <label>Correo electronico</label>
          <div className={`auth-input-wrap ${errors.email || emailExists ? 'input-error' : ''}`}>
            <span className="auth-input-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4a1 1 0 011-1h10a1 1 0 011 1v8a1 1 0 01-1 1H3a1 1 0 01-1-1V4z" stroke="currentColor" strokeWidth="1.5"/><path d="M2 4l6 5 6-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </span>
            <input type="email" placeholder="ejemplo@correo.com" value={data.email} onChange={f('email')} autoComplete="email" />
            {emailChecking && <span className="auth-spinner" style={{ marginLeft: 8 }} />}
          </div>
          {emailExists && !errors.email && <p className="auth-field-error">Este correo ya esta registrado</p>}
          {errors.email && <p className="auth-field-error">{errors.email}</p>}
        </div>

        {/* Password */}
        <div className="auth-input-group">
          <label>Contrasenia</label>
          <div className={`auth-input-wrap ${errors.password ? 'input-error' : ''}`}>
            <span className="auth-input-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </span>
            <input type={showPw ? 'text' : 'password'} placeholder="Minimo 8 caracteres" value={data.password} onChange={f('password')} autoComplete="new-password" />
            <button type="button" className="auth-pw-toggle" onClick={() => setShowPw(v => !v)} tabIndex={-1}><EyeIcon open={showPw} /></button>
          </div>
          {data.password && (
            <>
              <div className="pw-strength-wrap">
                <div className="pw-strength-bar"><div className="pw-strength-fill" style={{ width: `${(strength.score/4)*100}%`, background: strength.color }} /></div>
                <span className="pw-strength-label" style={{ color: strength.color }}>{strength.label}</span>
              </div>
              <div className="pw-checks">
                {passwordChecks.map((check, i) => (
                  <div key={i} className={`pw-check-item ${check.passed ? 'passed' : ''}`}>
                    <span className="pw-check-icon">{check.passed ? '✓' : '·'}</span>
                    <span>{check.label}</span>
                  </div>
                ))}
              </div>
            </>
          )}
          {errors.password && <p className="auth-field-error">{errors.password}</p>}
        </div>

        {/* Confirmar */}
        <div className="auth-input-group">
          <label>Confirmar contrasenia</label>
          <div className={`auth-input-wrap ${pwNoMatch || errors.confirmar ? 'input-error' : pwMatch ? 'input-success' : ''}`}>
            <span className="auth-input-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </span>
            <input type={showPw2 ? 'text' : 'password'} placeholder="Repite tu contrasenia" value={data.confirmar} onChange={f('confirmar')} autoComplete="new-password" />
            <button type="button" className="auth-pw-toggle" onClick={() => setShowPw2(v => !v)} tabIndex={-1}><EyeIcon open={showPw2} /></button>
          </div>
          {errors.confirmar && <p className="auth-field-error">{errors.confirmar}</p>}
          {pwMatch && !errors.confirmar && <p className="auth-field-ok">✓ Las contrasenias coinciden</p>}
        </div>

        {/* Rol */}
        <div className="auth-input-group">
          <label>Tipo de perfil</label>
          <div className={`rol-selector ${errors.rol ? 'input-error-border' : ''}`}>
            {[
              { value: 'CONSULTORA',   icon: '/assets/roles/consultora.png',   emoji: '👩‍💼', title: 'Consultora',   desc: 'Vendo por catalogo a clientes directos' },
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
                  <div className="rol-card-img-placeholder visible">{r.emoji}</div>
                </div>
                <div className="rol-card-title">{r.title}</div>
                <div className="rol-card-desc">{r.desc}</div>
                <span className="rol-check">{data.rol === r.value ? '✓' : ''}</span>
              </label>
            ))}
          </div>
          {errors.rol && <p className="auth-field-error">{errors.rol}</p>}
        </div>

        {/* Terminos */}
        <label className="auth-terms">
          <input type="checkbox" checked={data.terms} onChange={e => { setData(d => ({ ...d, terms: e.target.checked })); setErrors(er => ({ ...er, terms: '' })); }} />
          <span className="auth-terms-label">
            Acepto los{' '}
            <button type="button" className="auth-terms-link" onClick={onOpenTerms}>
              Terminos y Condiciones
            </button>
            {' '}y la{' '}
            <button type="button" className="auth-terms-link" onClick={onOpenPrivacy}>
              Politica de Privacidad
            </button>
          </span>
        </label>
        {errors.terms && <p className="auth-field-error">{errors.terms}</p>}

        <button type="submit" className="auth-btn-submit" disabled={!isFormReady}>
          Continuar <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </form>

      <div className="auth-footer">
        <p className="auth-footer-text">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="auth-footer-link">Inicia sesion →</Link>
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
    else if (!/^\d{8}$/.test(data.dni)) e.dni = 'El DNI debe tener 8 digitos';
    if (!data.telefono.trim()) e.telefono = 'Ingresa tu telefono';
    else if (!/^9\d{8}$/.test(data.telefono)) e.telefono = 'Ingresa un celular valido (9XXXXXXXX)';
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
        <h1 className="auth-form-title">Cuentanos<br />sobre <em>ti</em></h1>
        <p className="auth-form-subtitle">
          Esta informacion nos ayuda a personalizar tu experiencia.
          Puedes editarla despues.
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
              <span className="foto-hint">JPG, PNG o WEBP · Max. 2 MB</span>
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

        {/* Telefono */}
        <div className="auth-input-group">
          <label>Telefono / Celular <span className="required-label">*</span></label>
          <div className={`auth-input-wrap ${errors.telefono ? 'input-error' : ''}`}>
            <span className="auth-input-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 2a1 1 0 011-1h2.5l1 3-1.5 1a9 9 0 004 4l1-1.5 3 1V12a1 1 0 01-1 1C6.268 13 2 8.732 2 3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
            <input type="tel" placeholder="987654321" maxLength={9} value={data.telefono} onChange={f('telefono')} inputMode="numeric" />
          </div>
          {errors.telefono && <p className="auth-field-error">{errors.telefono}</p>}
        </div>

        {/* Direccion */}
        <div className="auth-input-group">
          <label>Direccion <span className="optional-label">(opcional)</span></label>
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
            Atras
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
          <Link to="/login" className="auth-footer-link">Inicia sesion →</Link>
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
  const [showPrivacy, setShowPrivacy] = useState(false);
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
        foto:     data.foto,
      };
      const response = data.foto ? await authRegisterWithPhoto(payload) : await authRegister(payload);
      saveToken(response.token);
      showToast('¡Cuenta creada con exito! Bienvenida 🌸', 'success');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('email') || msg.toLowerCase().includes('correo')) {
        showToast('Este correo ya esta registrado', 'danger');
      } else {
        showToast(msg || 'No se pudo crear la cuenta. Intenta de nuevo.', 'danger');
      }
    } finally {
      setLoading(false);
    }
  };

  const LEFT_CONTENT = {
    1: {
      quote: <>Empieza hoy,<br /><em>gratis</em> y sin<br />complicaciones.</>,
      sub: 'Crea tu cuenta en menos de 2 minutos y unete a miles de consultoras que ya transformaron su negocio.',
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
      sub: 'Tu informacion es segura con nosotros. Usada unicamente para personalizar tu experiencia en GELCO.',
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
          <img src="/assets/auth/register-hero.png" alt="Unete a GELCO"
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
            "Me registre en 2 minutos y al dia siguiente ya tenia
            mis primeros pedidos registrados. Es increiblemente facil."
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
            <Step1 data={data} setData={setData} onNext={() => setStep(2)} onOpenTerms={() => setShowTerms(true)} onOpenPrivacy={() => setShowPrivacy(true)} />
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

      {showPrivacy && (
        <PrivacyPolicyModal
          onClose={() => setShowPrivacy(false)}
        />
      )}
    </>
  );
}