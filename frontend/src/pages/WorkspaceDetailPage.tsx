import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetWorkspaceQuery } from '../store/services/workspace.service';
import {
    useGetConversationsQuery,
    useCreateConversationMutation,
    useGetMessagesMutation
} from '../store/services/chat.service';
import { ConversationSidebar } from '../components/ConversationSidebar';
import { ChatArea } from '../components/ChatArea';
import { useAuthRequired } from '../hooks/useAuthRequired';

export const WorkspaceDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [activeConversationId, setActiveConversationId] = useState<string | undefined>();
    // Define the Messages interface locally to match ChatArea
    interface Messages {
        id: string;
        role: 'user' | 'assistant';
        userQuery: string;
        assistantResponse?: string;
        sqlQuery?: string;
        queryResult?: string;
        createdAt: string;
    }

    const [messages, setMessages] = useState<Messages[]>([]);
    const [isLoadingMessage, setIsLoadingMessage] = useState(false);
    const [pendingConversation, setPendingConversation] = useState<{
        id: string;
        title: string;
        isLoading: boolean;
    } | null>(null);
    const [pendingUserMessage, setPendingUserMessage] = useState<string | null>(null);
    const [getMessages] = useGetMessagesMutation();
    const [createConversation] = useCreateConversationMutation();

    // Auth protection
    useAuthRequired();

    // API hooks
    const { data: workspaceResponse, isLoading: workspaceLoading, error: workspaceError } = useGetWorkspaceQuery(id!);
    const { data: conversationsResponse } = useGetConversationsQuery(id!, { skip: !id });

    const workspace = workspaceResponse?.data;
    const conversations = conversationsResponse?.data || [];
    console.log('Conversations:', conversations);

    // Just render the empty state if no conversations exist
    const handleNewChat = async () => {
        try {
            setActiveConversationId(undefined);
            setMessages([]);
        } catch (error) {
            console.error('Failed to create conversation:', error);
        }
    };

    const handleSelectConversation = (conversationId: string) => {
        setActiveConversationId(conversationId);
    };

    const handleSendMessage = async (content: string) => {
        let conversationId = activeConversationId;
        
        try {
            setIsLoadingMessage(true);

            // Step 1: Create conversation if it doesn't exist
            if (!conversationId) {
                // Show pending user message immediately
                setPendingUserMessage(content);
                
                // Create a temporary pending conversation to show in sidebar immediately
                const tempId = `temp-${Date.now()}`;
                const tempTitle = content.length > 30 ? content.substring(0, 30) + '...' : content;
                
                setPendingConversation({
                    id: tempId,
                    title: tempTitle,
                    isLoading: true
                });

                // set the temp message as active
                setMessages(prev => [...prev, {
                    id: tempId,
                    role: 'user',
                    userQuery: content,
                    createdAt: new Date().toISOString()
                }]);

                setActiveConversationId(tempId);
                console.log('Creating temporary conversation:', tempId);

                // Create the actual conversation
                console.log('Creating new conversation with prompt:', content);
                const result = await createConversation({ 
                    workspaceId: id!, 
                    prompt: content 
                }).unwrap();
                
                conversationId = result.data.conversationId;
                
                // Update with real conversation data and clear pending states
                setPendingConversation(null);
                setPendingUserMessage(null);
                setActiveConversationId(conversationId);
                console.log('New conversation created:', conversationId);
            }

            // Step 2: Add user message to local state immediately
            const userMessage: Messages = {
                id: Date.now().toString(),
                role: 'user',
                userQuery: content,
                createdAt: new Date().toISOString()
            };

            setMessages(prev => [...prev, userMessage]);
            console.log('User message added to UI:', userMessage);

            // Step 3: Simulate AI response (replace with streaming later)
            setTimeout(() => {
                const aiMessage: Messages = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    userQuery: '', // Empty for assistant messages
                    assistantResponse: `I understand you're asking about: "${content}". Let me help you generate the appropriate SQL query for your database schema.`,
                    createdAt: new Date().toISOString()
                };

                setMessages(prev => [...prev, aiMessage]);
                setIsLoadingMessage(false);
                console.log('AI response added:', aiMessage);
            }, 1500);

        } catch (error) {
            console.error('Failed to send message:', error);
            setIsLoadingMessage(false);
        }
    };

    // whenever the activeConversationId changes, fetch its messages
    useEffect(() => {
        const fetchMessages = async () => {
            if (activeConversationId) {
                try {
                    const response = await getMessages(activeConversationId).unwrap();
                    setMessages(response.data);
                } catch (error) {
                    console.error('Failed to fetch messages:', error);
                }
            } else {
                setMessages([]);
            }
        };

        fetchMessages();
    }, [activeConversationId, getMessages]);

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
                pendingConversation={pendingConversation}
                onNewChat={handleNewChat}
                onSelectConversation={handleSelectConversation}
            />

            {/* Main Chat Area */}
            <ChatArea
                messages={messages}
                isLoading={isLoadingMessage}
                onSendMessage={handleSendMessage}
                conversationTitle={activeConversation?.title}
                pendingUserMessage={pendingUserMessage}
            />
        </div>
    );
};
