import type { AnswerInput } from '@forms/shared';
import type { GetFormQuery } from '../api/generated';

type FormData = NonNullable<GetFormQuery['form']>;

const isValidDate = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
};

export const validateResponse = (
  form: FormData,
  values: Record<string, string[]>,
): string | null => {
  for (const question of form.questions) {
    const answer = values[question.id] ?? [];
    const nonEmptyAnswers = answer.filter((value) => value.trim());
    if (question.required && nonEmptyAnswers.length === 0)
      return `“${question.title}” is required.`;
    if (question.type !== 'CHECKBOX' && nonEmptyAnswers.length > 1) {
      return `"${question.title}" accepts one answer.`;
    }
    if (
      question.type === 'DATE' &&
      nonEmptyAnswers.length === 1 &&
      !isValidDate(nonEmptyAnswers[0] ?? '')
    ) {
      return 'Enter a valid date.';
    }
    if (question.type === 'MULTIPLE_CHOICE' || question.type === 'CHECKBOX') {
      const options = new Set(question.options.map((option) => option.label));
      if (nonEmptyAnswers.some((value) => !options.has(value))) {
        return `"${question.title}" contains an invalid option.`;
      }
      if (new Set(nonEmptyAnswers).size !== nonEmptyAnswers.length) {
        return `"${question.title}" contains duplicate options.`;
      }
    }
  }
  return null;
};

export const toAnswerInputs = (
  values: Record<string, string[]>,
): AnswerInput[] =>
  Object.entries(values)
    .map(([questionId, value]) => ({
      questionId,
      value: value.filter((answer) => answer.trim()),
    }))
    .filter((answer) => answer.value.length > 0);
