import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetWorkspaceQuery } from '../store/services/workspace.service';
import { 
    useGetConversationsQuery, 
    useCreateConversationMutation, 
    useSendMessageMutation,
    type Message 
} from '../store/services/conversation.service';
import { ConversationSidebar } from '../components/ConversationSidebar';
import { ChatArea } from '../components/ChatArea';
import { useAuthRequired } from '../hooks/useAuthRequired';

export const WorkspaceDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [activeConversationId, setActiveConversationId] = useState<string | undefined>();
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoadingMessage, setIsLoadingMessage] = useState(false);

    // Auth protection
    useAuthRequired();

    // API hooks
    const { data: workspaceResponse, isLoading: workspaceLoading, error: workspaceError } = useGetWorkspaceQuery(id!);
    console.log('WorkspaceDetailPage render, workspaceId:', workspaceResponse?.data);
    const { data: conversationsResponse } = useGetConversationsQuery(id!, { skip: !id });
    console.log('ConversationsResponse:', conversationsResponse);
    const [createConversation] = useCreateConversationMutation();
    
    const workspace = workspaceResponse?.data;
    const conversations = conversationsResponse?.data || [];

    // Auto-select first conversation or create one if none exist
    useEffect(() => {
        if (conversations.length > 0 && !activeConversationId) {
            setActiveConversationId(conversations[0].id);
        }
    }, [conversations, activeConversationId]);

    // Load messages when conversation changes
    useEffect(() => {
        if (activeConversationId) {
            const conversation = conversations.find(c => c.id === activeConversationId);
            if (conversation?.messages) {
                setMessages(conversation.messages);
            } else {
                setMessages([]);
            }
        }
    }, [activeConversationId, conversations]);

    const handleNewChat = async () => {
        try {
            const result = await createConversation({
                workspaceId: id!,
            }).unwrap();
            
            setActiveConversationId(result.data.id);
            setMessages([]);
        } catch (error) {
            console.error('Failed to create conversation:', error);
        }
    };

    const handleSelectConversation = (conversationId: string) => {
        setActiveConversationId(conversationId);
    };

    const handleSendMessage = async (content: string) => {
        if (!activeConversationId) {
            // Create a new conversation if none exists
            await handleNewChat();
            return;
        }

        try {
            setIsLoadingMessage(true);
            
            // Add user message to local state immediately
            const userMessage: Message = {
                id: Date.now().toString(),
                content,
                role: 'user',
                timestamp: new Date().toISOString(),
                conversationId: activeConversationId
            };
            
            setMessages(prev => [...prev, userMessage]);

            // Send message to backend
            await sendMessage({
                conversationId: activeConversationId,
                content,
                role: 'user'
            }).unwrap();

            // Simulate AI response (replace with actual API call)
            setTimeout(() => {
                const aiMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    content: `I understand you're asking about: "${content}". Let me help you generate the appropriate SQL query for your database schema.`,
                    role: 'assistant',
                    timestamp: new Date().toISOString(),
                    conversationId: activeConversationId
                };
                
                setMessages(prev => [...prev, aiMessage]);
                setIsLoadingMessage(false);
            }, 1500);

        } catch (error) {
            console.error('Failed to send message:', error);
            setIsLoadingMessage(false);
        }
    };

    if (workspaceLoading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (workspaceError || !workspace) {
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

    const activeConversation = conversations.find(c => c.id === activeConversationId);

    return (
        <div className="h-screen bg-slate-900 flex overflow-hidden">\
            {/* Conversation Sidebar */}
            <ConversationSidebar
                workspaceName={workspace.name}
                conversations={conversations.map(c => ({
                    id: c.id,
                    title: c.title,
                    createdAt: c.createdAt,
                    isActive: c.id === activeConversationId
                }))}
                activeConversationId={activeConversationId}
                onNewChat={handleNewChat}
                onSelectConversation={handleSelectConversation}
            />

            {/* Main Chat Area */}
            <ChatArea
                messages={messages}
                isLoading={isLoadingMessage}
                onSendMessage={handleSendMessage}
                conversationTitle={activeConversation?.title}
            />
        </div>
    );
};
