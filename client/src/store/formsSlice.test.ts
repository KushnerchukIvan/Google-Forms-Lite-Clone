import { describe, expect, it } from 'vitest';
import {
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
} from './formsSlice';
import formDraftReducer from './formsSlice';

describe('form draft state', () => {
  it('applies independent draft updates and resets after saving', () => {
    const firstQuestion = {
      id: 'first',
      title: 'First',
      type: 'TEXT' as const,
      required: false,
      options: [],
    };
    const secondQuestion = {
      id: 'second',
      title: 'Second',
      type: 'MULTIPLE_CHOICE' as const,
      required: false,
      options: [
        { id: 'option-1', label: 'One' },
        { id: 'option-2', label: 'Two' },
      ],
    };

    let state = formDraftReducer(undefined, setTitle('Contact'));
    state = formDraftReducer(state, setDescription('Get in touch'));
    state = formDraftReducer(state, addQuestion(firstQuestion));
    state = formDraftReducer(state, addQuestion(secondQuestion));
    state = formDraftReducer(
      state,
      updateQuestion({ id: 'first', changes: { title: 'Name' } }),
    );
    state = formDraftReducer(
      state,
      updateQuestion({ id: 'first', changes: { required: true } }),
    );
    state = formDraftReducer(
      state,
      updateOption({
        questionId: 'second',
        optionId: 'option-1',
        label: 'Updated',
      }),
    );
    state = formDraftReducer(
      state,
      addOption({
        questionId: 'second',
        option: { id: 'option-3', label: 'Three' },
      }),
    );
    state = formDraftReducer(
      state,
      removeOption({ questionId: 'second', optionId: 'option-2' }),
    );
    state = formDraftReducer(
      state,
      moveQuestion({ id: 'second', direction: -1 }),
    );

    expect(state.title).toBe('Contact');
    expect(state.description).toBe('Get in touch');
    expect(state.questions.map((question) => question.id)).toEqual([
      'second',
      'first',
    ]);
    expect(state.questions[1]).toMatchObject({
      title: 'Name',
      required: true,
    });
    expect(state.questions[0]?.options).toEqual([
      { id: 'option-1', label: 'Updated' },
      { id: 'option-3', label: 'Three' },
    ]);

    state = formDraftReducer(state, removeQuestion('first'));
    expect(state.questions.map((question) => question.id)).toEqual(['second']);
    expect(formDraftReducer(state, resetDraft())).toEqual({
      title: '',
      description: '',
      questions: [],
    });
  });
});
