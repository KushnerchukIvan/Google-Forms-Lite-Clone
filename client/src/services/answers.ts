import type { AnswerInput } from '@forms/shared';
import { validateAnswerInput } from '@forms/shared';
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
  for (const problem of validateAnswerInput(form, toAnswerInputs(values))) {
    if (!('questionId' in problem.target)) continue;
    errors[problem.target.questionId] ??= problem.message;
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
