import { createContext, useContext, useState, useCallback } from 'react';

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

  const show = useCallback((message, type = 'info') => {
    const id = Date.now();
    const toast = { id, message, type };
    
    setToasts((prevToasts) => [...prevToasts, toast]);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      remove(id);
    }, 3000);

    return id;
  }, []);

  const remove = useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const clear = useCallback(() => {
    setToasts([]);
  }, []);

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
