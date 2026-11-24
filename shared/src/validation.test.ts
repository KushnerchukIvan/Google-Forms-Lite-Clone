import { describe, expect, it } from 'vitest';
import type { Form, QuestionInput } from './generated/graphql.js';
import { FORM_LIMITS } from './limits.js';
import { validateAnswerInput, validateFormInput } from './validation.js';

const question = (
  id: string,
  type: QuestionInput['type'] = 'TEXT',
  options: QuestionInput['options'] = [],
): QuestionInput => ({
  id,
  title: 'Question',
  type,
  required: false,
  options,
  order: 0,
});

const form: Form = {
  id: 'form-1',
  title: 'Test',
  description: '',
  createdAt: '2026-01-01T00:00:00.000Z',
  questions: [
    { ...question('name'), title: 'Name', required: true },
    question('date', 'DATE'),
    question('choice', 'MULTIPLE_CHOICE', [
      { id: 'one', label: 'One' },
      { id: 'two', label: 'Two' },
    ]),
  ],
};

describe('validateFormInput', () => {
  it('accepts a draft question without order', () => {
    expect(
      validateFormInput({
        title: 'Contact',
        description: '',
        questions: [question('name')],
      }),
    ).toEqual([]);
  });

  it('requires a title and at least one question', () => {
    expect(
      validateFormInput({ title: '  ', questions: [] }),
    ).toEqual([
      { target: { field: 'title' }, message: 'Enter a form title.' },
      { target: { field: 'questions' }, message: 'Add at least one question.' },
    ]);
  });

  it('validates form and question lengths and counts', () => {
    const problems = validateFormInput({
      title: 'T'.repeat(FORM_LIMITS.formTitle + 1),
      description: 'D'.repeat(FORM_LIMITS.description + 1),
      questions: Array.from(
        { length: FORM_LIMITS.questions + 1 },
        (_, index) => question(`question-${String(index)}`),
      ),
    });

    expect(problems).toContainEqual({
      target: { field: 'title' },
      message: `Form titles can be at most ${String(FORM_LIMITS.formTitle)} characters.`,
    });
    expect(problems).toContainEqual({
      target: { field: 'description' },
      message: `Descriptions can be at most ${String(FORM_LIMITS.description)} characters.`,
    });
    expect(problems).toContainEqual({
      target: { field: 'questions' },
      message: `Forms can have at most ${String(FORM_LIMITS.questions)} questions.`,
    });
  });

  it('checks duplicate IDs and invalid choice option labels', () => {
    const problems = validateFormInput({
      title: 'Contact',
      questions: [
        question('same'),
        question('same'),
        question('choice', 'CHECKBOX', [
          { id: 'duplicate', label: 'Email' },
          { id: 'duplicate', label: 'email' },
          { id: 'long', label: 'x'.repeat(FORM_LIMITS.optionLabel + 1) },
        ]),
      ],
    });

    expect(problems).toContainEqual({
      target: { questionId: 'same' },
      message: 'Question IDs must be unique.',
    });
    expect(problems).toContainEqual({
      target: { questionId: 'choice' },
      message: 'Option IDs must be unique.',
    });
    expect(problems).toContainEqual({
      target: { questionId: 'choice' },
      message: 'Choice options must be unique, ignoring case.',
    });
    expect(problems).toContainEqual({
      target: { questionId: 'choice' },
      message: `Option labels can be at most ${String(FORM_LIMITS.optionLabel)} characters.`,
    });
  });

  it('does not allow choice options for non-choice questions', () => {
    expect(
      validateFormInput({
        title: 'Contact',
        questions: [
          question('text', 'TEXT', [{ id: 'option', label: 'Option' }]),
        ],
      }),
    ).toContainEqual({
      target: { questionId: 'text' },
      message: 'Only choice questions can have options.',
    });
  });
});

describe('validateAnswerInput', () => {
  it('accepts valid answers and rejects missing required answers', () => {
    expect(
      validateAnswerInput(form, [
        { questionId: 'name', value: ['Ada'] },
        { questionId: 'choice', value: ['one'] },
      ]),
    ).toEqual([]);
    expect(validateAnswerInput(form, [])).toContainEqual({
      target: { questionId: 'name' },
      message: '“Name” is required.',
    });
  });

  it('validates answer size, date, and cardinality', () => {
    const problems = validateAnswerInput(form, [
      {
        questionId: 'name',
        value: ['A'.repeat(FORM_LIMITS.answerText + 1), 'extra'],
      },
      { questionId: 'date', value: ['2026-02-31'] },
    ]);

    expect(problems).toContainEqual({
      target: { questionId: 'name' },
      message: 'Text questions accept one value.',
    });
    expect(problems).toContainEqual({
      target: { questionId: 'name' },
      message: `Text answers can be at most ${String(FORM_LIMITS.answerText)} characters.`,
    });
    expect(problems).toContainEqual({
      target: { questionId: 'date' },
      message: 'Date answers must use YYYY-MM-DD format.',
    });
  });

  it('rejects unknown, duplicate, and invalid choice answers', () => {
    const problems = validateAnswerInput(form, [
      { questionId: 'outside', value: ['answer'] },
      { questionId: 'choice', value: ['bad', 'bad'] },
      { questionId: 'choice', value: ['one'] },
    ]);

    expect(problems).toContainEqual({
      target: { questionId: 'outside' },
      message: 'An answer references a question outside this form.',
    });
    expect(problems).toContainEqual({
      target: { questionId: 'choice' },
      message: 'An answer for "Question" is not one of its options.',
    });
    expect(problems).toContainEqual({
      target: { questionId: 'choice' },
      message: 'Duplicate option values are not allowed.',
    });
    expect(problems).toContainEqual({
      target: { questionId: 'choice' },
      message: 'Each question can be answered only once.',
    });
  });
});
