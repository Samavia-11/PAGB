'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

interface ToastComponentProps extends ToastProps {
  onClose: (id: string) => void;
}

const ToastComponent = ({ id, type, title, message, duration = 5000, onClose }: ToastComponentProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation
    setIsVisible(true);

    // Auto close
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(id), 300); // Wait for animation
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 max-w-md w-full
        transform transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div className={`rounded-lg border p-4 shadow-lg ${getColors()}`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium">{title}</h3>
            <p className="mt-1 text-sm opacity-90">{message}</p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={() => {
                setIsVisible(false);
                setTimeout(() => onClose(id), 300);
              }}
              className="inline-flex rounded-md p-1.5 hover:bg-black hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-offset-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Toast Manager
class ToastManager {
  private toasts: ToastProps[] = [];
  private listeners: ((toasts: ToastProps[]) => void)[] = [];

  subscribe(listener: (toasts: ToastProps[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener([...this.toasts]));
  }

  show(toast: Omit<ToastProps, 'id'>) {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    this.toasts.push(newToast);
    this.notify();
    return id;
  }

  remove(id: string) {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
    this.notify();
  }

  success(title: string, message: string, duration?: number) {
    return this.show({ type: 'success', title, message, duration });
  }

  error(title: string, message: string, duration?: number) {
    return this.show({ type: 'error', title, message, duration });
  }

  warning(title: string, message: string, duration?: number) {
    return this.show({ type: 'warning', title, message, duration });
  }

  info(title: string, message: string, duration?: number) {
    return this.show({ type: 'info', title, message, duration });
  }
}

export const toast = new ToastManager();

// Toast Container Component
export const ToastContainer = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  useEffect(() => {
    return toast.subscribe(setToasts);
  }, []);

  return (
    <div className="fixed top-0 right-0 z-50 p-4 space-y-2">
      {toasts.map((toastProps) => (
        <ToastComponent
          key={toastProps.id}
          {...toastProps}
          onClose={toast.remove.bind(toast)}
        />
      ))}
    </div>
  );
};

// Hook for using toast
export const useToast = () => {
  return {
    success: toast.success.bind(toast),
    error: toast.error.bind(toast),
    warning: toast.warning.bind(toast),
    info: toast.info.bind(toast),
  };
};
