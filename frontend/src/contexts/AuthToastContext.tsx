import React, { createContext, useContext } from 'react';
import toast, { Toaster } from 'react-hot-toast';

interface AuthToastContextType {
  loginSuccess: (userName: string) => void;
  loginError: (message?: string) => void;
  registerSuccess: (message?: string) => void;
  registerError: (message?: string) => void;
  otpSent: (email: string) => void;
  otpError: (message?: string) => void;
  logoutSuccess: () => void;
}

const AuthToastContext = createContext<AuthToastContextType | undefined>(undefined);

export const AuthToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const authToast: AuthToastContextType = {
    loginSuccess: (userName: string) => {
      toast.success(`Welcome back, ${userName}!`, {
        duration: 3000,
        position: 'top-center',
        style: {
          background: '#10B981',
          color: '#fff',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
        },
      });
    },

    loginError: (message = 'Invalid credentials. Please try again.') => {
      toast.error(message, {
        duration: 4000,
        position: 'top-center',
        style: {
          background: '#EF4444',
          color: '#fff',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
        },
      });
    },

    registerSuccess: (message = 'Account created successfully! Please check your email to verify.') => {
      toast.success(message, {
        duration: 5000,
        position: 'top-right',
        style: {
          background: '#10B981',
          color: '#fff',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
        },
      });
    },

    registerError: (message = 'Registration failed. Please try again.') => {
      toast.error(message, {
        duration: 4000,
        position: 'top-right',
        style: {
          background: '#EF4444',
          color: '#fff',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
        },
      });
    },

    otpSent: (email: string) => {
      toast.success(`Verification code sent to ${email}`, {
        duration: 4000,
        position: 'top-right',
        style: {
          background: '#3B82F6',
          color: '#fff',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
        },
      });
    },

    otpError: (message = 'Invalid verification code. Please try again.') => {
      toast.error(message, {
        duration: 4000,
        position: 'top-right',
        style: {
          background: '#EF4444',
          color: '#fff',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
        },
      });
    },

    logoutSuccess: () => {
      toast.success('Logged out successfully', {
        duration: 2000,
        position: 'top-right',
        style: {
          background: '#6B7280',
          color: '#fff',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
        },
      });
    },
  };

  return (
    <AuthToastContext.Provider value={authToast}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </AuthToastContext.Provider>
  );
};

export const useAuthToast = (): AuthToastContextType => {
  const context = useContext(AuthToastContext);
  if (!context) {
    throw new Error('useAuthToast must be used within an AuthToastProvider');
  }
  return context;
};
