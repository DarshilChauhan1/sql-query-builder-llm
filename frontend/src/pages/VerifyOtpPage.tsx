import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { OTPVerification } from '../components/OTPInput';
import { useVerifyEmailMutation, useRegisterMutation } from '../store/services/auth.service';
import { useToastUtils } from '../hooks/useToastUtils';

interface LocationState {
  registrationData: {
    name: string;
    email: string;
    password: string;
    hash: string;
    otpExpiry: string;
  };
}

export const VerifyOtpPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const authToast = useToastUtils().commonToasts;
  const [verifyEmail, { isLoading }] = useVerifyEmailMutation();
  const [register] = useRegisterMutation();
  const [error, setError] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);

  // Get registration data from navigation state
  const registrationData = (location.state as LocationState)?.registrationData;

  // Redirect if no registration data
  useEffect(() => {
    if (!registrationData) {
      navigate('/register');
      return;
    }
  }, [registrationData, navigate]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleVerifyOTP = async (otp: string) => {
    if (!registrationData) return;
    
    setError('');

    try {
      // Prepare the verification payload with all required fields
      const verificationPayload = {
        otp: otp,
        name: registrationData.name,
        hash: registrationData.hash,
        otpExpiry: registrationData.otpExpiry,
        email: registrationData.email,
        password: registrationData.password
      };

      // Make the API call to verify OTP and complete registration
      const response = await verifyEmail(verificationPayload).unwrap();
      console.log('OTP verification response:', response);
      
      if (response.success) {
        authToast.success('Account verified successfully!');
        // Navigate to login page
        navigate('/home');
      }

    } catch (err: any) {
      console.error('OTP verification failed:', err);
      const errorMessage = err?.data?.message || 'OTP verification failed. Please try again.';
      setError(errorMessage);
      authToast.error(errorMessage);
    }
  };

  const handleResendOTP = async () => {
    if (!registrationData) return;
    
    try {
      setResendCountdown(60); // Start countdown
      
      // Make the API call to resend OTP using the register endpoint
      const response = await register({ email: registrationData.email }).unwrap();
      
      if (response.success) {
        // Update the hash and otpExpiry with new values
        const newRegistrationData = {
          ...registrationData,
          hash: response.data.hash,
          otpExpiry: response.data.otpExpiry
        };
        
        // Update the location state with new data
        navigate('/verify-otp', {
          state: { registrationData: newRegistrationData },
          replace: true
        });
        
        authToast.success("Verification code resent successfully!");
      }
    } catch (err: any) {
      console.error('Resend OTP failed:', err);
      authToast.error('Failed to resend OTP. Please try again.');
      setResendCountdown(0);
    }
  };

  if (!registrationData) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-100 mb-4">Access Denied</h2>
          <p className="text-slate-400 mb-6">Please register first to access this page.</p>
          <button
            onClick={() => navigate('/register')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors duration-200"
          >
            Go to Register
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-slate-100">
            Verify Your Email
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            We sent a verification code to{' '}
            <span className="font-medium text-slate-300">{registrationData.email}</span>
          </p>
        </div>

        <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 p-6">
          <OTPVerification
            title="Enter verification code"
            subtitle={`Check your email and enter the 6-digit code we sent to ${registrationData.email}`}
            isLoading={isLoading}
            error={error}
            onVerify={handleVerifyOTP}
            onResend={handleResendOTP}
            resendDisabled={resendCountdown > 0}
            resendCountdown={resendCountdown}
          />

          {/* Back to Registration */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/register')}
              className="text-sm text-slate-400 hover:text-slate-300 transition-colors duration-200"
            >
              ← Back to registration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};