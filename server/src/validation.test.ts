import { describe, expect, it } from 'vitest';
import type { Form } from './domain.js';
import { validateAnswers } from './validation.js';

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
});
