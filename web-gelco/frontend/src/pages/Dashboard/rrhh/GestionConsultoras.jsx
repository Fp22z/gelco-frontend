import { useState, useEffect, useMemo } from 'react';
import {
  getConsultoras,
  registrarConsultora,
  actualizarConsultora,
  toggleEstadoConsultora
} from '../../../services/consultoraService';
import { useToast } from '../../../services/toastService';
import './GestionConsultoras.css';

const NIVELES = ['Bronce', 'Plata', 'Oro'];

const initForm = {
  nombre: '', email: '', password: '', dni: '',
  telefono: '', direccion: '', nivel: 'Bronce'
};

const initEdit = {
  dni: '', telefono: '', direccion: '', nivel: 'Bronce'
};

// ── Helpers de contraseña ─────────────────────────────────────────
function getPasswordChecks(pw) {
  return [
    { label: 'Mínimo 8 caracteres',          passed: pw && pw.length >= 8 },
    { label: 'Al menos una mayúscula',        passed: pw && /[A-Z]/.test(pw) },
    { label: 'Al menos un número',            passed: pw && /[0-9]/.test(pw) },
    { label: 'Al menos un carácter especial', passed: pw && /[^A-Za-z0-9]/.test(pw) },
  ];
}

function getStrength(pw) {
  if (!pw) return { score: 0, label: '', color: '#e5e7eb' };
  let score = 0;
  if (pw.length >= 8)           score++;
  if (/[A-Z]/.test(pw))         score++;
  if (/[0-9]/.test(pw))         score++;
  if (/[^A-Za-z0-9]/.test(pw))  score++;
  const map = [
    { label: '',           color: '#e5e7eb' },
    { label: 'Muy débil',  color: '#ef4444' },
    { label: 'Débil',      color: '#f59e0b' },
    { label: 'Regular',    color: '#f59e0b' },
    { label: 'Buena',      color: '#10b981' },
  ];
  return { ...map[score], score };
}

