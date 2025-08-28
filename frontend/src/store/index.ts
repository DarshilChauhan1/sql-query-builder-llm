import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/auth.slice";
import { authService } from "./services/auth.service";
import { workspaceService } from "./services/workspace.service";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        [authService.reducerPath]: authService.reducer,
        [workspaceService.reducerPath]: workspaceService.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST'],
            },
        }).concat(authService.middleware, workspaceService.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;