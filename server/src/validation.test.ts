import { FORM_LIMITS } from '@forms/shared';
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

  it('enforces the text answer length limit', () => {
    expect(() => {
      validateAnswers(form, [
        { questionId: 'q1', value: ['A'.repeat(FORM_LIMITS.answerText)] },
      ]);
    }).not.toThrow();

    expect(() => {
      validateAnswers(form, [
        {
          questionId: 'q1',
          value: ['A'.repeat(FORM_LIMITS.answerText + 1)],
        },
      ]);
    }).toThrow(
      `Text answers can be at most ${String(FORM_LIMITS.answerText)} characters.`,
    );
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

  it('rejects option labels that differ only by case', () => {
    expect(() => {
      validateQuestions([
        {
          id: 'choice',
          title: 'Choice',
          type: 'MULTIPLE_CHOICE',
          required: false,
          options: [
            { id: 'option-1', label: 'Email' },
            { id: 'option-2', label: 'email' },
          ],
          order: 0,
        },
      ]);
    }).toThrow('Option labels must be unique, ignoring case.');
  });

  it('enforces question and option limits', () => {
    expect(() => {
      validateQuestions(
        Array.from({ length: FORM_LIMITS.questions + 1 }, (_, index) => ({
          id: `question-${String(index)}`,
          title: 'Question',
          type: 'TEXT' as const,
          required: false,
          options: [],
          order: index,
        })),
      );
    }).toThrow(`Forms can have at most ${String(FORM_LIMITS.questions)} questions.`);

    expect(() => {
      validateQuestions([
        {
          id: 'choice',
          title: 'Choice',
          type: 'MULTIPLE_CHOICE',
          required: false,
          options: Array.from(
            { length: FORM_LIMITS.optionsPerQuestion + 1 },
            (_, index) => ({
              id: `option-${String(index)}`,
              label: `Option ${String(index)}`,
            }),
          ),
          order: 0,
        },
      ]);
    }).toThrow(
      `Questions can have at most ${String(FORM_LIMITS.optionsPerQuestion)} options.`,
    );
  });

  it('enforces question and option label lengths', () => {
    expect(() => {
      validateQuestions([
        {
          id: 'question',
          title: 'Q'.repeat(FORM_LIMITS.questionTitle + 1),
          type: 'TEXT',
          required: false,
          options: [],
          order: 0,
        },
      ]);
    }).toThrow(
      `Question titles can be at most ${String(FORM_LIMITS.questionTitle)} characters.`,
    );

    expect(() => {
      validateQuestions([
        {
          id: 'choice',
          title: 'Choice',
          type: 'MULTIPLE_CHOICE',
          required: false,
          options: [
            { id: 'option-1', label: 'A'.repeat(FORM_LIMITS.optionLabel + 1) },
            { id: 'option-2', label: 'Second' },
          ],
          order: 0,
        },
      ]);
    }).toThrow(
      `Option labels must be non-empty and at most ${String(FORM_LIMITS.optionLabel)} characters.`,
    );
  });
});
