import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { authService } from "../services/auth.service";

// Types
interface User {
    id: string;
    email: string;
    name: string;
    isVerified: boolean;
}

interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

// Initialize state with token validation
const getInitialState = (): AuthState => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const userString = localStorage.getItem('user');
    
    let user: User | null = null;
    let isAuthenticated = false;

    if (accessToken && userString) {
        try {
            user = JSON.parse(userString);
            isAuthenticated = true;
        } catch (error) {
            // Invalid user data, clear storage
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
        }
    }

    return {
        user,
        accessToken: isAuthenticated ? accessToken : null,
        refreshToken: isAuthenticated ? refreshToken : null,
        isAuthenticated,
        isLoading: false,
        error: null
    };
};

const initialState: AuthState = getInitialState();

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // Set user credentials
        setCredentials: (state, action: PayloadAction<{ user: User; token: {
            accessToken: string;
            refreshToken: string;
        } }>) => {
            const { user, token } = action.payload;
            state.user = user;
            state.accessToken = token.accessToken;
            state.refreshToken = token.refreshToken;
            state.isAuthenticated = true;
            state.error = null;
            
            // Persist to localStorage
            localStorage.setItem('accessToken', token.accessToken);
            localStorage.setItem('refreshToken', token.refreshToken);
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('lastActivity', Date.now().toString());
        },

        // Clear credentials and logout
        clearCredentials: (state) => {
            state.user = null;
            state.accessToken = null;
            state.refreshToken = null;
            state.isAuthenticated = false;
            state.error = null;
            
            // Clear localStorage
            localStorage.removeItem('user');
            localStorage.removeItem('lastActivity');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
        },

        // Update user profile
        updateUser: (state, action: PayloadAction<Partial<User>>) => {
            if (state.user) {
                state.user = { ...state.user, ...action.payload };
                localStorage.setItem('user', JSON.stringify(state.user));
            }
        },
        // Set loading state
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },

        // Set error
        setError: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
            state.isLoading = false;
        },
    },
    extraReducers: (builder) => {
        // Handle login states
        builder
            .addMatcher(authService.endpoints.verifyEmail.matchFulfilled, (state, action) => {
                state.isLoading = false;
                
                // Check if verification was successful
                if (action.payload.success && action.payload.data) {
                    const { token, user } = action.payload.data;
                    state.user = user;
                    state.accessToken = token.accessToken;
                    state.refreshToken = token.refreshToken;
                    state.error = null;
                    state.isAuthenticated = true;
                    // Persist to localStorage
                    localStorage.setItem('accessToken', token.accessToken);
                    localStorage.setItem('refreshToken', token.refreshToken);
                    localStorage.setItem('user', JSON.stringify(user));
                } else {
                    state.error = action.payload.message || 'Verification failed';
                }
            })
    },
});

export const {
    setCredentials,
    clearCredentials,
    updateUser,
    setLoading,
    setError,
} = authSlice.actions;

export default authSlice.reducer;

// Selectors
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectAccessToken = (state: { auth: AuthState }) => state.auth.accessToken;
export const selectRefreshToken = (state: { auth: AuthState }) => state.auth.refreshToken;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;

