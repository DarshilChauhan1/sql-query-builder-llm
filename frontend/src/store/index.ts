import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/auth.slice";
import { authService } from "./slices/auth.service";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        [authService.reducerPath]: authService.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST'],
            },
        }).concat(authService.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;