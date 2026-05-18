import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInfoSession } from '../../services/sessionService';
import { updateToken } from '../../services/authService';
import { getConsultoraByUsuario, updateUsuario, updateConsultora } from '../../services/perfilService';
import './MiPerfil.css';

export default function MiPerfil() {
  const navigate = useNavigate();
  const userInfo = getInfoSession();

  const [consultora, setConsultora] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    nombre: userInfo?.nombre || '',
    dni: '',
    telefono: '',
    direccion: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (userInfo?.perfil === 'CONSULTORA' && userInfo?.userId) {
          const data = await getConsultoraByUsuario(userInfo.userId);
          setConsultora(data);
          setForm({
            nombre: userInfo.nombre || '',
            dni: data.dni || '',
            telefono: data.telefono || '',
            direccion: data.direccion || '',
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getInitials = () => {
    return (userInfo?.nombre || 'U')
      .split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  const getNivelColor = (nivel) => {
    switch (nivel) {
      case 'Oro': return '#F59E0B';
      case 'Plata': return '#9CA3AF';
      case 'Bronce': return '#D97706';
      default: return '#6B7280';
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // 1. Actualizar usuario y recibir nuevo token
      const response = await updateUsuario(userInfo.userId, form.nombre);
      
      // 2. Guardar el nuevo token (contiene nombre actualizado)
      if (response.token) {
        updateToken(response.token);
      }

      // 3. Actualizar datos de consultora si aplica
      if (userInfo.perfil === 'CONSULTORA' && consultora) {
        await updateConsultora(consultora.id, {
          dni: form.dni,
          telefono: form.telefono,
          direccion: form.direccion,
        });
      }

      // 4. Mostrar modal de éxito y recargar info de sesión sin reload
      setSaved(true);
      
      // 5. Actualizar el estado local con los nuevos datos
      const nuevaInfo = getInfoSession();
      setForm(prev => ({ ...prev, nombre: nuevaInfo.nombre }));

      setTimeout(() => setSaved(false), 2500);

    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="perfil-loading">Cargando...</div>;

  return (
    <div className="miperfil-page">

      {/* Modal de éxito */}
      {saved && (
        <div className="saved-overlay">
          <div className="saved-modal">
            <p>Se guardaron los cambios</p>
            <div className="saved-check">
              <svg viewBox="0 0 24 24" fill="none" stroke="#E8956D" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="8 12 11 15 16 9" />
              </svg>
            </div>
          </div>
        </div>
      )}

      <div className="perfil-layout">

        {/* CARD IZQUIERDA */}
        <div className="perfil-left-card">
          <div className="perfil-avatar-large">{getInitials()}</div>
          <h3 className="perfil-nombre">{userInfo?.nombre}</h3>

          {userInfo?.perfil === 'CONSULTORA' && consultora?.nivel && (
            <span className="perfil-nivel" style={{ color: getNivelColor(consultora.nivel) }}>
              ● {consultora.nivel}
            </span>
          )}

          <button className="btn-foto">⊕ Subir nueva foto</button>

          <div className="perfil-stats">
            {userInfo?.perfil === 'CONSULTORA' && consultora && (
              <>
                <div className="stat-item">
                  <span className="stat-label">ID de Consultora:</span>
                  <span className="stat-value">{consultora.id}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Ventas Totales:</span>
                  <span className="stat-value">S/. {Number(consultora.ventasTotales || 0).toLocaleString()}</span>
                </div>
              </>
            )}
            {userInfo?.perfil === 'ADMIN' && (
              <div className="stat-item">
                <span className="stat-label">Rol:</span>
                <span className="stat-value">Administrador</span>
              </div>
            )}
            {userInfo?.perfil === 'DISTRIBUIDOR' && (
              <div className="stat-item">
                <span className="stat-label">Rol:</span>
                <span className="stat-value">Distribuidor</span>
              </div>
            )}
          </div>
        </div>

        {/* FORMULARIO DERECHA */}
        <div className="perfil-right">

          {/* Datos Personales */}
          <div className="perfil-section-card">
            <h4>Datos Personales</h4>

            <div className="perfil-field">
              <label>Nombre Completo</label>
              <input name="nombre" value={form.nombre} onChange={handleChange} />
            </div>

            <div className="perfil-field">
              <label>Email</label>
              <input value={userInfo?.email || ''} disabled className="input-readonly" />
            </div>

            {userInfo?.perfil === 'CONSULTORA' && (
              <div className="perfil-field">
                <label>ID de Consultora</label>
                <input value={consultora?.id || ''} disabled className="input-readonly" />
              </div>
            )}
          </div>

          {/* Datos de Contacto — solo CONSULTORA */}
          {userInfo?.perfil === 'CONSULTORA' && (
            <div className="perfil-section-card">
              <h4>Datos de Contacto</h4>

              <div className="perfil-field">
                <label>DNI</label>
                <input name="dni" value={form.dni} onChange={handleChange} />
              </div>

              <div className="perfil-row">
                <div className="perfil-field">
                  <label>Teléfono</label>
                  <input name="telefono" value={form.telefono} onChange={handleChange} />
                </div>
              </div>

              <div className="perfil-field">
                <label>Dirección de Residencia</label>
                <input name="direccion" value={form.direccion} onChange={handleChange} />
              </div>

              <div className="perfil-save-row">
                <button className="btn-guardar" onClick={handleSave} disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          )}

          {/* Guardar para ADMIN/DISTRIBUIDOR */}
          {userInfo?.perfil !== 'CONSULTORA' && (
            <div className="perfil-save-row">
              <button className="btn-guardar" onClick={handleSave} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}