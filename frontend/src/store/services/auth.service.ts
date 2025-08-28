import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { ResponseInterface } from "../../common/interfaces/ReponseInterface";

interface AuthLoginRequest {
    email: string;
    password: string;
}

interface User {
    id: string;
    name: string;
    email: string;
    isVerified?: boolean;
}

interface AuthLoginResponse {
    user: User;
    token: {
        accessToken: string;
        refreshToken: string;
    };
}

interface RegisterDataResponse {
    email: string,
    hash: string,
    otpExpiry: string
}

interface VerifyEmailRequest {
    otp: string,
    name: string,
    hash: string,
    otpExpiry: string,
    email: string,
    password: string
}


export const authService = createApi({
    reducerPath: 'authApi',
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
    tagTypes: ['Auth'],
    endpoints: (builder) => ({
        login: builder.mutation<ResponseInterface<AuthLoginResponse>, AuthLoginRequest>({
            query: (payload) => ({
                url: '/auth/login',
                method: 'POST',
                body: payload,
            }),
            invalidatesTags: ['Auth']
        }),
        register: builder.mutation<ResponseInterface<RegisterDataResponse>, { email: string; }>({
            query: (payload) => ({
                url: '/auth/sign-up',
                method: 'POST',
                body: payload,
            }),
            invalidatesTags: ['Auth']
        }),
        verifyEmail: builder.mutation<ResponseInterface<AuthLoginResponse>, VerifyEmailRequest>({
            query: (payload) => ({
                url: '/auth/verify-email',
                method: 'POST',
                body: payload
            })
        })
    })
});

export const { useLoginMutation, useRegisterMutation, useVerifyEmailMutation } = authService;