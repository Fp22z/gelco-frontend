import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { createCliente, updateCliente } from '../../../services/clienteService';
import { useToast } from '../../../services/toastService.jsx';
import './RegistrarCliente.css';

const PREFERENCIAS_OPCIONES = [
  'Maquillaje juvenil',
  'Fragancias frutales',
  'Cuidado facial',
  'Cuidado corporal',
  'Cabello y tratamientos',
  'Perfumería',
];

export default function RegistrarCliente({ cliente, onClose }) {
  const esEdicion = !!cliente;
  const { show: showToast } = useToast();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    nombre: '',
    telefono: '',
    direccion: '',
    preferencias: [],
  });

  useEffect(() => {
    if (cliente) {
      setForm({
        nombre: cliente.nombre || '',
        telefono: cliente.telefono || '',
        direccion: cliente.direccion || '',
        preferencias: cliente.preferencias
          ? cliente.preferencias.split(',').map(p => p.trim()).filter(Boolean)
          : [],
      });
    }
  }, [cliente]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const togglePref = (pref) => {
    setForm(prev => ({
      ...prev,
      preferencias: prev.preferencias.includes(pref)
        ? prev.preferencias.filter(p => p !== pref)
        : [...prev.preferencias, pref]
    }));
  };

  const handleSubmit = async () => {
    if (!form.nombre.trim()) {
      showToast('El nombre es obligatorio', 'warning');
      return;
    }
    setSaving(true);
    try {
      const datos = {
        ...form,
        preferencias: form.preferencias.join(',')
      };
      if (esEdicion) {
        await updateCliente(cliente.id, datos);
        showToast('Cliente actualizado correctamente', 'success');
      } else {
        await createCliente(datos);
        showToast('Cliente registrado correctamente', 'success');
      }
      onClose(true);
    } catch (e) {
      showToast('Error al guardar cliente', 'danger');
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div className="modal-overlay" onClick={() => onClose(false)}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>

        <div className="modal-header">
          <h3>{esEdicion ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}</h3>
          <button className="modal-close" onClick={() => onClose(false)}>✕</button>
        </div>

        <div className="modal-body">
          <div className="modal-field">
            <label>Nombre Completo *</label>
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Ej: Carmen Acuña"
            />
          </div>

          <div className="modal-field">
            <label>Teléfono</label>
            <input
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              placeholder="Ej: +51 999 888 777"
            />
          </div>

          <div className="modal-field">
            <label>Dirección</label>
            <input
              name="direccion"
              value={form.direccion}
              onChange={handleChange}
              placeholder="Ej: Calle Las Rosas 123, Lima"
            />
          </div>

          <div className="modal-field">
            <label>Preferencias</label>
            <div className="prefs-selector">
              {PREFERENCIAS_OPCIONES.map(pref => (
                <button
                  key={pref}
                  type="button"
                  className={`pref-opcion ${form.preferencias.includes(pref) ? 'selected' : ''}`}
                  onClick={() => togglePref(pref)}
                >
                  {pref}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancelar" onClick={() => onClose(false)}>
            Cancelar
          </button>
          <button className="btn-guardar-modal" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Guardando...' : esEdicion ? 'Guardar Cambios' : 'Registrar Cliente'}
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}