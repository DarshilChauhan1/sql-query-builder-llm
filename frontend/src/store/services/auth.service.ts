import { createApi } from "@reduxjs/toolkit/query/react";
import type { ResponseInterface } from "../../common/interfaces/ReponseInterface";
import { baseQueryWithAuth } from "../api/baseQuery";

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
    baseQuery: baseQueryWithAuth,
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