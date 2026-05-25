import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import './Modal.css';

/**
 * Modal con React Portal — se renderiza en document.body
 * independientemente de dónde esté en el árbol de componentes.
 * Esto evita que overflow: auto/hidden de ancestros corte el overlay.
 *
 * Props:
 *   onClose   — función al hacer clic en el overlay o Escape
 *   size      — 'sm' | 'md' | 'lg' (default: 'md')
 *   children  — contenido del modal
 */
export default function Modal({ onClose, size = 'md', children }) {
  // Bloquear scroll del body mientras el modal está abierto
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return createPortal(
    <div className="portal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className={`portal-modal portal-modal--${size}`}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}