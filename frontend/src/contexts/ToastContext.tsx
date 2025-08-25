import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import type { ToastOptions } from 'react-hot-toast';

// Types for different toast variants
export type ToastVariant = 'success' | 'error' | 'warning' | 'info' | 'loading';

// Enhanced toast options
interface CustomToastOptions extends ToastOptions {
  variant?: ToastVariant;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Toast service interface
interface ToastService {
  success: (message: string, options?: CustomToastOptions) => string;
  error: (message: string, options?: CustomToastOptions) => string;
  warning: (message: string, options?: CustomToastOptions) => string;
  info: (message: string, options?: CustomToastOptions) => string;
  loading: (message: string, options?: CustomToastOptions) => string;
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    },
    options?: CustomToastOptions
  ) => Promise<T>;
  dismiss: (toastId?: string) => void;
  remove: (toastId?: string) => void;
}

// Custom toast implementations
const toastService: ToastService = {
  success: (message: string, options?: CustomToastOptions) => {
    return toast.success(message, {
      duration: 4000,
      style: {
        background: '#10B981',
        color: '#FFFFFF',
        fontWeight: '500',
        borderRadius: '8px',
        border: '1px solid #059669',
      },
      iconTheme: {
        primary: '#FFFFFF',
        secondary: '#10B981',
      },
      ...options,
    });
  },

  error: (message: string, options?: CustomToastOptions) => {
    return toast.error(message, {
      duration: 6000,
      style: {
        background: '#EF4444',
        color: '#FFFFFF',
        fontWeight: '500',
        borderRadius: '8px',
        border: '1px solid #DC2626',
      },
      iconTheme: {
        primary: '#FFFFFF',
        secondary: '#EF4444',
      },
      ...options,
    });
  },

  warning: (message: string, options?: CustomToastOptions) => {
    return toast(message, {
      duration: 5000,
      icon: '⚠️',
      style: {
        background: '#F59E0B',
        color: '#FFFFFF',
        fontWeight: '500',
        borderRadius: '8px',
        border: '1px solid #D97706',
      },
      ...options,
    });
  },

  info: (message: string, options?: CustomToastOptions) => {
    return toast(message, {
      duration: 4000,
      icon: 'ℹ️',
      style: {
        background: '#3B82F6',
        color: '#FFFFFF',
        fontWeight: '500',
        borderRadius: '8px',
        border: '1px solid #2563EB',
      },
      ...options,
    });
  },

  loading: (message: string, options?: CustomToastOptions) => {
    return toast.loading(message, {
      style: {
        background: '#6B7280',
        color: '#FFFFFF',
        fontWeight: '500',
        borderRadius: '8px',
        border: '1px solid #4B5563',
      },
      ...options,
    });
  },

  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    },
    options?: CustomToastOptions
  ) => {
    return toast.promise(promise, messages, {
      style: {
        fontWeight: '500',
        borderRadius: '8px',
      },
      success: {
        style: {
          background: '#10B981',
          color: '#FFFFFF',
          border: '1px solid #059669',
        },
        iconTheme: {
          primary: '#FFFFFF',
          secondary: '#10B981',
        },
      },
      error: {
        style: {
          background: '#EF4444',
          color: '#FFFFFF',
          border: '1px solid #DC2626',
        },
        iconTheme: {
          primary: '#FFFFFF',
          secondary: '#EF4444',
        },
      },
      loading: {
        style: {
          background: '#6B7280',
          color: '#FFFFFF',
          border: '1px solid #4B5563',
        },
      },
      ...options,
    });
  },

  dismiss: (toastId?: string) => {
    toast.dismiss(toastId);
  },

  remove: (toastId?: string) => {
    toast.remove(toastId);
  },
};

// Context
const ToastContext = createContext<ToastService | undefined>(undefined);

// Provider component
interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  return (
    <ToastContext.Provider value={toastService}>
      {children}
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{
          top: 20,
          left: 20,
          bottom: 20,
          right: 20,
          zIndex: 9999,
        }}
        toastOptions={{
          // Default options for all toasts
          duration: 4000,
          style: {
            background: '#FFFFFF',
            color: '#374151',
            fontWeight: '500',
            borderRadius: '8px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            maxWidth: '500px',
            padding: '12px 16px',
          },
          // Custom styles for different types
          success: {
            duration: 4000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#FFFFFF',
            },
          },
          error: {
            duration: 6000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#FFFFFF',
            },
          },
          loading: {
            duration: Infinity,
            iconTheme: {
              primary: '#6B7280',
              secondary: '#FFFFFF',
            },
          },
        }}
      />
    </ToastContext.Provider>
  );
};

// Hook to use toast
export const useToast = (): ToastService => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Export toast service for direct usage (without hook)
export { toastService as toast };
