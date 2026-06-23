import { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { getToken } from '../../../services/authService';
import { environment } from '../../../environments/environment';
import { useToast } from '../../../services/toastService';
import { inscribirse, getMisCapacitaciones, cancelarMiInscripcion, getPreguntasByCapacitacion } from '../../../services/capacitacionService';
import './Capacitaciones.css';

const TIPOS = ['Video', 'Documento', 'Taller', ' Webinar'];

const PREGUNTAS_EJEMPLO = [
  '¿Cuál es el principal objetivo de esta capacitación?',
  '¿Qué estrategia aplicarías en tu zona de ventas?',
  '¿Cómo mejorarías tu atención al cliente?',
];

function fmtFecha(f) {
  if (!f) return '—';
  return new Date(f).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtDuracion(min) {
  if (!min) return '—';
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function Capacitaciones() {
  const { show } = useToast();
  const token = getToken();
  const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  });

  const [todasCapacitaciones, setTodasCapacitaciones] = useState([]);
  const [misInscripciones, setMisInscripciones] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalDetalle, setModalDetalle] = useState(null);
  const [modalEvaluacion, setModalEvaluacion] = useState(null);
  const [modalInscripcion, setModalInscripcion] = useState(null);

  const [respuestas, setRespuestas] = useState({});
  const [preguntasEvaluacion, setPreguntasEvaluacion] = useState([]);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.key !== 'Escape') return;
      if (modalDetalle) setModalDetalle(null);
      if (modalEvaluacion) setModalEvaluacion(null);
      if (modalInscripcion) setModalInscripcion(null);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [modalDetalle, modalEvaluacion, modalInscripcion]);

  const cerrarModalDetalle = useCallback(() => setModalDetalle(null), []);
  const cerrarModalEvaluacion = useCallback(() => {
    setModalEvaluacion(null);
    setPreguntasEvaluacion([]);
  }, []);
  const cerrarModalInscripcion = useCallback(() => setModalInscripcion(null), []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [mis, caps] = await Promise.all([
        getMisCapacitaciones(),
        fetch(`${environment.url}/capacitaciones`, { headers: authHeaders() }).then(r => r.json())
      ]);
      setMisInscripciones(Array.isArray(mis) ? mis : []);
      setTodasCapacitaciones(Array.isArray(caps) ? caps : []);
    } catch {
      show('Error al cargar capacitaciones', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const inscritaIds = useMemo(() =>
    new Set(misInscripciones.map(m => m.capacitacionId)),
  [misInscripciones]);

  const disponibles = useMemo(() =>
    todasCapacitaciones.filter(c => c.activo && !inscritaIds.has(c.id)),
  [todasCapacitaciones, inscritaIds]);

  const stats = useMemo(() => ({
    total: misInscripciones.length,
    completadas: misInscripciones.filter(m => m.completado).length,
    pendientes: misInscripciones.filter(m => !m.completado).length,
  }), [misInscripciones]);

  const inscribir = async (capacitacionId) => {
    if (!capacitacionId) {
      show('No se encontró el ID de la capacitación', 'danger');
      return;
    }
    try {
      await inscribirse(capacitacionId);
      show('Inscripción exitosa', 'success');
      setModalInscripcion(null);
      cargarDatos();
    } catch (err) {
      show(err.message || 'Error al inscribirse', 'danger');
    }
  };

  const iniciarEvaluacion = async (inscripcion) => {
    setRespuestas({});
    setModalEvaluacion(inscripcion);
    try {
      const preg = await getPreguntasByCapacitacion(inscripcion.capacitacionId);
      setPreguntasEvaluacion(Array.isArray(preg) ? preg : []);
    } catch {
      setPreguntasEvaluacion([]);
    }
  };

  const cancelarInscripcion = async (capacitacionId) => {
    if (!window.confirm('¿Estás segura de que deseas cancelar tu inscripción?')) return;
    try {
      await cancelarMiInscripcion(capitacionId);
      show('Inscripción cancelada', 'success');
      cargarDatos();
    } catch (err) {
      show(err.message || 'Error al cancelar inscripción', 'danger');
    }
  };

  const handleRespuesta = (preguntaIdx, valor) => {
    setRespuestas(prev => ({ ...prev, [preguntaIdx]: valor }));
  };

  const calcularPuntaje = () => {
    const entries = Object.values(respuestas);
    if (entries.length === 0) return 0;
    const total = entries.reduce((acc, v) => acc + Number(v), 0);
    return Math.round(total / entries.length);
  };

  const enviarEvaluacion = async () => {
    const puntaje = calcularPuntaje();
    setEnviando(true);
    try {
      const headers = authHeaders();
      const params = new URLSearchParams({ puntaje });
      const res = await fetch(`${environment.url}/capacitaciones/${modalEvaluacion.id}/completar?${params}`, {
        method: 'PUT',
        headers
      });
      if (!res.ok) throw new Error('Error al enviar evaluación');
      show(`Evaluación enviada. Puntaje: ${puntaje}/100`, 'success');
      setModalEvaluacion(null);
      cargarDatos();
    } catch (err) {
      show(err.message || 'Error al enviar', 'danger');
    } finally {
      setEnviando(false);
    }
  };

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'Video': return '🎬';
      case 'Documento': return '📄';
      case 'Taller': return '🛠️';
      case 'Webinar': return '📹';
      default: return '📚';
    }
  };

  return (
    <div className="cap-page">
      <div className="cap-header">
        <div className="cap-header-text">
          <h2>Mis <em>Capacitaciones</em></h2>
          <p>Accede al contenido de tus capacitaciones y evalúate</p>
        </div>
        {disponibles.length > 0 && (
          <button className="cap-btn-inscribirse" onClick={() => setModalInscripcion({})}>
            ➕ Inscribirse en nueva
          </button>
        )}
      </div>

      <div className="cap-stats">
        <div className="cap-stat-card">
          <div className="cap-stat-icon">📚</div>
          <div className="cap-stat-info">
            <strong>{stats.total}</strong>
            <span>Total inscritas</span>
          </div>
        </div>
        <div className="cap-stat-card">
          <div className="cap-stat-icon">✅</div>
          <div className="cap-stat-info">
            <strong>{stats.completadas}</strong>
            <span>Completadas</span>
          </div>
        </div>
        <div className="cap-stat-card">
          <div className="cap-stat-icon">⏳</div>
          <div className="cap-stat-info">
            <strong>{stats.pendientes}</strong>
            <span>Pendientes</span>
          </div>
        </div>
        <div className="cap-stat-card">
          <div className="cap-stat-icon">🏆</div>
          <div className="cap-stat-info">
            <strong>{stats.completadas > 0 ? Math.round((stats.completadas / stats.total) * 100) : 0}%</strong>
            <span>Progreso</span>
          </div>
        </div>
      </div>

      {misInscripciones.length === 0 ? (
        <div className="cap-empty">
          <div className="cap-empty-icon">🎓</div>
          <h3>Sin capacitaciones inscritas</h3>
          <p>Inscríbete en una capacitación para comenzar tu aprendizaje</p>
          {disponibles.length > 0 && (
            <button className="cap-btn-primary" onClick={() => setModalInscripcion({})}>
              Ver capacitaciones disponibles
            </button>
          )}
        </div>
      ) : (
        <div className="cap-grid">
          {misInscripciones.map(insc => {
            const cap = todasCapacitaciones.find(c => c.id === insc.capacitacionId) || {};
            const pct = insc.completado ? 100 : (insc.puntaje ? Number(insc.puntaje) : 0);
            return (
              <div key={insc.id} className={`cap-card ${insc.completado ? 'completada' : 'pendiente'}`}>
                <div className="cap-card-header">
                  <span className="cap-tipo-badge">
                    {getTipoIcon(cap.tipo)} {cap.tipo || 'Curso'}
                  </span>
                  {insc.completado ? (
                    <span className="cap-badge-done">✓ Completada</span>
                  ) : (
                    <span className="cap-badge-pending">⏳ Pendiente</span>
                  )}
                </div>
                <h3 className="cap-card-title">{insc.capacitacionTitulo || cap.titulo}</h3>
                <div className="cap-card-meta">
                  <span>📅 {fmtFecha(cap.fecha)}</span>
                  <span>⏱️ {fmtDuracion(cap.duracionMinutos)}</span>
                </div>
                {cap.descripcion && (
                  <p className="cap-card-desc">{cap.descripcion}</p>
                )}
                <div className="cap-card-progress">
                  <div className="cap-progress-header">
                    <span>{insc.completado ? 'Completado' : 'Progreso'}</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="cap-progress-bar">
                    <div
                      className={`cap-progress-fill ${insc.completado ? 'done' : ''}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  {insc.puntaje && (
                    <span className="cap-nota">Nota: {Number(insc.puntaje).toFixed(0)}/100</span>
                  )}
                </div>
                <div className="cap-card-actions">
                  <button
                    className="cap-btn-ver"
                    onClick={() => {
                      const capData = cap.titulo ? cap : { titulo: insc.capacitacionTitulo, descripcion: insc.capacitacionDescripcion || '', tipo: insc.capacitacionTipo || '', fecha: insc.capacitacionFecha, duracionMinutos: insc.capacitacionDuracionMinutos, urlContenido: insc.capacitacionUrlContenido };
                      setModalDetalle({ ...capData, inscripcionId: insc.id, inscripcion: insc });
                    }}
                  >
                    👁️ Ver contenido
                  </button>
                  {!insc.completado && (
                    <button
                      className="cap-btn-evaluar"
                      onClick={() => iniciarEvaluacion(insc)}
                    >
                      📝 Evaluarse
                    </button>
                  )}
                  {!insc.completado && (
                    <button
                      className="cap-btn-cancelar"
                      onClick={() => cancelarInscripcion(insc.capacitacionId)}
                      title="Cancelar inscripción"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {disponibles.length > 0 && (
        <div className="cap-disponibles-section">
          <h3>Capacitaciones disponibles</h3>
          <div className="cap-disponibles-list">
            {disponibles.map(cap => (
              <div key={cap.id} className="cap-disponible-item">
                <div className="cap-disponible-info">
                  <span className="cap-disponible-icon">{getTipoIcon(cap.tipo)}</span>
                  <div>
                    <strong>{cap.titulo}</strong>
                    <p>{cap.descripcion?.slice(0, 80)}{cap.descripcion?.length > 80 ? '...' : ''}</p>
                    <small>📅 {fmtFecha(cap.fecha)} · ⏱️ {fmtDuracion(cap.duracionMinutos)}</small>
                  </div>
                </div>
                <button
                  className="cap-btn-small"
                  onClick={() => {
                    console.log('Cap clicked for inscription:', cap, 'id:', cap.id);
                    setModalInscripcion(cap);
                  }}
                >
                  Inscribirse
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {modalDetalle && createPortal((
        <div className="cap-modal-overlay" onClick={cerrarModalDetalle}>
          <div className="cap-modal cap-modal-lg" onClick={e => e.stopPropagation()}>
            <div className="cap-modal-header">
              <div>
                <h3>{modalDetalle.titulo}</h3>
                <p>{getTipoIcon(modalDetalle.tipo)} {modalDetalle.tipo} · 📅 {fmtFecha(modalDetalle.fecha)} · ⏱️ {fmtDuracion(modalDetalle.duracionMinutos)}</p>
              </div>
              <button className="cap-modal-close" onClick={cerrarModalDetalle}>✕</button>
            </div>
            <div className="cap-modal-body">
              {modalDetalle.descripcion && (
                <div className="cap-detalle-section">
                  <h4>Descripción</h4>
                  <p>{modalDetalle.descripcion}</p>
                </div>
              )}
              {modalDetalle.urlContenido ? (
                <div className="cap-detalle-section">
                  <h4>Contenido</h4>
                  <a href={modalDetalle.urlContenido} target="_blank" rel="noopener noreferrer" className="cap-link-content">
                    🔗 Abrir material de estudio
                  </a>
                </div>
              ) : (
                <div className="cap-detalle-section">
                  <p className="cap-no-content">📭 No hay material de estudio disponible aún.</p>
                </div>
              )}
              {modalDetalle.inscripcion && !modalDetalle.inscripcion.completado && (
                <div className="cap-detalle-section">
                  <h4>¿Listo para evaluarte?</h4>
                  <p>Completa la evaluación para marcar esta capacitación como terminada y guardar tu puntaje.</p>
                  <button
                    className="cap-btn-evaluar"
                    onClick={() => {
                      cerrarModalDetalle();
                      iniciarEvaluacion(modalDetalle.inscripcion);
                    }}
                  >
                    📝 Realizar evaluación
                  </button>
                </div>
              )}
            </div>
            <div className="cap-modal-footer">
              <button className="cap-btn-cancel" onClick={cerrarModalDetalle}>Cerrar</button>
            </div>
          </div>
        </div>
      ), document.body)}

      {modalInscripcion && createPortal((
        <div className="cap-modal-overlay" onClick={cerrarModalInscripcion}>
          <div className="cap-modal cap-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="cap-modal-header">
              <div>
                <h3>Inscribirse</h3>
                <p>Selecciona una capacitación para inscribirte</p>
              </div>
              <button className="cap-modal-close" onClick={cerrarModalInscripcion}>✕</button>
            </div>
            <div className="cap-modal-body">
              {(modalInscripcion.id ? [modalInscripcion] : disponibles).map(cap => (
                <div key={cap.id} className="cap-inscripcion-item">
                  <div className="cap-inscripcion-info">
                    <strong>{getTipoIcon(cap.tipo)} {cap.titulo}</strong>
                    <p>{cap.descripcion?.slice(0, 60)}{cap.descripcion?.length > 60 ? '...' : ''}</p>
                    <small>⏱️ {fmtDuracion(cap.duracionMinutos)}</small>
                  </div>
                  <button
                    className="cap-btn-small"
                    onClick={() => inscribir(cap.id)}
                  >
                    Inscribirse
                  </button>
                </div>
              ))}
            </div>
            <div className="cap-modal-footer">
              <button className="cap-btn-cancel" onClick={cerrarModalInscripcion}>Cerrar</button>
            </div>
          </div>
        </div>
      ), document.body)}

      {modalEvaluacion && createPortal((
        <div className="cap-modal-overlay" onClick={cerrarModalEvaluacion}>
          <div className="cap-modal cap-modal-lg" onClick={e => e.stopPropagation()}>
            <div className="cap-modal-header">
              <div>
                <h3>📝 Evaluación</h3>
                <p>{modalEvaluacion.capacitacionTitulo}</p>
              </div>
              <button className="cap-modal-close" onClick={cerrarModalEvaluacion}>✕</button>
            </div>
            <div className="cap-modal-body">
              <div className="cap-eval-intro">
                <p>Responde las siguientes preguntas para evaluar tu aprendizaje. Tu puntaje se guardará automáticamente.</p>
              </div>
              {(preguntasEvaluacion.length > 0 ? preguntasEvaluacion : PREGUNTAS_EJEMPLO.map((p, i) => ({ id: i, pregunta: p }))).map((pregunta, idx) => (
                <div key={pregunta.id || idx} className="cap-pregunta-item">
                  <label className="cap-pregunta-label">
                    <span className="cap-pregunta-num">{idx + 1}</span>
                    {pregunta.pregunta}
                  </label>
                  <div className="cap-opciones">
                    {[100, 75, 50, 25, 0].map(val => (
                      <label key={val} className="cap-opcion">
                        <input
                          type="radio"
                          name={`preg-${idx}`}
                          value={val}
                          checked={respuestas[idx] === val}
                          onChange={() => handleRespuesta(idx, val)}
                        />
                        <span className="cap-opcion-radio" />
                        <span className="cap-opcion-label">{val}%</span>
                        <span className="cap-opcion-text">
                          {val === 100 ? 'Excelente' : val === 75 ? 'Muy bien' : val === 50 ? 'Regular' : val === 25 ? 'Necesito mejorar' : 'No lo sé'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <div className="cap-eval-resumen">
                <span>Puntaje estimado:</span>
                <strong className="cap-puntaje-preview">{calcularPuntaje()}/100</strong>
              </div>
            </div>
            <div className="cap-modal-footer">
              <button className="cap-btn-cancel" onClick={cerrarModalEvaluacion}>Cancelar</button>
              <button
                className="cap-btn-submit"
                onClick={enviarEvaluacion}
                disabled={enviando || Object.keys(respuestas).length === 0}
              >
                {enviando ? '⏳ Enviando...' : '✅ Enviar evaluación'}
              </button>
            </div>
          </div>
        </div>
      ), document.body)}
    </div>
  );
}