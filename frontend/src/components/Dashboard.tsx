import React, { useState } from 'react';
import { useGetWorkspacesQuery } from '../store/services/workspace.service';
import { CreateWorkspaceModal } from './CreateWorkspaceModal';
import { WorkspaceCard } from './WorkspaceCard';
import { Sidebar } from './Sidebar';
import { useSelector } from 'react-redux';

export const Dashboard: React.FC = () => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const { data: workspacesResponse, isLoading, error } = useGetWorkspacesQuery();
    
    const workspaces = workspacesResponse?.data || [];
    const user = useSelector((state: any) => state.auth.user);
    return (
        <div className="min-h-screen bg-slate-900 flex">
            {/* Sidebar */}
            <Sidebar user={user} />
            
            {/* Main Content */}
            <div className={`flex-1 p-8 transition-all duration-300 ${isCreateModalOpen ? 'blur-sm' : ''}`}>
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-100 mb-2">
                            Your Workspaces
                        </h1>
                        <p className="text-slate-400">
                            Create and manage your SQL query builder workspaces
                        </p>
                    </div>
                </div>

                {/* Content Area */}
                <div className="bg-slate-800 rounded-xl p-6 min-h-[500px]">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-center">
                                <div className="text-red-400 mb-2">
                                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-slate-200 mb-2">Failed to load workspaces</h3>
                                <p className="text-slate-400">Please try again later</p>
                            </div>
                        </div>
                    ) : workspaces.length === 0 ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-center">
                                <div className="text-slate-400 mb-4">
                                    <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-slate-200 mb-2">No workspaces yet</h3>
                                <p className="text-slate-400 mb-6">Get started by creating your first workspace</p>
                                <button
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 inline-flex items-center space-x-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    <span>Create Workspace</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {workspaces.map((workspace) => (
                                <WorkspaceCard key={workspace.id} workspace={workspace} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Create Workspace Modal */}
            <CreateWorkspaceModal 
                isOpen={isCreateModalOpen} 
                onClose={() => setIsCreateModalOpen(false)} 
            />
        </div>
    );
};
