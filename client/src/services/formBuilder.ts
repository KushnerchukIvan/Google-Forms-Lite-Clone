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

export const moveQuestion = (
  questions: FormDraftQuestion[],
  index: number,
  direction: -1 | 1,
): FormDraftQuestion[] => {
  const target = index + direction;
  if (target < 0 || target >= questions.length) return questions;
  const next = [...questions];
  const current = next[index];
  const destination = next[target];
  if (!current || !destination) return questions;
  next[index] = destination;
  next[target] = current;
  return next;
};

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
      const labels = question.options.map((option) => option.label.trim());
      if (new Set(labels).size !== labels.length)
        return 'Choice options must be unique.';
    }
  }
  return null;
};
