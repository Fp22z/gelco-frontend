import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  getCapacitaciones,
  getConsultorasByCapacitacion,
  crearCapacitacion,
  actualizarCapacitacion,
  eliminarCapacitacion,
  inscribirConsultora,
  completarCapacitacion,
  eliminarInscripcion
} from '../../../services/capacitacionService';
import { getConsultoras } from '../../../services/consultoraService';
import { useToast } from '../../../services/toastService';
import './CapacitacionesRRHH.css';

const NIVELES = ['Bronce', 'Plata', 'Oro'];
const TIPOS_CAPACITACION = ['Ventas', 'Producto', 'Liderazgo', 'Técnico', 'Onboarding'];

function fmtFecha(f) {
  if (!f) return '—';
  return new Date(f).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default function CapacitacionesRRHH() {
  const { show } = useToast();

  const [capacitaciones, setCapacitaciones] = useState([]);
  const [consultoras, setConsultoras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');

  const [modalNueva, setModalNueva] = useState(false);
  const [modalDetalle, setModalDetalle] = useState(null);
  const [modalEditar, setModalEditar] = useState(null);
  const [modalInscribir, setModalInscribir] = useState(null);
  const [modalConfirm, setModalConfirm] = useState(null);

  const [form, setForm] = useState({ titulo: '', descripcion: '', fecha: '', duracionMinutos: '', tipo: '', urlContenido: '', preguntas: [] });
  const [editForm, setEditForm] = useState({ titulo: '', descripcion: '', fecha: '', duracionMinutos: '', tipo: '', urlContenido: '', preguntas: [] });
  const [inscripcionForm, setInscripcionForm] = useState({ capacitacionId: '', consultoraId: '' });
  const [submitting, setSubmitting] = useState(false);

  const [inscritas, setInscritas] = useState([]);
  const [loadingInscritas, setLoadingInscritas] = useState(false);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [caps, consultorasData] = await Promise.all([
        getCapacitaciones(),
        getConsultoras()
      ]);
      setCapacitaciones(Array.isArray(caps) ? caps : []);
      setConsultoras(Array.isArray(consultorasData) ? consultorasData : []);
    } catch (err) {
      show('Error al cargar datos', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  useEffect(() => {
    if (modalDetalle) {
      setLoadingInscritas(true);
      getConsultorasByCapacitacion(modalDetalle.id)
        .then(setInscritas)
        .catch(() => setInscritas([]))
        .finally(() => setLoadingInscritas(false));
    }
  }, [modalDetalle]);

  const capacitacionesFiltradas = useMemo(() => {
    return capacitaciones.filter(c => {
      const texto = busqueda.toLowerCase();
      const coincideTexto = !texto ||
        c.titulo?.toLowerCase().includes(texto) ||
        c.descripcion?.toLowerCase().includes(texto);
      const coincideTipo = !filtroTipo || c.tipo === filtroTipo;
      return coincideTexto && coincideTipo;
    });
  }, [capacitaciones, busqueda, filtroTipo]);

  const stats = useMemo(() => ({
    total: capacitaciones.length,
    activas: capacitaciones.filter(c => c.activo !== false).length,
    tipos: [...new Set(capacitaciones.map(c => c.tipo).filter(Boolean))].length
  }), [capacitaciones]);

  const handleCrear = async (e) => {
    e.preventDefault();
    if (!form.titulo.trim()) {
      show('El título es obligatorio', 'warning');
      return;
    }
    try {
      setSubmitting(true);
      const datos = {
        ...form,
        fecha: form.fecha ? new Date(form.fecha).toISOString() : null,
        duracionMinutos: form.duracionMinutos ? parseInt(form.duracionMinutos) : null,
        activo: true,
        preguntas: form.preguntas.filter(p => p.pregunta.trim() !== '')
      };
      await crearCapacitacion(datos);
      show('Capacitación creada exitosamente', 'success');
      setModalNueva(false);
      setForm({ titulo: '', descripcion: '', fecha: '', duracionMinutos: '', tipo: '', urlContenido: '', preguntas: [] });
      cargarDatos();
    } catch (err) {
      show(err.message || 'Error al crear', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditar = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const datos = {
        ...editForm,
        fecha: editForm.fecha ? new Date(editForm.fecha).toISOString() : null,
        duracionMinutos: editForm.duracionMinutos ? parseInt(editForm.duracionMinutos) : null
      };
      await actualizarCapacitacion(modalEditar.id, datos);
      show('Capacitación actualizada', 'success');
      setModalEditar(null);
      cargarDatos();
    } catch (err) {
      show(err.message || 'Error al actualizar', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEliminar = async () => {
    if (!modalConfirm) return;
    try {
      setSubmitting(true);
      await eliminarCapacitacion(modalConfirm.id);
      show('Capacitación eliminada', 'success');
      setModalConfirm(null);
      setModalDetalle(null);
      cargarDatos();
    } catch (err) {
      show(err.message || 'Error al eliminar', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInscribir = async (e) => {
    e.preventDefault();
    if (!inscripcionForm.consultoraId) {
      show('Selecciona una consultora', 'warning');
      return;
    }
    try {
      setSubmitting(true);
      await inscribirConsultora(inscripcionForm.capacitacionId, inscripcionForm.consultoraId);
      show('Consultora inscrita exitosamente', 'success');
      setModalInscribir(null);
      if (modalDetalle) {
        const actualizadas = await getConsultorasByCapacitacion(modalDetalle.id);
        setInscritas(actualizadas);
      }
    } catch (err) {
      show(err.message || 'Error al inscribir', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompletar = async (inscripcionId, puntaje) => {
    try {
      await completarCapacitacion(inscripcionId, puntaje);
      show('Capacitación marcada como completada', 'success');
      if (modalDetalle) {
        const actualizadas = await getConsultorasByCapacitacion(modalDetalle.id);
        setInscritas(actualizadas);
      }
    } catch (err) {
      show(err.message || 'Error al completar', 'danger');
    }
  };

  const handleEliminarInscripcion = async (inscripcionId) => {
    try {
      await eliminarInscripcion(inscripcionId);
      show('Inscripción eliminada', 'success');
      if (modalDetalle) {
        const actualizadas = await getConsultorasByCapacitacion(modalDetalle.id);
        setInscritas(actualizadas);
      }
    } catch (err) {
      show(err.message || 'Error al eliminar', 'danger');
    }
  };

  const abrirEditar = (cap) => {
    setModalEditar(cap);
    setEditForm({
      titulo: cap.titulo || '',
      descripcion: cap.descripcion || '',
      fecha: cap.fecha ? new Date(cap.fecha).toISOString().slice(0, 16) : '',
      duracionMinutos: cap.duracionMinutos || '',
      tipo: cap.tipo || '',
      urlContenido: cap.urlContenido || ''
    });
  };

  const abrirInscribir = (cap) => {
    setModalInscribir(cap);
    setInscripcionForm({ capacitacionId: cap.id, consultoraId: '' });
  };

  return (
    <div className="cap-rrhh-page">
      <div className="cap-rrhh-header">
        <div className="cap-rrhh-header-text">
          <h2>Gestión de <em>Capacitaciones</em></h2>
          <p>Crea, administra y rastrea las capacitaciones de tu equipo</p>
        </div>
        <button className="cap-btn-nueva" onClick={() => setModalNueva(true)}>
          ➕ Nueva Capacitación
        </button>
      </div>

      <div className="cap-rrhh-stats">
        <div className="cap-stat-card">
          <div className="cap-stat-icon">📚</div>
          <div className="cap-stat-info"><p>Total</p><strong>{stats.total}</strong></div>
        </div>
        <div className="cap-stat-card">
          <div className="cap-stat-icon">✅</div>
          <div className="cap-stat-info"><p>Activas</p><strong>{stats.activas}</strong></div>
        </div>
        <div className="cap-stat-card">
          <div className="cap-stat-icon">🏷️</div>
          <div className="cap-stat-info"><p>Tipos</p><strong>{stats.tipos}</strong></div>
        </div>
      </div>

      <div className="cap-rrhh-toolbar">
        <div className="cap-search-box">
          <span>🔍</span>
          <input
            placeholder="Buscar por título o descripción..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>
        <select
          className="cap-filter-select"
          value={filtroTipo}
          onChange={e => setFiltroTipo(e.target.value)}
        >
          <option value="">Todos los tipos</option>
          {TIPOS_CAPACITACION.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {capacitacionesFiltradas.length === 0 ? (
        <div className="cap-empty">
          <span>📚</span>
          <p>No hay capacitaciones registradas</p>
          <button onClick={() => setModalNueva(true)}>Crear primera capacitación</button>
        </div>
      ) : (
        <div className="cap-grid">
          {capacitacionesFiltradas.map(cap => (
            <div key={cap.id} className="cap-card">
              <div className="cap-card-header">
                <div className="cap-card-title-row">
                  <h3>{cap.titulo}</h3>
                  <span className={`cap-badge ${cap.activo !== false ? 'active' : 'inactive'}`}>
                    {cap.activo !== false ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
                <div className="cap-card-meta">
                  {cap.tipo && <span className="cap-tipo">{cap.tipo}</span>}
                  {cap.fecha && <span className="cap-fecha">📅 {fmtFecha(cap.fecha)}</span>}
                  {cap.duracionMinutos && <span className="cap-duracion">⏱️ {cap.duracionMinutos} min</span>}
                </div>
              </div>
              {cap.descripcion && <p className="cap-desc">{cap.descripcion}</p>}
              {cap.urlContenido && (
                <a href={cap.urlContenido} target="_blank" rel="noreferrer" className="cap-url">
                  🔗 Ver material
                </a>
              )}
              <div className="cap-card-actions">
                <button className="cap-btn-ver" onClick={() => setModalDetalle(cap)}>👁️ Ver detalle</button>
                <button className="cap-btn-editar" onClick={() => abrirEditar(cap)}>✏️ Editar</button>
                <button className="cap-btn-inscribir" onClick={() => abrirInscribir(cap)}>➕ Inscribir</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalNueva && createPortal(
        <div className="cap-modal-overlay" onClick={() => setModalNueva(false)}>
          <div className="cap-modal" onClick={e => e.stopPropagation()}>
            <div className="cap-modal-header">
              <div>
                <h3>Nueva Capacitación</h3>
                <p>Crea una nueva sesión de capacitación</p>
              </div>
              <button className="cap-modal-close" onClick={() => setModalNueva(false)}>✕</button>
            </div>
            <form onSubmit={handleCrear}>
              <div className="cap-modal-body">
                <div className="cap-field">
                  <label>Título <span>*</span></label>
                  <input
                    placeholder="Ej: Técnicas de Venta Avanzadas"
                    value={form.titulo}
                    onChange={e => setForm({ ...form, titulo: e.target.value })}
                    required
                  />
                </div>
                <div className="cap-field">
                  <label>Descripción</label>
                  <textarea
                    placeholder="Describe el contenido de la capacitación..."
                    value={form.descripcion}
                    onChange={e => setForm({ ...form, descripcion: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="cap-modal-row">
                  <div className="cap-field">
                    <label>Fecha y hora</label>
                    <input
                      type="datetime-local"
                      value={form.fecha}
                      onChange={e => setForm({ ...form, fecha: e.target.value })}
                    />
                  </div>
                  <div className="cap-field">
                    <label>Duración (minutos)</label>
                    <input
                      type="number"
                      placeholder="60"
                      min="1"
                      value={form.duracionMinutos}
                      onChange={e => setForm({ ...form, duracionMinutos: e.target.value })}
                    />
                  </div>
                </div>
                <div className="cap-modal-row">
                  <div className="cap-field">
                    <label>Tipo</label>
                    <select
                      value={form.tipo}
                      onChange={e => setForm({ ...form, tipo: e.target.value })}
                    >
                      <option value="">Seleccionar tipo</option>
                      {TIPOS_CAPACITACION.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div className="cap-field">
                  <label>URL de contenido</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={form.urlContenido}
                    onChange={e => setForm({ ...form, urlContenido: e.target.value })}
                  />
                </div>
                <div className="cap-field">
                  <label>Preguntas de evaluación</label>
                  <p className="cap-field-hint">Agrega las preguntas que las consultoras deberán responder para completar la capacitación</p>
                  {form.preguntas.map((preg, idx) => (
                    <div key={idx} className="cap-pregunta-row">
                      <span className="cap-pregunta-num">{idx + 1}.</span>
                      <input
                        type="text"
                        placeholder={`Pregunta ${idx + 1}`}
                        value={preg.pregunta}
                        onChange={e => {
                          const newPregs = [...form.preguntas];
                          newPregs[idx].pregunta = e.target.value;
                          setForm({ ...form, preguntas: newPregs });
                        }}
                        style={{ flex: 1 }}
                      />
                      <button
                        type="button"
                        className="cap-btn-remove"
                        onClick={() => {
                          const newPregs = form.preguntas.filter((_, i) => i !== idx);
                          setForm({ ...form, preguntas: newPregs });
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="cap-btn-add-pregunta"
                    onClick={() => setForm({ ...form, preguntas: [...form.preguntas, { pregunta: '', orden: form.preguntas.length + 1 }] })}
                  >
                    ➕ Agregar pregunta
                  </button>
                </div>
              </div>
              <div className="cap-modal-footer">
                <button type="button" className="cap-btn-cancel" onClick={() => setModalNueva(false)}>Cancelar</button>
                <button type="submit" className="cap-btn-submit" disabled={submitting}>
                  {submitting ? '⏳ Creando...' : '✅ Crear Capacitación'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {modalEditar && createPortal(
        <div className="cap-modal-overlay" onClick={() => setModalEditar(null)}>
          <div className="cap-modal" onClick={e => e.stopPropagation()}>
            <div className="cap-modal-header">
              <div>
                <h3>Editar Capacitación</h3>
                <p>{modalEditar.titulo}</p>
              </div>
              <button className="cap-modal-close" onClick={() => setModalEditar(null)}>✕</button>
            </div>
            <form onSubmit={handleEditar}>
              <div className="cap-modal-body">
                <div className="cap-field">
                  <label>Título <span>*</span></label>
                  <input
                    value={editForm.titulo}
                    onChange={e => setEditForm({ ...editForm, titulo: e.target.value })}
                    required
                  />
                </div>
                <div className="cap-field">
                  <label>Descripción</label>
                  <textarea
                    value={editForm.descripcion}
                    onChange={e => setEditForm({ ...editForm, descripcion: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="cap-modal-row">
                  <div className="cap-field">
                    <label>Fecha y hora</label>
                    <input
                      type="datetime-local"
                      value={editForm.fecha}
                      onChange={e => setEditForm({ ...editForm, fecha: e.target.value })}
                    />
                  </div>
                  <div className="cap-field">
                    <label>Duración (minutos)</label>
                    <input
                      type="number"
                      min="1"
                      value={editForm.duracionMinutos}
                      onChange={e => setEditForm({ ...editForm, duracionMinutos: e.target.value })}
                    />
                  </div>
                </div>
                <div className="cap-modal-row">
                  <div className="cap-field">
                    <label>Tipo</label>
                    <select
                      value={editForm.tipo}
                      onChange={e => setEditForm({ ...editForm, tipo: e.target.value })}
                    >
                      <option value="">Seleccionar tipo</option>
                      {TIPOS_CAPACITACION.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div className="cap-field">
                  <label>URL de contenido</label>
                  <input
                    type="url"
                    value={editForm.urlContenido}
                    onChange={e => setEditForm({ ...editForm, urlContenido: e.target.value })}
                  />
                </div>
              </div>
              <div className="cap-modal-footer">
                <button type="button" className="cap-btn-cancel" onClick={() => setModalEditar(null)}>Cancelar</button>
                <button type="submit" className="cap-btn-submit" disabled={submitting}>
                  {submitting ? '⏳ Guardando...' : '💾 Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {modalDetalle && createPortal(
        <div className="cap-modal-overlay" onClick={() => setModalDetalle(null)}>
          <div className="cap-modal cap-modal-lg" onClick={e => e.stopPropagation()}>
            <div className="cap-modal-header">
              <div>
                <h3>{modalDetalle.titulo}</h3>
                <p>{modalDetalle.tipo || 'Sin tipo'} • {modalDetalle.duracionMinutos ? `${modalDetalle.duracionMinutos} min` : 'Sin duración'}</p>
              </div>
              <div className="cap-modal-header-actions">
                <button className="cap-btn-sm" onClick={() => { setModalDetalle(null); abrirEditar(modalDetalle); }}>✏️ Editar</button>
                <button className="cap-btn-sm cap-btn-danger" onClick={() => setModalConfirm(modalDetalle)}>🗑️ Eliminar</button>
                <button className="cap-modal-close" onClick={() => setModalDetalle(null)}>✕</button>
              </div>
            </div>
            <div className="cap-modal-body">
              {modalDetalle.descripcion && (
                <div className="cap-detalle-section">
                  <h4>Descripción</h4>
                  <p>{modalDetalle.descripcion}</p>
                </div>
              )}
              <div className="cap-detalle-section">
                <h4>Información</h4>
                <div className="cap-info-grid">
                  <div className="cap-info-item">
                    <span className="cap-info-label">Fecha</span>
                    <span className="cap-info-value">{modalDetalle.fecha ? fmtFecha(modalDetalle.fecha) : 'No definida'}</span>
                  </div>
                  <div className="cap-info-item">
                    <span className="cap-info-label">Estado</span>
                    <span className={`cap-badge ${modalDetalle.activo !== false ? 'active' : 'inactive'}`}>
                      {modalDetalle.activo !== false ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                  {modalDetalle.urlContenido && (
                    <div className="cap-info-item">
                      <span className="cap-info-label">Material</span>
                      <a href={modalDetalle.urlContenido} target="_blank" rel="noreferrer" className="cap-url">Abrir enlace →</a>
                    </div>
                  )}
                </div>
              </div>
              <div className="cap-detalle-section">
                <div className="cap-section-header">
                  <h4>Consultoras Inscritas ({inscritas.length})</h4>
                  <button className="cap-btn-sm" onClick={() => abrirInscribir(modalDetalle)}>➕ Inscribir</button>
                </div>
                {loadingInscritas ? (
                  <div className="cap-loading-inscritas"><div className="loading-spinner" /></div>
                ) : inscritas.length === 0 ? (
                  <div className="cap-empty-inscritas">
                    <span>👥</span>
                    <p>No hay consultoras inscritas</p>
                  </div>
                ) : (
                  <div className="cap-inscritas-list">
                    {inscritas.map(ins => (
                      <div key={ins.id} className="cap-inscrita-item">
                        <div className="cap-inscrita-info">
                          <span className="cap-inscrita-nombre">{ins.consultoraNombre}</span>
                          <span className={`cap-inscrita-status ${ins.completado ? 'completado' : 'pendiente'}`}>
                            {ins.completado ? `✅ Completado (${ins.puntaje}pts)` : '⏳ Pendiente'}
                          </span>
                        </div>
                        <div className="cap-inscrita-actions">
                          {!ins.completado && (
                            <button
                              className="cap-btn-sm cap-btn-complete"
                              onClick={() => handleCompletar(ins.id, 100)}
                              title="Marcar como completado"
                            >✓</button>
                          )}
                          <button
                            className="cap-btn-sm cap-btn-danger"
                            onClick={() => handleEliminarInscripcion(ins.id)}
                            title="Eliminar inscripción"
                          >✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="cap-modal-footer">
              <button className="cap-btn-cancel" onClick={() => setModalDetalle(null)}>Cerrar</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {modalInscribir && createPortal(
        <div className="cap-modal-overlay" onClick={() => setModalInscribir(null)}>
          <div className="cap-modal cap-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="cap-modal-header">
              <div>
                <h3>Inscribir Consultora</h3>
                <p>{modalInscribir.titulo}</p>
              </div>
              <button className="cap-modal-close" onClick={() => setModalInscribir(null)}>✕</button>
            </div>
            <form onSubmit={handleInscribir}>
              <div className="cap-modal-body">
                <div className="cap-field">
                  <label>Seleccionar Consultora <span>*</span></label>
                  <select
                    value={inscripcionForm.consultoraId}
                    onChange={e => setInscripcionForm({ ...inscripcionForm, consultoraId: e.target.value })}
                    required
                  >
                    <option value="">Elige una consultora</option>
                    {consultoras.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.usuarioNombre} ({c.nivel || 'Sin nivel'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="cap-modal-footer">
                <button type="button" className="cap-btn-cancel" onClick={() => setModalInscribir(null)}>Cancelar</button>
                <button type="submit" className="cap-btn-submit" disabled={submitting}>
                  {submitting ? '⏳ Inscribiendo...' : '✅ Inscribir'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {modalConfirm && createPortal(
        <div className="cap-modal-overlay" onClick={() => setModalConfirm(null)}>
          <div className="cap-modal cap-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="cap-modal-header">
              <div>
                <h3>⚠️ Eliminar Capacitación</h3>
              </div>
              <button className="cap-modal-close" onClick={() => setModalConfirm(null)}>✕</button>
            </div>
            <div className="cap-modal-body">
              <p>¿Estás seguro de eliminar <strong>{modalConfirm.titulo}</strong>? Esta acción no se puede deshacer.</p>
            </div>
            <div className="cap-modal-footer">
              <button className="cap-btn-cancel" onClick={() => setModalConfirm(null)}>Cancelar</button>
              <button className="cap-btn-danger" onClick={handleEliminar} disabled={submitting}>
                {submitting ? '⏳ Eliminando...' : '🗑️ Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}