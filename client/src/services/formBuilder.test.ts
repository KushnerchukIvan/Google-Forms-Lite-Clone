import { FORM_LIMITS } from '@forms/shared';
import { describe, expect, it } from 'vitest';
import { createQuestion, validateDraft } from './formBuilder';
import type { FormDraft } from '../store/formsSlice';

describe('form builder utilities', () => {
  it('creates choice questions with two initial options', () => {
    expect(createQuestion('MULTIPLE_CHOICE').options).toHaveLength(2);
  });

  it('associates missing title and question errors with their fields', () => {
    const draft: FormDraft = { title: '', description: '', questions: [] };
    expect(validateDraft(draft)).toEqual({
      title: 'Enter a form title.',
      form: 'Add at least one question.',
      questions: {},
    });
  });

  it('enforces draft limits and case-insensitive option labels', () => {
    const choice = createQuestion('MULTIPLE_CHOICE');
    choice.title = 'Contact method';
    choice.options = choice.options.map((option, index) => ({
      ...option,
      label: index === 0 ? 'Email' : 'email',
    }));
    const errors = validateDraft({
      title: 'A'.repeat(FORM_LIMITS.formTitle + 1),
      description: '',
      questions: [choice],
    });
    expect(errors.title).toBe(
      `Form titles can be at most ${String(FORM_LIMITS.formTitle)} characters.`,
    );
    expect(errors.questions[choice.id]).toBe(
      'Choice options must be unique, ignoring case.',
    );
  });
});
