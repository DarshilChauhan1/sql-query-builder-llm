import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { clearCredentials } from "../slices/auth.slice";
import { toast } from "../../contexts/ToastContext";

const baseQuery = fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1',
    prepareHeaders: (headers) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
        headers.set('Content-Type', 'application/json');
        return headers;
    }
});

export const baseQueryWithAuth: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
> = async (args, api, extraOptions) => {
    const result = await baseQuery(args, api, extraOptions);

    // Handle different error scenarios
    if (result.error) {
        const status = result.error.status;
        const errorData = result.error.data as any;

        // Extract error message from response
        let errorMessage = 'An unexpected error occurred';
        
        if (errorData) {
            // Check for common error response formats
            if (typeof errorData === 'string') {
                errorMessage = errorData;
            } else if (errorData.message) {
                errorMessage = errorData.message;
            } else if (errorData.error) {
                errorMessage = errorData.error;
            } else if (Array.isArray(errorData.message)) {
                // Handle validation errors array
                errorMessage = errorData.message.join(', ');
            }
        }

        // Handle 401 Unauthorized
        if (status === 401) {
            // Clear all authentication data from localStorage
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            localStorage.setItem('isAuthenticated', 'false');
            localStorage.removeItem('lastActivity');
            
            // Dispatch logout action to update Redux state
            api.dispatch(clearCredentials());
            
            // Show session expired toast
            toast.warning('Your session has expired. Please log in again.');
            
            // Redirect to login page
            window.location.href = '/login';
            return result;
        }

        // Handle other error status codes (except 200, 201, 204)
        if (status && ![200, 201, 204].includes(status as number)) {
            // Show error toast for different status codes
            switch (status) {
                case 400:
                    toast.error(errorMessage || 'Bad request. Please check your input.');
                    break;
                case 403:
                    toast.error(errorMessage || 'Access denied. You don\'t have permission to perform this action.');
                    break;
                case 404:
                    toast.error(errorMessage || 'The requested resource was not found.');
                    break;
                case 409:
                    toast.error(errorMessage || 'Conflict. The resource already exists or is in use.');
                    break;
                case 422:
                    toast.error(errorMessage || 'Validation failed. Please check your input.');
                    break;
                case 429:
                    toast.error('Too many requests. Please wait before trying again.');
                    break;
                case 500:
                    toast.error('Server error. Please try again later.');
                    break;
                case 502:
                    toast.error('Bad gateway. The server is temporarily unavailable.');
                    break;
                case 503:
                    toast.error('Service unavailable. Please try again later.');
                    break;
                default:
                    // For any other error status codes
                    if (typeof status === 'number' && status >= 400) {
                        toast.error(errorMessage);
                    }
                    break;
            }
        }

        // Handle network errors (FETCH_ERROR, PARSING_ERROR, etc.)
        if (status === 'FETCH_ERROR') {
            toast.error('Network error. Please check your internet connection.');
        } else if (status === 'PARSING_ERROR') {
            toast.error('Invalid server response. Please try again.');
        } else if (status === 'TIMEOUT_ERROR') {
            toast.error('Request timed out. Please try again.');
        }
    }

    return result;
};
