import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetWorkspaceQuery } from '../store/services/workspace.service';

export const WorkspaceDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: workspaceResponse, isLoading, error } = useGetWorkspaceQuery(id!);
    
    const workspace = workspaceResponse?.data;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || !workspace) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-400 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-slate-200 mb-2">Workspace not found</h3>
                    <p className="text-slate-400 mb-4">The workspace you're looking for doesn't exist or you don't have access to it.</p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900">
            {/* Header */}
            <div className="bg-slate-800 border-b border-slate-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="text-slate-400 hover:text-slate-200 transition-colors duration-200"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-100">{workspace.name}</h1>
                                {workspace.description && (
                                    <p className="text-slate-400">{workspace.description}</p>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                            <button className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2 rounded-lg transition-colors duration-200">
                                Settings
                            </button>
                            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200">
                                New Query
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Query Area */}
                    <div className="lg:col-span-2">
                        <div className="bg-slate-800 rounded-xl p-6 mb-6">
                            <h2 className="text-lg font-semibold text-slate-100 mb-4">SQL Query Builder</h2>
                            <div className="bg-slate-900 rounded-lg p-4 mb-4">
                                <textarea
                                    placeholder="Enter your query or describe what you want to query in natural language..."
                                    className="w-full h-32 bg-transparent text-slate-100 placeholder-slate-400 resize-none focus:outline-none"
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200">
                                        Run Query
                                    </button>
                                    <button className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2 rounded-lg transition-colors duration-200">
                                        Generate with AI
                                    </button>
                                </div>
                                <div className="text-xs text-slate-400">
                                    Press Ctrl+Enter to run
                                </div>
                            </div>
                        </div>

                        {/* Results Area */}
                        <div className="bg-slate-800 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-slate-100 mb-4">Query Results</h3>
                            <div className="bg-slate-900 rounded-lg p-4 min-h-48">
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center">
                                        <div className="text-slate-400 mb-2">
                                            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <p className="text-slate-400">No query results yet</p>
                                        <p className="text-sm text-slate-500 mt-1">Run a query to see results here</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Database Schema */}
                        <div className="bg-slate-800 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-slate-100 mb-4">Database Schema</h3>
                            <div className="space-y-2">
                                <div className="text-sm">
                                    <div className="flex items-center space-x-2 text-slate-300 py-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                                        </svg>
                                        <span>Loading schema...</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Queries */}
                        <div className="bg-slate-800 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-slate-100 mb-4">Recent Queries</h3>
                            <div className="text-center py-8">
                                <div className="text-slate-400 mb-2">
                                    <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                                <p className="text-sm text-slate-400">No recent queries</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
