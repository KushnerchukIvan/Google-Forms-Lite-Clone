import type { FormDraft, FormDraftQuestion } from '../store/formsSlice';

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

export const validateDraft = (draft: FormDraft): string | null => {
  if (!draft.title.trim()) return 'Enter a form title.';
  if (draft.questions.length === 0) return 'Add at least one question.';
  for (const question of draft.questions) {
    if (!question.title.trim()) return 'Every question needs a title.';
    if (
      (question.type === 'MULTIPLE_CHOICE' || question.type === 'CHECKBOX') &&
      (question.options.length < 2 ||
        question.options.some((option) => !option.label.trim()))
    ) {
      return 'Choice questions need at least two non-empty options.';
    }
    if (question.type === 'MULTIPLE_CHOICE' || question.type === 'CHECKBOX') {
      const optionIds = question.options.map((option) => option.id);
      if (new Set(optionIds).size !== optionIds.length)
        return 'Choice option IDs must be unique.';
      const labels = question.options.map((option) => option.label.trim());
      if (new Set(labels).size !== labels.length)
        return 'Choice options must be unique.';
    }
  }
  return null;
};
