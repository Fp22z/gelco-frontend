import { useToast } from '../../services/toastService.jsx';
import './ToastContainer.css';

const ICONS = {
  success: '✓',
  danger: '✕',
  warning: '⚠',
  info: 'ℹ',
};

export default function ToastContainer() {
  const { toasts, remove } = useToast();

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type}`}
        >
          <span className="toast-icon">{ICONS[toast.type] || ICONS.info}</span>
          <div className="toast-content">
            <span className="toast-message">{toast.message}</span>
          </div>
          <button
            className="toast-close"
            onClick={() => remove(toast.id)}
            aria-label="Cerrar notificación"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