export default function GestionConsultoras() {
  const { show } = useToast();

  const [consultoras, setConsultoras]   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [busqueda, setBusqueda]         = useState('');
  const [filtroNivel, setFiltroNivel]   = useState('');
  const [modalConfirm, setModalConfirm] = useState(null);

  const [modalNueva, setModalNueva]     = useState(false);
  const [modalDetalle, setModalDetalle] = useState(null);
  const [modalEditar, setModalEditar]   = useState(null);

  const [form, setForm]         = useState(initForm);
  const [editForm, setEditForm] = useState(initEdit);
  const [submitting, setSubmitting] = useState(false);
  const [showPw, setShowPw]     = useState(false);

  // ── Carga inicial ─────────────────────────────────────────
  useEffect(() => { cargarConsultoras(); }, []);

  const cargarConsultoras = async () => {
    try {
      setLoading(true);
      const data = await getConsultoras();
      setConsultoras(data);
    } catch {
      show('No se pudieron cargar las consultoras', 'danger');
    } finally {
      setLoading(false);
    }
  };

  // ── Filtrado ──────────────────────────────────────────────
  const consultorasFiltradas = useMemo(() => {
    return consultoras.filter(c => {
      const texto = busqueda.toLowerCase();
      const coincideTexto =
        !texto ||
        c.usuarioNombre?.toLowerCase().includes(texto) ||
        c.usuarioEmail?.toLowerCase().includes(texto) ||
        c.dni?.toLowerCase().includes(texto);
      const coincideNivel = !filtroNivel || c.nivel === filtroNivel;
      return coincideTexto && coincideNivel;
    });
  }, [consultoras, busqueda, filtroNivel]);

  // ── Stats ─────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:  consultoras.length,
    oro:    consultoras.filter(c => c.nivel === 'Oro').length,
    plata:  consultoras.filter(c => c.nivel === 'Plata').length,
    bronce: consultoras.filter(c => c.nivel === 'Bronce').length,
  }), [consultoras]);

  // ── Registrar nueva ───────────────────────────────────────
  const handleRegistrar = async (e) => {
    e.preventDefault();
    if (!form.nombre || !form.email || !form.password || !form.dni || !form.telefono) {
      show('Completa todos los campos obligatorios', 'warning');
      return;
    }
    const checks = getPasswordChecks(form.password);
    const faltantes = checks.filter(c => !c.passed).map(c => c.label);
    if (faltantes.length > 0) {
      show(`Contraseña incompleta: ${faltantes.join(', ')}`, 'warning');
      return;
    }
    try {
      setSubmitting(true);
      await registrarConsultora(form);
      show(`Consultora ${form.nombre} registrada exitosamente`, 'success');
      setModalNueva(false);
      setForm(initForm);
      setShowPw(false);
      cargarConsultoras();
    } catch (err) {
      show(err.message || 'Error al registrar consultora', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Editar ────────────────────────────────────────────────
  const abrirEditar = (c) => {
    setModalEditar(c);
    setEditForm({
      dni:       c.dni       || '',
      telefono:  c.telefono  || '',
      direccion: c.direccion || '',
      nivel:     c.nivel     || 'Bronce',
    });
  };

  const handleEditar = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await actualizarConsultora(modalEditar.id, editForm);
      setModalEditar(null);
      cargarConsultoras();
      show('Consultora actualizada correctamente', 'success');
    } catch (err) {
      show(err.message || 'Error al actualizar', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Toggle estado ─────────────────────────────────────────
  const pedirConfirmacion = (c) => {
    const estaActiva = c.estadoUsuario !== false;
    setModalConfirm({ consultora: c, accion: estaActiva ? 'desactivar' : 'activar' });
  };

  const handleToggle = async () => {
    const { consultora, accion } = modalConfirm;
    const estaActiva = consultora.estadoUsuario !== false;
    setModalConfirm(null);
    try {
      await toggleEstadoConsultora(consultora.usuarioId);
      setConsultoras(prev =>
        prev.map(c => c.id === consultora.id ? { ...c, estadoUsuario: !estaActiva } : c)
      );
      show(`Consultora ${!estaActiva ? 'activada' : 'desactivada'} correctamente`, 'success');
      cargarConsultoras();
    } catch {
      show(`No se pudo ${accion} la consultora`, 'danger');
    }
  };

  // ── Helpers UI ────────────────────────────────────────────
  const iniciales = (nombre) =>
    nombre ? nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?';

  const nivelClass = (nivel) => {
    if (nivel === 'Oro')   return 'gc-nivel gc-nivel-oro';
    if (nivel === 'Plata') return 'gc-nivel gc-nivel-plata';
    return 'gc-nivel gc-nivel-bronce';
  };

  const nivelIcon = (nivel) => {
    if (nivel === 'Oro')   return '🥇';
    if (nivel === 'Plata') return '🥈';
    return '🥉';
  };

  // ── Password strength UI ──────────────────────────────────
  const PasswordStrength = ({ password }) => {
    if (!password) return null;
    const strength = getStrength(password);
    const checks   = getPasswordChecks(password);
    return (
      <>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
          <div style={{ flex: 1, height: '6px', background: '#f3f4f6', borderRadius: '3px' }}>
            <div style={{
              height: '100%',
              width: `${(strength.score / 4) * 100}%`,
              background: strength.color,
              borderRadius: '3px',
              transition: 'width 0.3s ease, background 0.3s ease'
            }} />
          </div>
          <span style={{ fontSize: '11px', fontWeight: '600', color: strength.color, whiteSpace: 'nowrap' }}>
            {strength.label}
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginTop: '6px' }}>
          {checks.map((check, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              fontSize: '11px', color: check.passed ? '#10b981' : '#9ca3af'
            }}>
              <span style={{ fontWeight: '700' }}>{check.passed ? '✓' : '·'}</span>
              <span>{check.label}</span>
            </div>
          ))}
        </div>
      </>
    );
  };

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="gc-page">

      {/* Header */}
      <div className="gc-header">
        <div className="gc-header-text">
          <h2>Gestión de <em>Consultoras</em></h2>
          <p>Registra, edita y administra las consultoras de ventas</p>
        </div>
        <button className="gc-btn-nueva" onClick={() => { setForm(initForm); setShowPw(false); setModalNueva(true); }}>
          ➕ Nueva Consultora
        </button>
      </div>

      {/* Stats */}
      <div className="gc-stats">
        <div className="gc-stat-card">
          <div className="gc-stat-icon">👥</div>
          <div className="gc-stat-info"><p>Total</p><strong>{stats.total}</strong></div>
        </div>
        <div className="gc-stat-card">
          <div className="gc-stat-icon">🥇</div>
          <div className="gc-stat-info"><p>Nivel Oro</p><strong>{stats.oro}</strong></div>
        </div>
        <div className="gc-stat-card">
          <div className="gc-stat-icon">🥈</div>
          <div className="gc-stat-info"><p>Nivel Plata</p><strong>{stats.plata}</strong></div>
        </div>
        <div className="gc-stat-card">
          <div className="gc-stat-icon">🥉</div>
          <div className="gc-stat-info"><p>Nivel Bronce</p><strong>{stats.bronce}</strong></div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="gc-toolbar">
        <div className="gc-search-box">
          <span>🔍</span>
          <input
            placeholder="Buscar por nombre, email o DNI..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>
        <select
          className="gc-filter-select"
          value={filtroNivel}
          onChange={e => setFiltroNivel(e.target.value)}
        >
          <option value="">Todos los niveles</option>
          {NIVELES.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>

      {/* Tabla */}
      <div className="gc-table-wrap">
        <table className="gc-table">
          <thead>
            <tr>
              <th>Consultora</th>
              <th>DNI</th>
              <th>Teléfono</th>
              <th>Ventas totales</th>
              <th>Nivel</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7}><div className="gc-table-empty"><span>⏳</span><p>Cargando consultoras...</p></div></td></tr>
            ) : consultorasFiltradas.length === 0 ? (
              <tr><td colSpan={7}><div className="gc-table-empty"><span>🔍</span><p>No se encontraron consultoras</p></div></td></tr>
            ) : (
              consultorasFiltradas.map(c => (
                <tr key={c.id}>
                  <td>
                    <div className="gc-cell-consultora">
                      <div className="gc-avatar">{iniciales(c.usuarioNombre)}</div>
                      <div>
                        <div className="gc-cell-name">{c.usuarioNombre}</div>
                        <div className="gc-cell-email">{c.usuarioEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td>{c.dni || '—'}</td>
                  <td>{c.telefono || '—'}</td>
                  <td><span className="gc-ventas">S/ {Number(c.ventasTotales || 0).toFixed(2)}</span></td>
                  <td><span className={nivelClass(c.nivel)}>{nivelIcon(c.nivel)} {c.nivel || 'Bronce'}</span></td>
                  <td>
                    <span className={`gc-estado ${c.estadoUsuario !== false ? 'gc-estado-activo' : 'gc-estado-inactivo'}`}>
                      <span className="gc-estado-dot" />
                      {c.estadoUsuario !== false ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td>
                    <div className="gc-acciones">
                      <button className="gc-btn-accion gc-btn-ver" title="Ver detalle" onClick={() => setModalDetalle(c)}>👁️</button>
                      <button className="gc-btn-accion gc-btn-editar" title="Editar" onClick={() => abrirEditar(c)}>✏️</button>
                      <button
                        className={`gc-btn-accion ${c.estadoUsuario !== false ? 'gc-btn-toggle-on' : 'gc-btn-toggle-off'}`}
                        title={c.estadoUsuario !== false ? 'Desactivar' : 'Activar'}
                        onClick={() => pedirConfirmacion(c)}
                      >
                        {c.estadoUsuario !== false ? '🟢' : '🔴'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── MODAL NUEVA CONSULTORA ──────────────────────── */}
      {modalNueva && (
        <div className="gc-modal-overlay" onClick={() => { setModalNueva(false); setForm(initForm); setShowPw(false); }}>
          <div className="gc-modal" onClick={e => e.stopPropagation()}>
            <div className="gc-modal-header">
              <div>
                <h3>Registrar Consultora</h3>
                <p>Crea el acceso y perfil de la nueva consultora</p>
              </div>
              <button className="gc-modal-close" onClick={() => { setModalNueva(false); setForm(initForm); setShowPw(false); }}>✕</button>
            </div>
            <form onSubmit={handleRegistrar} autoComplete="off">
              <div className="gc-modal-body">

                <p className="gc-modal-section-title">📋 Datos de acceso</p>

                <div className="gc-field">
                  <label>Nombre completo <span>*</span></label>
                  <input
                    placeholder="Ej: Ana García López"
                    value={form.nombre}
                    autoComplete="off"
                    onChange={e => setForm({ ...form, nombre: e.target.value })}
                    required
                  />
                </div>

                <div className="gc-modal-row">
                  <div className="gc-field">
                    <label>Email <span>*</span></label>
                    <input
                      type="email"
                      placeholder="correo@ejemplo.com"
                      value={form.email}
                      autoComplete="off"
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="gc-field">
                    <label>Contraseña temporal <span>*</span></label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPw ? 'text' : 'password'}
                        placeholder="Mín. 8 caracteres"
                        value={form.password}
                        autoComplete="new-password"
                        onChange={e => setForm({ ...form, password: e.target.value })}
                        required
                        style={{ paddingRight: '40px', width: '100%', boxSizing: 'border-box' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw(v => !v)}
                        tabIndex={-1}
                        style={{
                          position: 'absolute', right: '10px', top: '50%',
                          transform: 'translateY(-50%)', background: 'none',
                          border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '4px',
                          fontSize: '15px', lineHeight: 1
                        }}
                      >
                        {showPw ? '🙈' : '👁️'}
                      </button>
                    </div>
                    <PasswordStrength password={form.password} />
                  </div>
                </div>

                <hr className="gc-modal-divider" />
                <p className="gc-modal-section-title">👤 Datos personales</p>

                <div className="gc-modal-row">
                  <div className="gc-field">
                    <label>DNI <span>*</span></label>
                    <input
                      placeholder="12345678"
                      maxLength={8}
                      value={form.dni}
                      autoComplete="off"
                      onChange={e => setForm({ ...form, dni: e.target.value.replace(/\D/g, '') })}
                      required
                    />
                  </div>
                  <div className="gc-field">
                    <label>Teléfono <span>*</span></label>
                    <input
                      placeholder="987654321"
                      value={form.telefono}
                      autoComplete="off"
                      onChange={e => setForm({ ...form, telefono: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="gc-modal-row">
                  <div className="gc-field">
                    <label>Dirección</label>
                    <input
                      placeholder="Av. Lima 123, San Isidro"
                      value={form.direccion}
                      autoComplete="off"
                      onChange={e => setForm({ ...form, direccion: e.target.value })}
                    />
                  </div>
                  <div className="gc-field">
                    <label>Nivel inicial</label>
                    <select
                      value={form.nivel}
                      onChange={e => setForm({ ...form, nivel: e.target.value })}
                    >
                      {NIVELES.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                </div>

              </div>
              <div className="gc-modal-footer">
                <button type="button" className="gc-btn-cancel" onClick={() => { setModalNueva(false); setForm(initForm); setShowPw(false); }}>
                  Cancelar
                </button>
                <button type="submit" className="gc-btn-submit" disabled={submitting}>
                  {submitting ? '⏳ Registrando...' : '✅ Registrar Consultora'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL EDITAR ───────────────────────────────── */}
      {modalEditar && (
        <div className="gc-modal-overlay" onClick={() => setModalEditar(null)}>
          <div className="gc-modal" onClick={e => e.stopPropagation()}>
            <div className="gc-modal-header">
              <div>
                <h3>Editar Consultora</h3>
                <p>{modalEditar.usuarioNombre}</p>
              </div>
              <button className="gc-modal-close" onClick={() => setModalEditar(null)}>✕</button>
            </div>
            <form onSubmit={handleEditar}>
              <div className="gc-modal-body">
                <div className="gc-modal-row">
                  <div className="gc-field">
                    <label>DNI</label>
                    <input
                      placeholder="12345678"
                      maxLength={8}
                      value={editForm.dni}
                      onChange={e => setEditForm({ ...editForm, dni: e.target.value.replace(/\D/g, '') })}
                    />
                  </div>
                  <div className="gc-field">
                    <label>Teléfono</label>
                    <input
                      placeholder="987654321"
                      value={editForm.telefono}
                      onChange={e => setEditForm({ ...editForm, telefono: e.target.value })}
                    />
                  </div>
                </div>
                <div className="gc-field">
                  <label>Dirección</label>
                  <input
                    placeholder="Av. Lima 123"
                    value={editForm.direccion}
                    onChange={e => setEditForm({ ...editForm, direccion: e.target.value })}
                  />
                </div>
                <div className="gc-field">
                  <label>Nivel</label>
                  <select
                    value={editForm.nivel}
                    onChange={e => setEditForm({ ...editForm, nivel: e.target.value })}
                  >
                    {NIVELES.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
              <div className="gc-modal-footer">
                <button type="button" className="gc-btn-cancel" onClick={() => setModalEditar(null)}>
                  Cancelar
                </button>
                <button type="submit" className="gc-btn-submit" disabled={submitting}>
                  {submitting ? '⏳ Guardando...' : '💾 Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL DETALLE ──────────────────────────────── */}
      {modalDetalle && (
        <div className="gc-modal-overlay" onClick={() => setModalDetalle(null)}>
          <div className="gc-modal" onClick={e => e.stopPropagation()}>
            <div className="gc-modal-header">
              <div>
                <h3>Detalle de Consultora</h3>
                <p>Información completa del perfil</p>
              </div>
              <button className="gc-modal-close" onClick={() => setModalDetalle(null)}>✕</button>
            </div>
            <div className="gc-modal-body">
              <div className="gc-detalle-avatar">{iniciales(modalDetalle.usuarioNombre)}</div>
              <div className="gc-detalle-nombre">{modalDetalle.usuarioNombre}</div>
              <div className="gc-detalle-email">{modalDetalle.usuarioEmail}</div>
              <div className="gc-detalle-grid">
                <div className="gc-detalle-item"><small>DNI</small><span>{modalDetalle.dni || '—'}</span></div>
                <div className="gc-detalle-item"><small>Teléfono</small><span>{modalDetalle.telefono || '—'}</span></div>
                <div className="gc-detalle-item"><small>Nivel</small><span>{nivelIcon(modalDetalle.nivel)} {modalDetalle.nivel || 'Bronce'}</span></div>
                <div className="gc-detalle-item"><small>Ventas totales</small><span>S/ {Number(modalDetalle.ventasTotales || 0).toFixed(2)}</span></div>
                <div className="gc-detalle-item" style={{ gridColumn: '1 / -1' }}><small>Dirección</small><span>{modalDetalle.direccion || '—'}</span></div>
              </div>
            </div>
            <div className="gc-modal-footer">
              <button className="gc-btn-cancel" onClick={() => setModalDetalle(null)}>Cerrar</button>
              <button className="gc-btn-submit" onClick={() => { setModalDetalle(null); abrirEditar(modalDetalle); }}>✏️ Editar</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL CONFIRMACIÓN TOGGLE ──────────────────── */}
      {modalConfirm && (
        <div className="gc-modal-overlay" onClick={() => setModalConfirm(null)}>
          <div className="gc-modal" style={{ maxWidth: '420px' }} onClick={e => e.stopPropagation()}>
            <div className="gc-modal-header">
              <div>
                <h3>{modalConfirm.accion === 'desactivar' ? '⚠️ Desactivar' : '✅ Activar'} consultora</h3>
                <p>{modalConfirm.consultora.usuarioNombre}</p>
              </div>
              <button className="gc-modal-close" onClick={() => setModalConfirm(null)}>✕</button>
            </div>
            <div className="gc-modal-body">
              <p style={{ fontSize: '14px', color: 'var(--dark-text)', lineHeight: '1.6', margin: 0 }}>
                {modalConfirm.accion === 'desactivar'
                  ? <>¿Estás segura de que deseas <strong>desactivar</strong> a <strong>{modalConfirm.consultora.usuarioNombre}</strong>? No podrá iniciar sesión hasta que sea activada nuevamente.</>
                  : <>¿Deseas <strong>activar</strong> nuevamente a <strong>{modalConfirm.consultora.usuarioNombre}</strong>? Recuperará acceso completo al sistema.</>
                }
              </p>
            </div>
            <div className="gc-modal-footer">
              <button className="gc-btn-cancel" onClick={() => setModalConfirm(null)}>Cancelar</button>
              <button
                className="gc-btn-submit"
                style={modalConfirm.accion === 'desactivar'
                  ? { background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '0 4px 14px rgba(239,68,68,0.35)' }
                  : {}
                }
                onClick={handleToggle}
              >
                {modalConfirm.accion === 'desactivar' ? '🔴 Sí, desactivar' : '🟢 Sí, activar'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}