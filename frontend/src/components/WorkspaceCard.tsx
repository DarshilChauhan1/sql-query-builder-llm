import React from 'react';
import type { Workspace } from '../store/services/workspace.service';

interface WorkspaceCardProps {
    workspace: Workspace;
}

export const WorkspaceCard: React.FC<WorkspaceCardProps> = ({ workspace }) => {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleOpenWorkspace = () => {
        // Navigate to workspace details or query builder
        window.location.href = `/workspace/${workspace.id}`;
    };

    return (
        <div className="bg-slate-700 border border-slate-600 rounded-xl p-6 hover:border-slate-500 transition-colors duration-200 group cursor-pointer">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-100 mb-2 group-hover:text-blue-400 transition-colors duration-200">
                        {workspace.name}
                    </h3>
                    {workspace.description && (
                        <p className="text-slate-400 text-sm line-clamp-2">
                            {workspace.description}
                        </p>
                    )}
                </div>
                
                <div className="ml-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                        </svg>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
                <span>Created {formatDate(workspace.createdAt)}</span>
                <span>Updated {formatDate(workspace.updatedAt)}</span>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-slate-400">Active</span>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <button 
                        className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-600 rounded-lg transition-colors duration-200"
                        title="Edit workspace"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    
                    <button 
                        onClick={handleOpenWorkspace}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 flex items-center space-x-1"
                    >
                        <span>Open</span>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};
