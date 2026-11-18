import { describe, expect, it } from 'vitest';
import { createQuestion, moveQuestion, validateDraft } from './formBuilder';
import type { FormDraft } from '../store/formsSlice';

describe('form builder utilities', () => {
  it('creates choice questions with two initial options', () => {
    expect(createQuestion('MULTIPLE_CHOICE').options).toHaveLength(2);
  });

  it('moves questions without mutating the source array', () => {
    const questions = [createQuestion('TEXT'), createQuestion('DATE')];
    const moved = moveQuestion(questions, 0, 1);
    expect(moved[0]?.type).toBe('DATE');
    expect(questions[0]?.type).toBe('TEXT');
  });

  it('requires a title and at least one question', () => {
    const draft: FormDraft = { title: '', description: '', questions: [] };
    expect(validateDraft(draft)).toBe('Enter a form title.');
  });
});
