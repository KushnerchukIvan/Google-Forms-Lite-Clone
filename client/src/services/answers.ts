import type { AnswerInput } from '@forms/shared';
import { isValidDate } from '@forms/shared';
import type { GetFormQuery } from '../api/generated';

type FormData = NonNullable<GetFormQuery['form']>;

export const formatAnswer = (
  question: FormData['questions'][number],
  values: readonly string[],
): string[] => {
  if (question.type !== 'MULTIPLE_CHOICE' && question.type !== 'CHECKBOX') {
    return [...values];
  }
  const labelsById = new Map(
    question.options.map((option) => [option.id, option.label]),
  );
  return values.map((value) => labelsById.get(value) ?? value);
};

export const validateResponse = (
  form: FormData,
  values: Record<string, string[]>,
): Record<string, string> => {
  const errors: Record<string, string> = {};
  for (const question of form.questions) {
    const answer = values[question.id] ?? [];
    const nonEmptyAnswers = answer.filter((value) => value.trim());
    if (question.required && nonEmptyAnswers.length === 0) {
      errors[question.id] = `“${question.title}” is required.`;
      continue;
    }
    if (question.type !== 'CHECKBOX' && nonEmptyAnswers.length > 1) {
      errors[question.id] = `"${question.title}" accepts one answer.`;
      continue;
    }
    if (
      question.type === 'DATE' &&
      nonEmptyAnswers.length === 1 &&
      !isValidDate(nonEmptyAnswers[0] ?? '')
    ) {
      errors[question.id] = 'Enter a valid date.';
      continue;
    }
    if (question.type === 'MULTIPLE_CHOICE' || question.type === 'CHECKBOX') {
      const options = new Set(question.options.map((option) => option.id));
      if (nonEmptyAnswers.some((value) => !options.has(value))) {
        errors[question.id] = `"${question.title}" contains an invalid option.`;
        continue;
      }
      if (new Set(nonEmptyAnswers).size !== nonEmptyAnswers.length) {
        errors[question.id] = `"${question.title}" contains duplicate options.`;
      }
    }
  }
  return errors;
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
