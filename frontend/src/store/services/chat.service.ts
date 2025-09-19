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

export interface GetMessagesRequest{
    conversationId: string;
}

export interface GetMessagesResponse{
    id : string;
    role : 'user' | 'assistant';
    userQuery : string;
    assistantResponse? : string;
    sqlQuery? : string;
    queryResult? : string;
    createdAt : string;
}

export const conversationService = createApi({
    reducerPath: 'conversationApi',
    baseQuery: baseQueryWithAuth,
    tagTypes: ['Chat', 'Message'],
    endpoints: (builder) => ({
        getConversations: builder.query<ResponseInterface<Conversation[]>, string>({
            query: (workspaceId) => ({
                url: `/chat/get-conversations/${workspaceId}`,
                method: 'GET',
            }),
            providesTags: ['Chat']
        }),
        createConversation: builder.mutation<ResponseInterface<CreateConversationResponse>, CreateConversationRequest>({
            query: (payload) => ({
                url: '/chat/create',
                method: 'POST',
                body: payload,
            }),
            invalidatesTags: ['Chat']
        }),
        sendMessage: builder.mutation<ResponseInterface<Message>, SendMessageRequest>({
            query: (payload) => ({
                url: '/conversations/message',
                method: 'POST',
                body: payload,
            }),
            invalidatesTags: (_, __, { conversationId }) => [
                { type: 'Chat', id: conversationId },
                'Message'
            ]
        }),
        deleteConversation: builder.mutation<ResponseInterface<void>, string>({
            query: (conversationId) => ({
                url: `/chat/${conversationId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Chat']
        }),
        getMessages : builder.mutation<ResponseInterface<GetMessagesResponse[]>, string>({
            query : (conversationId) => ({
                url : `/chat/get-messages/${conversationId}`,
                method : 'GET',
            }),
            invalidatesTags : ['Message']
        })
    })
});

export const {
    useGetConversationsQuery,
    useCreateConversationMutation,
    useSendMessageMutation,
    useDeleteConversationMutation,
    useGetMessagesMutation
} = conversationService;
