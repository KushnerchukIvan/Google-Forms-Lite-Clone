import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { QuestionInput } from '@forms/shared';

export type FormDraftQuestion = Omit<QuestionInput, 'order'>;

export interface FormDraft {
  title: string;
  description: string;
  questions: FormDraftQuestion[];
}

const initialState: FormDraft = { title: '', description: '', questions: [] };

const formDraftSlice = createSlice({
  name: 'formDraft',
  initialState,
  reducers: {
    setDraft: (_state, action: PayloadAction<FormDraft>) => action.payload,
    resetDraft: () => initialState,
  },
});

export const { setDraft, resetDraft } = formDraftSlice.actions;
export default formDraftSlice.reducer;
