import { describe, expect, it } from 'vitest';
import { createQuestion, validateDraft } from './formBuilder';
import type { FormDraft } from '../store/formsSlice';

describe('form builder utilities', () => {
  it('creates choice questions with two initial options', () => {
    expect(createQuestion('MULTIPLE_CHOICE').options).toHaveLength(2);
  });

  it('requires a title and at least one question', () => {
    const draft: FormDraft = { title: '', description: '', questions: [] };
    expect(validateDraft(draft)).toBe('Enter a form title.');
  });
});
