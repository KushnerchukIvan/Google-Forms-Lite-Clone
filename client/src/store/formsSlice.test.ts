import { describe, expect, it } from 'vitest';
import { resetDraft, setDraft } from './formsSlice';
import formDraftReducer from './formsSlice';

describe('form draft state', () => {
  it('stores a draft and resets it after saving', () => {
    const draft = {
      title: 'Contact',
      description: 'Get in touch',
      questions: [
        {
          id: 'name',
          title: 'Name',
          type: 'TEXT' as const,
          required: true,
          options: [],
          order: 0,
        },
      ],
    };

    const updatedState = formDraftReducer(undefined, setDraft(draft));
    expect(updatedState).toEqual(draft);
    expect(formDraftReducer(updatedState, resetDraft())).toEqual({
      title: '',
      description: '',
      questions: [],
    });
  });
});
