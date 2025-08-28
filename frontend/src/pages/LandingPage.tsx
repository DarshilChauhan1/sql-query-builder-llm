import React from 'react';
import { useRedirectIfAuthenticated } from '../hooks/useRedirectIfAuthenticated';

export const LandingPage: React.FC = () => {
    // Redirect to dashboard if user is already authenticated
    useRedirectIfAuthenticated('/dashboard');

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-slate-100 mb-4">SQL Query Builder LLM</h1>
                <p className="text-slate-400 mb-8">Welcome to the SQL Query Builder powered by AI</p>
                <div className="space-x-4">
                    <a href="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors duration-200">
                        Login
                    </a>
                    <a href="/register" className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-6 py-2 rounded-md transition-colors duration-200">
                        Register
                    </a>
                    <a href="/dashboard" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md transition-colors duration-200">
                        Dashboard
                    </a>
                </div>
            </div>
        </div>
    );
};
