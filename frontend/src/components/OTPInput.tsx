import React, { useState, useRef, useEffect } from 'react';
import type { KeyboardEvent, ClipboardEvent } from 'react';

interface OTPInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  onChangeOTP?: (otp: string) => void;
  disabled?: boolean;
  error?: boolean;
  className?: string;
  placeholder?: string;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  onComplete,
  onChangeOTP,
  disabled = false,
  error = false,
  className = '',
  placeholder = ''
}) => {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus on first input when component mounts
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Handle input change
  const handleChange = (value: string, index: number) => {
    if (disabled) return;

    // Only allow numbers
    const sanitizedValue = value.replace(/[^0-9]/g, '');
    
    if (sanitizedValue.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = sanitizedValue;
      setOtp(newOtp);

      // Call onChange callback
      const otpString = newOtp.join('');
      onChangeOTP?.(otpString);

      // Auto-focus next input or complete
      if (sanitizedValue && index < length - 1) {
        setActiveIndex(index + 1);
        inputRefs.current[index + 1]?.focus();
      } else if (otpString.length === length) {
        onComplete(otpString);
      }
    }
  };

  // Handle key down events
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (disabled) return;

    if (e.key === 'Backspace') {
      if (otp[index] === '' && index > 0) {
        // Move to previous input if current is empty
        setActiveIndex(index - 1);
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current input
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
        onChangeOTP?.(newOtp.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      setActiveIndex(index - 1);
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      setActiveIndex(index + 1);
      inputRefs.current[index + 1]?.focus();
    } else if (e.key === 'Delete') {
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
      onChangeOTP?.(newOtp.join(''));
    }
  };

  // Handle paste event
  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (disabled) return;

    const pastedData = e.clipboardData.getData('text/plain').replace(/[^0-9]/g, '');
    
    if (pastedData.length <= length) {
      const newOtp = new Array(length).fill('');
      
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i];
      }
      
      setOtp(newOtp);
      onChangeOTP?.(newOtp.join(''));
      
      // Focus on the last filled input or complete if all filled
      const lastFilledIndex = Math.min(pastedData.length - 1, length - 1);
      setActiveIndex(lastFilledIndex);
      inputRefs.current[lastFilledIndex]?.focus();
      
      if (pastedData.length === length) {
        onComplete(pastedData);
      }
    }
  };

  // Handle focus
  const handleFocus = (index: number) => {
    setActiveIndex(index);
  };

  // Clear all inputs
  const clearOTP = () => {
    if (disabled) return;
    setOtp(new Array(length).fill(''));
    setActiveIndex(0);
    inputRefs.current[0]?.focus();
    onChangeOTP?.('');
  };

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      <div className="flex space-x-3">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(ref) => {
              inputRefs.current[index] = ref;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e.target.value, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onFocus={() => handleFocus(index)}
            onPaste={handlePaste}
            disabled={disabled}
            placeholder={placeholder}
            className={`
              w-12 h-12 text-center text-lg font-semibold border-2 rounded-lg
              transition-all duration-200 ease-in-out
              focus:outline-none focus:ring-2 focus:ring-offset-2
              ${error
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50'
                : activeIndex === index
                ? 'border-blue-500 focus:border-blue-500 focus:ring-blue-500 bg-blue-50'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400'
              }
              ${disabled
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-900'
              }
              transform hover:scale-105 focus:scale-105
              ${digit ? 'border-blue-400 bg-blue-50' : ''}
            `}
            aria-label={`Digit ${index + 1} of ${length}`}
          />
        ))}
      </div>
      
      {/* Clear button */}
      {otp.some(digit => digit !== '') && !disabled && (
        <button
          type="button"
          onClick={clearOTP}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200 underline"
        >
          Clear
        </button>
      )}
    </div>
  );
};

// Higher-order component for OTP verification
interface OTPVerificationProps {
  title?: string;
  subtitle?: string;
  length?: number;
  isLoading?: boolean;
  error?: string;
  onVerify: (otp: string) => void;
  onResend?: () => void;
  resendDisabled?: boolean;
  resendCountdown?: number;
}

export const OTPVerification: React.FC<OTPVerificationProps> = ({
  title = 'Enter verification code',
  subtitle = 'We sent a 6-digit code to your email',
  length = 6,
  isLoading = false,
  error,
  onVerify,
  onResend,
  resendDisabled = false,
  resendCountdown = 0
}) => {
  const [currentOTP, setCurrentOTP] = useState('');

  const handleOTPComplete = (otp: string) => {
    setCurrentOTP(otp);
    onVerify(otp);
  };

  const handleOTPChange = (otp: string) => {
    setCurrentOTP(otp);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg border border-gray-200">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600">{subtitle}</p>
      </div>

      <div className="mb-6">
        <OTPInput
          length={length}
          onComplete={handleOTPComplete}
          onChangeOTP={handleOTPChange}
          disabled={isLoading}
          error={!!error}
        />
        
        {error && (
          <p className="text-red-600 text-sm text-center mt-3 animate-fadeIn">
            {error}
          </p>
        )}
      </div>

      <div className="space-y-4">
        <button
          type="button"
          disabled={currentOTP.length !== length || isLoading}
          onClick={() => onVerify(currentOTP)}
          className={`
            w-full py-2.5 px-4 border border-transparent rounded-md text-sm font-medium
            transition-all duration-200 ease-in-out
            ${currentOTP.length === length && !isLoading
              ? 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg transform hover:scale-[1.02]'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
          `}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Verifying...
            </div>
          ) : (
            'Verify Code'
          )}
        </button>

        {onResend && (
          <div className="text-center">
            <button
              type="button"
              disabled={resendDisabled}
              onClick={onResend}
              className={`
                text-sm transition-colors duration-200
                ${resendDisabled
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-blue-600 hover:text-blue-700 underline'
                }
              `}
            >
              {resendCountdown > 0
                ? `Resend code in ${resendCountdown}s`
                : 'Resend code'
              }
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
