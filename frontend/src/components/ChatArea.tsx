import React, { useState, useRef, useEffect } from 'react';
import { useCreateConversationMutation } from '../store/services/chat.service';

interface Messages {
    id: string;
    role: 'user' | 'assistant';
    userQuery: string;
    assistantResponse?: string;
    sqlQuery?: string;
    queryResult?: string;
    createdAt: string;
}

interface ChatAreaProps {
    messages: Messages[];
    isLoading?: boolean;
    onSendMessage: (message: string) => void;
    conversationTitle?: string;
    pendingUserMessage?: string | null;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
    messages,
    isLoading,
    onSendMessage,
    conversationTitle,
    pendingUserMessage
}) => {
    console.log('Messages in ChatArea:', messages);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');

        try {
            // Call the parent's onSendMessage which will handle:
            // 1. Create conversation if needed
            // 2. Start streaming
            // 3. Display user message immediately
            await onSendMessage(userMessage);
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const adjustTextareaHeight = (textarea: HTMLTextAreaElement) => {
        textarea.style.height = 'auto';
        const scrollHeight = textarea.scrollHeight;
        const maxHeight = 200; // Max height in pixels
        textarea.style.height = Math.min(scrollHeight, maxHeight) + 'px';
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
        adjustTextareaHeight(e.target);
    };


    const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Pending User Message Component
    const PendingUserMessage: React.FC<{ message: string }> = ({ message }) => (
        <div className="flex justify-end mb-6">
            <div className="flex items-start space-x-3 max-w-3xl">
                <div className="flex-1 text-right">
                    <div className="inline-block p-4 rounded-2xl bg-blue-600/80 text-white shadow-lg border border-blue-500/30">
                        <div className="whitespace-pre-wrap break-words font-medium">
                            {message}
                        </div>
                    </div>
                    <div className="text-xs text-blue-400 mt-2 text-right flex items-center justify-end space-x-1">
                        <div className="animate-spin h-3 w-3 border border-blue-400 rounded-full border-t-transparent"></div>
                        <span>Sending...</span>
                    </div>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>
            </div>
        </div>
    );

    // User Message Component
    const UserMessage: React.FC<{ message: Messages }> = ({ message }) => (
        <div className="flex justify-end mb-6">
            <div className="flex items-start space-x-3 max-w-3xl">
                <div className="flex-1 text-right">
                    <div className="inline-block p-4 rounded-2xl bg-blue-600 text-white shadow-lg">
                        <div className="whitespace-pre-wrap break-words font-medium">
                            {message.userQuery}
                        </div>
                    </div>
                    <div className="text-xs text-slate-400 mt-2 text-right">
                        {formatTime(message.createdAt)}
                    </div>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>
            </div>
        </div>
    );

    // Assistant Message Component
    const AssistantMessage: React.FC<{ message: Messages }> = ({ message }) => (
        <div className="flex justify-start mb-6">
            <div className="flex items-start space-x-4 max-w-4xl">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>
                <div className="flex-1">
                    {message.assistantResponse && (
                        <div className="bg-slate-700/80 backdrop-blur-sm border border-slate-600/50 rounded-2xl p-5 shadow-xl">
                            <div className="whitespace-pre-wrap break-words text-slate-100 leading-relaxed">
                                {message.assistantResponse}
                            </div>

                            {/* SQL Query Display */}
                            {message.sqlQuery && (
                                <div className="mt-4 p-4 bg-slate-800/60 rounded-xl border border-slate-600/30">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                        <span className="text-sm font-medium text-blue-400">SQL Query</span>
                                    </div>
                                    <pre className="text-sm text-slate-300 bg-slate-900/50 p-3 rounded-lg overflow-x-auto">
                                        <code>{message.sqlQuery}</code>
                                    </pre>
                                </div>
                            )}

                            {/* Query Results Display */}
                            {message.queryResult && (
                                <div className="mt-4 p-4 bg-slate-800/60 rounded-xl border border-slate-600/30">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                        <span className="text-sm font-medium text-green-400">Query Results</span>
                                    </div>
                                    <div className="text-sm text-slate-300 bg-slate-900/50 p-3 rounded-lg overflow-x-auto max-h-48 overflow-y-auto">
                                        <pre><code>{message.queryResult}</code></pre>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    <div className="text-xs text-slate-400 mt-2 flex items-center space-x-2">
                        <span>{formatTime(message.createdAt)}</span>
                        {message.sqlQuery && (
                            <span className="flex items-center space-x-1">
                                <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                                <span>SQL executed</span>
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    // Loading Component
    const LoadingMessage: React.FC = () => (
        <div className="flex justify-start mb-6">
            <div className="flex items-start space-x-4 max-w-4xl">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                    <svg className="w-6 h-6 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>
                <div className="flex-1">
                    <div className="bg-slate-700/80 backdrop-blur-sm border border-slate-600/50 rounded-2xl p-5 shadow-xl">
                        <div className="flex items-center space-x-3">
                            <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                            <span className="text-sm text-slate-300 font-medium">Analyzing your query...</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex-1 flex flex-col h-screen">
            {/* Chat Header */}
            {conversationTitle && (
                <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
                    <h1 className="text-xl font-semibold text-slate-100">{conversationTitle}</h1>
                </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="text-slate-400 mb-4">
                                <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-slate-200 mb-2">Start a conversation</h3>
                            <p className="text-slate-400 max-w-md mx-auto">
                                Ask questions about your database, generate SQL queries, or get insights about your data.
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        {messages.map((message) => (
                            <div key={message.id}>
                                {message.userQuery && (
                                    <UserMessage message={message} />
                                )}
                                {message.assistantResponse && (
                                    <AssistantMessage message={message} />
                                )}
                            </div>
                        ))}
                        {pendingUserMessage && (
                            <PendingUserMessage message={pendingUserMessage} />
                        )}
                        {isLoading && <LoadingMessage />}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Input Area */}
            <div className="border-t border-slate-700 bg-slate-800 p-4">
                <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
                    <div className="relative">
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask about your database, request SQL queries, or analyze your data..."
                            disabled={isLoading}
                            className="w-full px-4 py-1 pr-10 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50"
                            style={{ minHeight: '50px' }}
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className="absolute right-2 bottom-4.5 p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
