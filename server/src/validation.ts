import {
  assertNever,
  type AnswerInput,
  type QuestionInput,
} from '@forms/shared';
import type { Form } from './domain.js';
import { inputError } from './errors.js';

const isValidDate = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
};

const validateChoiceAnswer = (
  question: Form['questions'][number],
  answer: AnswerInput,
): void => {
  const allowed = new Set(question.options.map((option) => option.label));
  if (answer.value.some((value) => !allowed.has(value))) {
    throw inputError(
      `An answer for "${question.title}" is not one of its options.`,
    );
  }
  if (new Set(answer.value).size !== answer.value.length) {
    throw inputError('Duplicate option values are not allowed.');
  }
};

export const validateQuestions = (
  questions: readonly QuestionInput[],
): void => {
  const ids = new Set<string>();
  for (const question of questions) {
    if (!question.title.trim()) throw inputError('Question title is required.');
    if (ids.has(question.id)) throw inputError('Question IDs must be unique.');
    ids.add(question.id);
    if (question.type === 'MULTIPLE_CHOICE' || question.type === 'CHECKBOX') {
      if (question.options.length < 2)
        throw inputError('Choice questions need at least two options.');
      const labels = question.options.map((option) => option.label.trim());
      if (
        labels.some((label) => !label) ||
        new Set(labels).size !== labels.length
      ) {
        throw inputError('Options must be non-empty and unique.');
      }
    } else if (question.options.length > 0) {
      throw inputError('Only choice questions can have options.');
    }
  }
};

export const validateAnswers = (
  form: Form,
  answers: readonly AnswerInput[],
): void => {
  const questionById = new Map(
    form.questions.map((question) => [question.id, question]),
  );
  const submittedIds = new Set<string>();

  for (const answer of answers) {
    const question = questionById.get(answer.questionId);
    if (!question)
      throw inputError('An answer references a question outside this form.');
    if (submittedIds.has(answer.questionId))
      throw inputError('Each question can be answered only once.');
    submittedIds.add(answer.questionId);
    if (question.required && answer.value.every((value) => !value.trim())) {
      throw inputError(`"${question.title}" is required.`);
    }
    if (answer.value.some((value) => !value.trim()))
      throw inputError('Answers cannot contain empty values.');
    switch (question.type) {
      case 'TEXT':
        if (answer.value.length > 1)
          throw inputError('Text questions accept one value.');
        break;
      case 'MULTIPLE_CHOICE':
        if (answer.value.length > 1)
          throw inputError('Multiple choice questions accept one value.');
        validateChoiceAnswer(question, answer);
        break;
      case 'CHECKBOX':
        if (answer.value.length > question.options.length)
          throw inputError('Too many checkbox values were submitted.');
        validateChoiceAnswer(question, answer);
        break;
      case 'DATE':
        if (answer.value.length !== 1 || !isValidDate(answer.value[0] ?? '')) {
          throw inputError('Date answers must use YYYY-MM-DD format.');
        }
        break;
      default:
        assertNever(question.type);
    }
  }

  for (const question of form.questions) {
    if (question.required && !submittedIds.has(question.id)) {
      throw inputError(`"${question.title}" is required.`);
    }
  }
};
