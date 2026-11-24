import {
  validateAnswerInput,
  validateFormInput as validateSharedFormInput,
  type AnswerInput,
  type QuestionInput,
} from '@forms/shared';
import type { Form } from './domain.js';
import { inputError } from './errors.js';

const throwFirstProblem = (
  problems: ReturnType<typeof validateSharedFormInput>,
): void => {
  const firstProblem = problems[0];
  if (firstProblem) throw inputError(firstProblem.message);
};

export const validateForm = (
  title: string,
  description: string | null | undefined,
  questions: readonly QuestionInput[],
): void => {
  throwFirstProblem(
    validateSharedFormInput({ title, description, questions }),
  );
};

export const validateQuestions = (
  questions: readonly QuestionInput[],
): void => {
  throwFirstProblem(
    validateSharedFormInput({ title: 'Valid title', questions }),
  );
};

export const validateAnswers = (
  form: Form,
  answers: readonly AnswerInput[],
): void => {
  throwFirstProblem(validateAnswerInput(form, answers));
};
