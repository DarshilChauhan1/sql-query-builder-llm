import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { authService } from "./auth.service";

// Types
interface User {
    id: string;
    email: string;
    name: string;
    isVerified: boolean;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

// Initialize state with token validation
const getInitialState = (): AuthState => {
    const token = localStorage.getItem('token');
    
    let user: User | null = null;
    let isAuthenticated = false;

    return {
        user,
        token: isAuthenticated ? token : null,
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
        setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
            const { user, token } = action.payload;
            state.user = user;
            state.token = token;
            state.isAuthenticated = true;
            state.error = null;
            
            // Persist to localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('lastActivity', Date.now().toString());
        },

        // Clear credentials and logout
        clearCredentials: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.error = null;
            
            // Clear localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('lastActivity');
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
            .addMatcher(authService.endpoints.login.matchPending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addMatcher(authService.endpoints.login.matchFulfilled, (state, action) => {
                state.isLoading = false;
                
                // Check if login was successful
                if (action.payload.success && action.payload.data) {
                    const { user, token } = action.payload.data;
                    state.user = user;
                    state.token = token;
                    state.isAuthenticated = true;
                    state.error = null;
                    
                    // Persist to localStorage
                    localStorage.setItem('token', token);
                    localStorage.setItem('user', JSON.stringify(user));
                } else {
                    state.error = action.payload.message || 'Login failed';
                }
            })
            .addMatcher(authService.endpoints.login.matchRejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error?.message || 'Login failed. Please try again.';
                state.isAuthenticated = false;
                state.user = null;
                state.token = null;
            });
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
export const selectToken = (state: { auth: AuthState }) => state.auth.token;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;

