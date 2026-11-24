import { describe, expect, it } from 'vitest';
import type { GetFormQuery } from '../api/generated';
import { formatAnswer, toAnswerInputs, validateResponse } from './answers';

type FormData = NonNullable<GetFormQuery['form']>;

const form: FormData = {
  id: 'form-1',
  title: 'Example',
  description: '',
  createdAt: '2026-01-01T00:00:00.000Z',
  questions: [
    {
      id: 'date',
      title: 'Date',
      type: 'DATE',
      required: false,
      order: 0,
      options: [],
    },
    {
      id: 'choice',
      title: 'Choice',
      type: 'MULTIPLE_CHOICE',
      required: false,
      order: 1,
      options: [{ id: 'one', label: 'One' }],
    },
  ],
};

describe('answer transformations', () => {
  it('omits blank optional answers', () => {
    expect(
      toAnswerInputs({ first: [''], second: ['hello'], third: [] }),
    ).toEqual([{ questionId: 'second', value: ['hello'] }]);
  });

  it('omits blank values while keeping non-empty answers', () => {
    expect(toAnswerInputs({ question: ['', 'hello'] })).toEqual([
      { questionId: 'question', value: ['hello'] },
    ]);
  });

  it('rejects calendar-invalid date answers', () => {
    expect(validateResponse(form, { date: ['2026-02-31'] })).toEqual({
      date: 'Date answers must use YYYY-MM-DD format.',
    });
  });

  it('rejects choices that do not belong to the question', () => {
    expect(validateResponse(form, { choice: ['other-id'] })).toEqual({
      choice: 'An answer for "Choice" is not one of its options.',
    });
  });

  it('uses option IDs for choice answers and formats them with labels', () => {
    const choice = form.questions.find((question) => question.id === 'choice');
    if (!choice) throw new Error('Expected choice question fixture.');

    expect(validateResponse(form, { choice: ['one'] })).toEqual({});
    expect(formatAnswer(choice, ['one'])).toEqual(['One']);
    expect(formatAnswer(choice, ['unknown'])).toEqual(['unknown']);
  });
});
