import React, { useState } from 'react';
import { OTPInput, OTPVerification } from '../components/OTPInput';
import { useAuthToast } from '../contexts/AuthToastContext';

export const OTPDemo: React.FC = () => {
  const [basicOTP, setBasicOTP] = useState('');
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const authToast = useAuthToast();

  const handleBasicOTPComplete = (otp: string) => {
    console.log('Basic OTP completed:', otp);
    authToast.otpSent('test@example.com');
  };

  const handleVerify = async (otp: string) => {
    setVerificationLoading(true);
    setVerificationError('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate random success/failure
      if (otp === '123456') {
        authToast.loginSuccess('John Doe');
        console.log('OTP verified successfully!');
      } else {
        throw new Error('Invalid verification code');
      }
    } catch (error) {
      setVerificationError('Invalid verification code. Please try again.');
      authToast.otpError();
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleResend = () => {
    authToast.otpSent('test@example.com');
    setResendCountdown(30);
    
    // Countdown timer
    const timer = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">OTP Input Components</h1>
          <p className="text-gray-600">Interactive 6-digit OTP input components with animations</p>
        </div>

        {/* Basic OTP Input */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic OTP Input</h2>
          <div className="space-y-4">
            <OTPInput
              onComplete={handleBasicOTPComplete}
              onChangeOTP={setBasicOTP}
            />
            <p className="text-sm text-gray-600 text-center">
              Current OTP: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{basicOTP || 'Empty'}</span>
            </p>
          </div>
        </div>

        {/* Error State OTP */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Error State OTP</h2>
          <div className="space-y-4">
            <OTPInput
              onComplete={(otp) => console.log('Error OTP:', otp)}
              error={true}
            />
            <p className="text-sm text-red-600 text-center">Invalid code. Please try again.</p>
          </div>
        </div>

        {/* Disabled State OTP */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Disabled State OTP</h2>
          <div className="space-y-4">
            <OTPInput
              onComplete={(otp) => console.log('Disabled OTP:', otp)}
              disabled={true}
            />
            <p className="text-sm text-gray-500 text-center">Input is disabled</p>
          </div>
        </div>

        {/* Full OTP Verification Component */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Complete OTP Verification</h2>
          <p className="text-sm text-gray-600 mb-6 text-center">
            Try entering <code className="bg-gray-100 px-2 py-1 rounded font-mono">123456</code> for success, or any other code for error
          </p>
          <OTPVerification
            title="Verify your email"
            subtitle="We sent a 6-digit code to john.doe@example.com"
            isLoading={verificationLoading}
            error={verificationError}
            onVerify={handleVerify}
            onResend={handleResend}
            resendDisabled={resendCountdown > 0}
            resendCountdown={resendCountdown}
          />
        </div>

        {/* Custom Length OTP */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Custom Length OTP (4 digits)</h2>
          <div className="space-y-4">
            <OTPInput
              length={4}
              onComplete={(otp) => console.log('4-digit OTP:', otp)}
            />
          </div>
        </div>

        {/* Features List */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Features</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">User Experience</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✅ Auto-focus next input on type</li>
                <li>✅ Backspace navigation</li>
                <li>✅ Arrow key navigation</li>
                <li>✅ Paste support (auto-fill)</li>
                <li>✅ Auto-complete callback</li>
                <li>✅ Clear all functionality</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Visual & States</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✅ Smooth hover animations</li>
                <li>✅ Focus states with ring effects</li>
                <li>✅ Error state styling</li>
                <li>✅ Disabled state</li>
                <li>✅ Loading states</li>
                <li>✅ Scale transformations</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Usage Examples */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Usage Examples</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <pre className="text-sm overflow-x-auto">
{`// Basic usage
<OTPInput
  onComplete={(otp) => console.log('OTP:', otp)}
  onChangeOTP={(otp) => setCurrentOTP(otp)}
/>

// With error state
<OTPInput
  onComplete={handleOTP}
  error={hasError}
  disabled={isLoading}
/>

// Complete verification component
<OTPVerification
  title="Verify your email"
  subtitle="Enter the code we sent to your email"
  onVerify={handleVerify}
  onResend={handleResend}
  isLoading={isVerifying}
  error={verificationError}
/>`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
