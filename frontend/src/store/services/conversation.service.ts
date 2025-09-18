import { createApi } from "@reduxjs/toolkit/query/react";
import type { ResponseInterface } from "../../common/interfaces/ReponseInterface";
import { baseQueryWithAuth } from "../api/baseQuery";

export interface CreateConversationRequest {
    workspaceId: string;
    prompt?: string;
}

export interface SendMessageRequest {
    conversationId: string;
    content: string;
    role: 'user' | 'assistant';
}

export interface Message {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: string;
    conversationId: string;
}

export interface Conversation {
    id: string;
    title: string;
    workspaceId: string;
    createdAt: string;
    updatedAt: string;
    messages?: Message[];
}

export interface CreateConversationResponse {
    conversationId: string;
    title: string;
    prompt: string;
}

export const conversationService = createApi({
    reducerPath: 'conversationApi',
    baseQuery: baseQueryWithAuth,
    tagTypes: ['Conversation', 'Message'],
    endpoints: (builder) => ({
        getConversations: builder.query<ResponseInterface<Conversation[]>, string>({
            query: (workspaceId) => ({
                url: `/conversations?workspaceId=${workspaceId}`,
                method: 'GET',
            }),
            providesTags: ['Conversation']
        }),
        getConversation: builder.query<ResponseInterface<Conversation>, string>({
            query: (conversationId) => ({
                url: `/conversations/${conversationId}`,
                method: 'GET',
            }),
            providesTags: (_, __, id) => [{ type: 'Conversation', id }]
        }),
        createConversation: builder.mutation<ResponseInterface<CreateConversationResponse>, CreateConversationRequest>({
            query: (payload) => ({
                url: '/conversations/create',
                method: 'POST',
                body: payload,
            }),
            invalidatesTags: ['Conversation']
        }),
        sendMessage: builder.mutation<ResponseInterface<Message>, SendMessageRequest>({
            query: (payload) => ({
                url: '/conversations/message',
                method: 'POST',
                body: payload,
            }),
            invalidatesTags: (_, __, { conversationId }) => [
                { type: 'Conversation', id: conversationId },
                'Message'
            ]
        }),
        deleteConversation: builder.mutation<ResponseInterface<void>, string>({
            query: (conversationId) => ({
                url: `/conversations/${conversationId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Conversation']
        })
    })
});

export const {
    useGetConversationsQuery,
    useGetConversationQuery,
    useCreateConversationMutation,
    useSendMessageMutation,
    useDeleteConversationMutation
} = conversationService;
