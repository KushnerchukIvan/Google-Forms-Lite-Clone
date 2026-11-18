import {
  assertNever,
  FORM_LIMITS,
  isValidDate,
  type AnswerInput,
  type QuestionInput,
} from '@forms/shared';
import type { Form } from './domain.js';
import { inputError } from './errors.js';

const validateChoiceAnswer = (
  question: Form['questions'][number],
  answer: AnswerInput,
): void => {
  const allowed = new Set(question.options.map((option) => option.id));
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
  if (questions.length > FORM_LIMITS.questions) {
    throw inputError(
      `Forms can have at most ${String(FORM_LIMITS.questions)} questions.`,
    );
  }
  for (const question of questions) {
    if (!question.title.trim()) throw inputError('Question title is required.');
    if (question.title.trim().length > FORM_LIMITS.questionTitle) {
      throw inputError(
        `Question titles can be at most ${String(FORM_LIMITS.questionTitle)} characters.`,
      );
    }
    if (ids.has(question.id)) throw inputError('Question IDs must be unique.');
    ids.add(question.id);
    if (question.type === 'MULTIPLE_CHOICE' || question.type === 'CHECKBOX') {
      if (question.options.length < 2)
        throw inputError('Choice questions need at least two options.');
      if (question.options.length > FORM_LIMITS.optionsPerQuestion) {
        throw inputError(
          `Questions can have at most ${String(FORM_LIMITS.optionsPerQuestion)} options.`,
        );
      }
      const optionIds = question.options.map((option) => option.id);
      if (new Set(optionIds).size !== optionIds.length) {
        throw inputError('Option IDs must be unique.');
      }
      const labels = question.options.map((option) => option.label.trim());
      if (
        labels.some((label) => !label) ||
        labels.some((label) => label.length > FORM_LIMITS.optionLabel)
      ) {
        throw inputError(
          `Option labels must be non-empty and at most ${String(FORM_LIMITS.optionLabel)} characters.`,
        );
      }
      if (
        new Set(labels.map((label) => label.toLowerCase())).size !==
        labels.length
      ) {
        throw inputError('Option labels must be unique, ignoring case.');
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
        if (answer.value.some((value) => value.length > FORM_LIMITS.answerText)) {
          throw inputError(
            `Text answers can be at most ${String(FORM_LIMITS.answerText)} characters.`,
          );
        }
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
