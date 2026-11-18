import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { QuestionInput } from '@forms/shared';

export type FormDraftQuestion = Omit<QuestionInput, 'order'>;
type DraftOption = FormDraftQuestion['options'][number];

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
    setTitle: (state, action: PayloadAction<string>) => {
      state.title = action.payload;
    },
    setDescription: (state, action: PayloadAction<string>) => {
      state.description = action.payload;
    },
    addQuestion: (state, action: PayloadAction<FormDraftQuestion>) => {
      state.questions.push(action.payload);
    },
    updateQuestion: (
      state,
      action: PayloadAction<{
        id: string;
        changes: Partial<Omit<FormDraftQuestion, 'id'>>;
      }>,
    ) => {
      const question = state.questions.find(
        (item) => item.id === action.payload.id,
      );
      if (question) Object.assign(question, action.payload.changes);
    },
    removeQuestion: (state, action: PayloadAction<string>) => {
      state.questions = state.questions.filter(
        (question) => question.id !== action.payload,
      );
    },
    moveQuestion: (
      state,
      action: PayloadAction<{ id: string; direction: -1 | 1 }>,
    ) => {
      const index = state.questions.findIndex(
        (question) => question.id === action.payload.id,
      );
      const target = index + action.payload.direction;
      if (index < 0 || target < 0 || target >= state.questions.length) return;
      const current = state.questions[index];
      const destination = state.questions[target];
      if (!current || !destination) return;
      state.questions[index] = destination;
      state.questions[target] = current;
    },
    addOption: (
      state,
      action: PayloadAction<{ questionId: string; option: DraftOption }>,
    ) => {
      const question = state.questions.find(
        (item) => item.id === action.payload.questionId,
      );
      if (question) question.options.push(action.payload.option);
    },
    updateOption: (
      state,
      action: PayloadAction<{
        questionId: string;
        optionId: string;
        label: string;
      }>,
    ) => {
      const question = state.questions.find(
        (item) => item.id === action.payload.questionId,
      );
      const option = question?.options.find(
        (item) => item.id === action.payload.optionId,
      );
      if (option) option.label = action.payload.label;
    },
    removeOption: (
      state,
      action: PayloadAction<{ questionId: string; optionId: string }>,
    ) => {
      const question = state.questions.find(
        (item) => item.id === action.payload.questionId,
      );
      if (question) {
        question.options = question.options.filter(
          (item) => item.id !== action.payload.optionId,
        );
      }
    },
    resetDraft: () => initialState,
  },
});

export const {
  addOption,
  addQuestion,
  moveQuestion,
  removeOption,
  removeQuestion,
  resetDraft,
  setDescription,
  setTitle,
  updateOption,
  updateQuestion,
} = formDraftSlice.actions;
export default formDraftSlice.reducer;
