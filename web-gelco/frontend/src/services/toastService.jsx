import { createContext, useContext, useState, useCallback, useRef } from 'react';

/**
 * @typedef {Object} Toast
 * @property {number} id - Unique ID
 * @property {string} message - Toast message
 * @property {'success' | 'danger' | 'warning' | 'info'} type - Toast type
 */

/**
 * Toast Context
 */
const ToastContext = createContext();

/**
 * Toast Provider Component
 */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timerRef = useRef(new Map());

  const remove = useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const clear = useCallback(() => {
    timerRef.current.forEach(timer => clearTimeout(timer));
    timerRef.current.clear();
    setToasts([]);
  }, []);

  const show = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);

    const timer = setTimeout(() => {
      remove(id);
      timerRef.current.delete(id);
    }, 3000);

    timerRef.current.set(id, timer);

    return id;
  }, [remove]);

  const value = {
    toasts,
    show,
    remove,
    clear,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
};

/**
 * Hook to use Toast context
 * @returns {Object} { toasts, show, remove, clear }
 */
export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }

  return context;
};
