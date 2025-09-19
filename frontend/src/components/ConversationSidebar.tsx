import React from 'react';
import { useNavigate } from 'react-router-dom';

interface Conversation {
    id: string;
    title: string;
    createdAt: string;
    isActive?: boolean;
}

interface PendingConversation {
    id: string;
    title: string;
    isLoading: boolean;
}

interface ConversationSidebarProps {
    workspaceName: string;
    conversations: Conversation[];
    activeConversationId?: string;
    pendingConversation?: PendingConversation | null;
    onNewChat: () => void;
    onSelectConversation: (conversationId: string) => void;
}

export const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
    workspaceName,
    conversations,
    activeConversationId,
    pendingConversation,
    onNewChat,
    onSelectConversation
}) => {
    const navigate = useNavigate();
    console.log('Rendering ConversationSidebar with conversations:', conversations);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col h-screen">
            {/* Header */}
            <div className="p-4 border-b border-slate-700">
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="text-slate-400 hover:text-slate-200 transition-colors duration-200"
                        title="Back to Dashboard"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <h2 className="text-lg font-semibold text-slate-100 truncate">{workspaceName}</h2>
                </div>
                
                {/* New Chat Button */}
                <button
                    onClick={onNewChat}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>New Chat</span>
                </button>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto p-2">
                {conversations.length === 0 && !pendingConversation ? (
                    <div className="text-center py-8">
                        <div className="text-slate-400 mb-2">
                            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <p className="text-sm text-slate-400">No conversations yet</p>
                        <p className="text-xs text-slate-500 mt-1">Start a new chat to begin</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {/* Pending Conversation */}
                        {pendingConversation && (
                            <div
                                className={`w-full text-left p-3 rounded-lg bg-slate-700 text-slate-100 border border-blue-500/30`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-medium truncate mb-1">
                                            {pendingConversation.title}
                                        </h4>
                                        <div className="flex items-center space-x-2">
                                            <div className="animate-spin h-3 w-3 border border-blue-400 rounded-full border-t-transparent"></div>
                                            <p className="text-xs text-blue-400">Creating conversation...</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Regular Conversations */}
                        {conversations.map((conversation) => (
                            <button
                                key={conversation.id}
                                onClick={() => onSelectConversation(conversation.id)}
                                className={`w-full text-left p-3 rounded-lg transition-colors duration-200 group ${
                                    activeConversationId === conversation.id
                                        ? 'bg-slate-700 text-slate-100'
                                        : 'text-slate-300 hover:bg-slate-700 hover:text-slate-100'
                                }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-medium truncate mb-1">
                                            {conversation.title}
                                        </h4>
                                        <p className="text-xs text-slate-400">
                                            {formatDate(conversation.createdAt)}
                                        </p>
                                    </div>
                                    <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                // Handle delete conversation
                                            }}
                                            className="text-slate-400 hover:text-red-400 transition-colors duration-200"
                                            title="Delete conversation"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-700">
                <div className="text-xs text-slate-400 text-center">
                    SQL Query Builder LLM
                </div>
            </div>
        </div>
    );
};
