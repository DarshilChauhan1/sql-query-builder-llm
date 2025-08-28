import React from 'react';
import { Link } from 'react-router-dom';
import { RegisterForm } from '../components/Register';
import { useRedirectIfAuthenticated } from '../hooks/useRedirectIfAuthenticated';

export const RegisterPage: React.FC = () => {
  // Redirect to dashboard if user is already authenticated
  useRedirectIfAuthenticated('/dashboard');

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-100">
          Create your account
        </h2>
          <p className="mt-2 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-blue-400 hover:text-blue-300 transition-colors duration-200"
          >
            Sign in
          </Link>
        </p>
        < RegisterForm/>
      </div>
    </div>
  );
};
