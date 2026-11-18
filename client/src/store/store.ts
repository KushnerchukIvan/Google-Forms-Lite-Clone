import { configureStore } from '@reduxjs/toolkit';
import { api } from '../api/enhanced';
import formDraftReducer from './formsSlice';

export const createAppStore = () =>
  configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
      formDraft: formDraftReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(api.middleware),
  });

export const store = createAppStore();

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
