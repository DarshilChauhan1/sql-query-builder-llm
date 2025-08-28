import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { ResponseInterface } from "../../common/interfaces/ReponseInterface";

export interface CreateWorkspaceRequest {
    name: string;
    description?: string;
    databaseUrl: string;
    dbType: 'postgres' | 'mysql' | 'mongodb';
}

export interface Workspace {
    id: string;
    name: string;
    description?: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
}

export interface WorkspaceDetailsResponse {
    workspace: Workspace;
    databaseConnection?: {
        id: string;
        workspaceId: string;
        schema: any;
        createdAt: string;
    };
}

export const workspaceService = createApi({
    reducerPath: 'workspaceApi',
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1',
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('accessToken');
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            headers.set('Content-Type', 'application/json');
            return headers;
        }
    }),
    tagTypes: ['Workspace'],
    endpoints: (builder) => ({
        createWorkspace: builder.mutation<ResponseInterface<Workspace>, CreateWorkspaceRequest>({
            query: (payload) => ({
                url: '/workspace/create',
                method: 'POST',
                body: payload,
            }),
            invalidatesTags: ['Workspace']
        }),
        getWorkspaces: builder.query<ResponseInterface<Workspace[]>, void>({
            query: () => ({
                url: '/workspace',
                method: 'GET',
            }),
            providesTags: ['Workspace']
        }),
        getWorkspace: builder.query<ResponseInterface<Workspace>, string>({
            query: (id) => ({
                url: `/workspace/${id}`,
                method: 'GET',
            }),
            providesTags: (_, __, id) => [{ type: 'Workspace', id }]
        }),
        updateWorkspace: builder.mutation<ResponseInterface<Workspace>, { id: string; data: Partial<CreateWorkspaceRequest> }>({
            query: ({ id, data }) => ({
                url: `/workspace/${id}`,
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: (_, __, { id }) => [{ type: 'Workspace', id }, 'Workspace']
        })
    })
});

export const { 
    useCreateWorkspaceMutation, 
    useGetWorkspacesQuery, 
    useGetWorkspaceQuery, 
    useUpdateWorkspaceMutation 
} = workspaceService;
