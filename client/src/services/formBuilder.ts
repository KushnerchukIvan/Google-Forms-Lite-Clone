import { FORM_LIMITS } from '@forms/shared';
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
  const title = draft.title.trim();
  if (!title) {
    errors.title = 'Enter a form title.';
  } else if (title.length > FORM_LIMITS.formTitle) {
    errors.title = `Form titles can be at most ${String(FORM_LIMITS.formTitle)} characters.`;
  }
  if (draft.description.length > FORM_LIMITS.description) {
    errors.description = `Descriptions can be at most ${String(FORM_LIMITS.description)} characters.`;
  }
  if (draft.questions.length === 0) {
    errors.form = 'Add at least one question.';
  } else if (draft.questions.length > FORM_LIMITS.questions) {
    errors.form = `Forms can have at most ${String(FORM_LIMITS.questions)} questions.`;
  }

  for (const question of draft.questions) {
    const title = question.title.trim();
    if (!title) {
      errors.questions[question.id] = 'Every question needs a title.';
      continue;
    }
    if (title.length > FORM_LIMITS.questionTitle) {
      errors.questions[question.id] =
        `Question titles can be at most ${String(FORM_LIMITS.questionTitle)} characters.`;
      continue;
    }
    if (
      (question.type === 'MULTIPLE_CHOICE' || question.type === 'CHECKBOX') &&
      question.options.length < 2
    ) {
      errors.questions[question.id] =
        'Choice questions need at least two options.';
      continue;
    }
    if (question.type === 'MULTIPLE_CHOICE' || question.type === 'CHECKBOX') {
      if (question.options.length > FORM_LIMITS.optionsPerQuestion) {
        errors.questions[question.id] =
          `Questions can have at most ${String(FORM_LIMITS.optionsPerQuestion)} options.`;
        continue;
      }
      const optionIds = question.options.map((option) => option.id);
      if (new Set(optionIds).size !== optionIds.length) {
        errors.questions[question.id] = 'Choice option IDs must be unique.';
        continue;
      }
      const labels = question.options.map((option) => option.label.trim());
      if (labels.some((label) => !label)) {
        errors.questions[question.id] = 'Choice options need non-empty labels.';
        continue;
      }
      if (labels.some((label) => label.length > FORM_LIMITS.optionLabel)) {
        errors.questions[question.id] =
          `Option labels can be at most ${String(FORM_LIMITS.optionLabel)} characters.`;
        continue;
      }
      if (
        new Set(labels.map((label) => label.toLowerCase())).size !==
        labels.length
      ) {
        errors.questions[question.id] =
          'Choice options must be unique, ignoring case.';
      }
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
