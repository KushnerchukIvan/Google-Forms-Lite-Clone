import { configureStore } from '@reduxjs/toolkit';
import { api } from '../api/baseApi';
import formDraftReducer from './formsSlice';

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    formDraft: formDraftReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
