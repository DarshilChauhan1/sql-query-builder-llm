import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, clearCredentials } from '../store/slices/auth.slice';

interface User {
    id: string;
    name: string;
    email: string;
}

interface SidebarProps {
    user?: User;
}

export const Sidebar: React.FC<SidebarProps> = ({ user }) => {
    const dispatch = useDispatch();
    const currentUser = useSelector(selectCurrentUser) as User;
    console.log('Current User in Sidebar:', currentUser);

    const displayUser = user || currentUser || {
        name: 'Guest User',
        email: 'guest@example.com',
        id: '1'
    };

    const handleLogout = () => {
        dispatch(clearCredentials());
        window.location.href = '/login';
    };

    return (
        <div className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
            {/* Logo/Brand */}
            <div className="p-6 border-b border-slate-700">
                <h2 className="text-xl font-bold text-slate-100">SQL Builder</h2>
                <p className="text-sm text-slate-400">Query Builder LLM</p>
            </div>

            {/* Navigation */}
            <div className="flex-1 p-4">
                <nav className="space-y-2">
                    <a
                        href="/dashboard"
                        className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-slate-700 text-slate-100"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <span>Workspaces</span>
                    </a>

                    <a
                        href="/settings"
                        className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-slate-100 transition-colors duration-200"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>Settings</span>
                    </a>
                </nav>
            </div>

            {/* User Profile */}
            <div className="p-4 border-t border-slate-700">
                <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                            {displayUser.name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-200 truncate">
                            {displayUser.name}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                            {displayUser.email}
                        </p>
                    </div>
                </div>
                
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-slate-100 rounded-lg transition-colors duration-200"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Sign out</span>
                </button>
            </div>
        </div>
    );
};
