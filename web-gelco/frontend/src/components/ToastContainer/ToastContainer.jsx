import { useToast } from '../../services/toastService';
import './ToastContainer.css';

export default function ToastContainer() {
  const { toasts, remove } = useToast();

  const getToastColor = (type) => {
    switch (type) {
      case 'success':
        return '#16a34a';
      case 'danger':
        return '#dc2626';
      case 'warning':
        return '#d97706';
      case 'info':
        return '#2563eb';
      default:
        return '#2563eb';
    }
  };

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type}`}
          style={{ backgroundColor: getToastColor(toast.type) }}
        >
          <span className="toast-message">{toast.message}</span>
          <button
            className="toast-close"
            onClick={() => remove(toast.id)}
            aria-label="Close toast"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
