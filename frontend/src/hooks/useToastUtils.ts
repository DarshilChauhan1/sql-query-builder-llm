import { useToast } from '../contexts/ToastContext';

// Enhanced hook with additional utilities
export const useToastUtils = () => {
  const toast = useToast();

  // API response helpers
  const handleApiResponse = async <T,>(
    apiCall: () => Promise<T>,
    messages?: {
      loading?: string;
      success?: string | ((data: T) => string);
      error?: string | ((error: Error) => string);
    }
  ): Promise<T> => {
    const defaultMessages = {
      loading: 'Processing...',
      success: 'Operation completed successfully',
      error: 'An error occurred',
    };

    const finalMessages = { ...defaultMessages, ...messages };

    try {
      return await toast.promise(apiCall(), finalMessages);
    } catch (error) {
      throw error;
    }
  };

  // Form submission helper
  const handleFormSubmit = async <T,>(
    submitFn: () => Promise<T>,
    options?: {
      loadingMessage?: string;
      successMessage?: string | ((data: T) => string);
      errorMessage?: string | ((error: Error) => string);
      onSuccess?: (data: T) => void;
      onError?: (error: Error) => void;
    }
  ): Promise<void> => {
    try {
      const result = await handleApiResponse(submitFn, {
        loading: options?.loadingMessage || 'Submitting...',
        success: options?.successMessage || 'Form submitted successfully',
        error: options?.errorMessage || 'Failed to submit form',
      });

      options?.onSuccess?.(result);
    } catch (error) {
      options?.onError?.(error as Error);
    }
  };

  // Auth helpers
  const authToasts = {
    loginSuccess: (userName?: string) =>
      toast.success(`Welcome back${userName ? `, ${userName}` : ''}!`),
    
    loginError: (error?: string) =>
      toast.error(error || 'Invalid credentials. Please try again.'),
    
    registerSuccess: () =>
      toast.success('Registration successful! Please check your email for verification.'),
    
    registerError: (error?: string) =>
      toast.error(error || 'Registration failed. Please try again.'),
    
    verificationSuccess: () =>
      toast.success('Email verified successfully! Welcome to the platform.'),
    
    verificationError: (error?: string) =>
      toast.error(error || 'Verification failed. Please try again.'),
    
    logoutSuccess: () =>
      toast.success('You have been logged out successfully.'),
    
    sessionExpired: () =>
      toast.warning('Your session has expired. Please log in again.'),
  };

  // Data operation helpers
  const dataToasts = {
    saveSuccess: (itemName?: string) =>
      toast.success(`${itemName || 'Data'} saved successfully!`),
    
    saveError: (itemName?: string, error?: string) =>
      toast.error(error || `Failed to save ${itemName || 'data'}. Please try again.`),
    
    deleteSuccess: (itemName?: string) =>
      toast.success(`${itemName || 'Item'} deleted successfully!`),
    
    deleteError: (itemName?: string, error?: string) =>
      toast.error(error || `Failed to delete ${itemName || 'item'}. Please try again.`),
    
    updateSuccess: (itemName?: string) =>
      toast.success(`${itemName || 'Data'} updated successfully!`),
    
    updateError: (itemName?: string, error?: string) =>
      toast.error(error || `Failed to update ${itemName || 'data'}. Please try again.`),
    
    loadError: (itemName?: string) =>
      toast.error(`Failed to load ${itemName || 'data'}. Please refresh and try again.`),
  };

  // Network helpers
  const networkToasts = {
    offline: () =>
      toast.warning('You are currently offline. Some features may not be available.'),
    
    online: () =>
      toast.success('Connection restored!'),
    
    networkError: () =>
      toast.error('Network error. Please check your connection and try again.'),
    
    timeout: () =>
      toast.error('Request timed out. Please try again.'),
  };

  // Validation helpers
  const validationToasts = {
    required: (fieldName: string) =>
      toast.error(`${fieldName} is required.`),
    
    invalid: (fieldName: string) =>
      toast.error(`Please enter a valid ${fieldName.toLowerCase()}.`),
    
    mismatch: (field1: string, field2: string) =>
      toast.error(`${field1} and ${field2} do not match.`),
    
    tooShort: (fieldName: string, minLength: number) =>
      toast.error(`${fieldName} must be at least ${minLength} characters long.`),
    
    tooLong: (fieldName: string, maxLength: number) =>
      toast.error(`${fieldName} must be no more than ${maxLength} characters long.`),
  };

  return {
    ...toast,
    handleApiResponse,
    handleFormSubmit,
    auth: authToasts,
    data: dataToasts,
    network: networkToasts,
    validation: validationToasts,
  };
};
