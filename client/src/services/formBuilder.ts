import { validateFormInput } from '@forms/shared';
import type { FormDraft, FormDraftQuestion } from '../store/formsSlice';

export interface DraftValidationErrors {
  title?: string;
  description?: string;
  form?: string;
  questions: Record<string, string>;
}

export const createQuestion = (
  type: FormDraftQuestion['type'],
): FormDraftQuestion => ({
  id: crypto.randomUUID(),
  title: '',
  type,
  required: false,
  options:
    type === 'MULTIPLE_CHOICE' || type === 'CHECKBOX'
      ? [
          { id: crypto.randomUUID(), label: 'Option 1' },
          { id: crypto.randomUUID(), label: 'Option 2' },
        ]
      : [],
});

export const validateDraft = (draft: FormDraft): DraftValidationErrors => {
  const errors: DraftValidationErrors = { questions: {} };
  for (const problem of validateFormInput(draft)) {
    if ('field' in problem.target) {
      switch (problem.target.field) {
        case 'title':
          errors.title ??= problem.message;
          break;
        case 'description':
          errors.description ??= problem.message;
          break;
        case 'questions':
          errors.form ??= problem.message;
          break;
      }
    } else {
      errors.questions[problem.target.questionId] ??= problem.message;
    }
  }
  return errors;
};

export const hasDraftValidationErrors = (
  errors: DraftValidationErrors,
): boolean =>
  Boolean(
    errors.title ||
    errors.description ||
    errors.form ||
    Object.keys(errors.questions).length,
  );
