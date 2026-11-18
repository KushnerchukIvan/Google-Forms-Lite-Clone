import { describe, expect, it } from 'vitest';
import type { Form } from './domain.js';
import { validateAnswers, validateQuestions } from './validation.js';

const form: Form = {
  id: 'form-1',
  title: 'Test',
  description: '',
  createdAt: '2026-01-01T00:00:00.000Z',
  questions: [
    {
      id: 'q1',
      title: 'Name',
      type: 'TEXT',
      required: true,
      options: [],
      order: 0,
    },
    {
      id: 'q2',
      title: 'Date',
      type: 'DATE',
      required: false,
      options: [],
      order: 1,
    },
  ],
};

describe('validateAnswers', () => {
  it('accepts valid answers', () => {
    expect(() => {
      validateAnswers(form, [{ questionId: 'q1', value: ['Ada'] }]);
    }).not.toThrow();
  });

  it('rejects missing required answers', () => {
    expect(() => {
      validateAnswers(form, []);
    }).toThrow('"Name" is required.');
  });

  it('rejects invalid dates', () => {
    expect(() => {
      validateAnswers(form, [
        { questionId: 'q1', value: ['Ada'] },
        { questionId: 'q2', value: ['2026-02-31'] },
      ]);
    }).toThrow('Date answers must use YYYY-MM-DD format.');
  });

  it('accepts choice answers by option ID', () => {
    const choiceForm: Form = {
      ...form,
      questions: [
        ...form.questions,
        {
          id: 'q3',
          title: 'Choice',
          type: 'MULTIPLE_CHOICE',
          required: false,
          options: [
            { id: 'option-1', label: 'First' },
            { id: 'option-2', label: 'Second' },
          ],
          order: 2,
        },
      ],
    };

    expect(() => {
      validateAnswers(choiceForm, [
        { questionId: 'q1', value: ['Ada'] },
        { questionId: 'q3', value: ['option-2'] },
      ]);
    }).not.toThrow();
  });
});

describe('validateQuestions', () => {
  it('rejects duplicate option IDs', () => {
    expect(() => {
      validateQuestions([
        {
          id: 'choice',
          title: 'Choice',
          type: 'MULTIPLE_CHOICE',
          required: false,
          options: [
            { id: 'duplicate', label: 'First' },
            { id: 'duplicate', label: 'Second' },
          ],
          order: 0,
        },
      ]);
    }).toThrow('Option IDs must be unique.');
  });
});
