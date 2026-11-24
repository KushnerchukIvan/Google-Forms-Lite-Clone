import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateFormMutation } from '../api/enhanced';
import {
  createQuestion,
  hasDraftValidationErrors,
  validateDraft,
  type DraftValidationErrors,
} from '../services/formBuilder';
import { getErrorMessage } from '../services/errors';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  addOption,
  addQuestion,
  moveQuestion,
  removeOption,
  removeQuestion,
  resetDraft,
  setDescription,
  setTitle,
  updateOption,
  updateQuestion,
} from '../store/formsSlice';

export const useFormBuilder = () => {
  const draft = useAppSelector((state) => state.formDraft);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [createForm, { isLoading, error }] = useCreateFormMutation();
  const [validationErrors, setValidationErrors] =
    useState<DraftValidationErrors | null>(null);

  const save = async () => {
    const validation = validateDraft(draft);
    setValidationErrors(validation);
    if (hasDraftValidationErrors(validation)) return;

    const result = await createForm({
      title: draft.title,
      description: draft.description,
      questions: draft.questions.map((question, order) => ({
        ...question,
        order,
      })),
    });

    if ('error' in result) return;

    dispatch(resetDraft());
    void navigate(`/forms/${result.data.createForm.id}/fill`);
  };

  return {
    draft,
    validationErrors,
    isLoading,
    errorMessage: getErrorMessage(error),
    setTitle: (value: string) => dispatch(setTitle(value)),
    setDescription: (value: string) => dispatch(setDescription(value)),
    addQuestion: (type: Parameters<typeof createQuestion>[0]) =>
      dispatch(addQuestion(createQuestion(type))),
    updateQuestion: (
      id: string,
      changes: Parameters<typeof updateQuestion>[0]['changes'],
    ) => dispatch(updateQuestion({ id, changes })),
    addOption: (
      questionId: string,
      option: Parameters<typeof addOption>[0]['option'],
    ) => dispatch(addOption({ questionId, option })),
    updateOption: (questionId: string, optionId: string, label: string) =>
      dispatch(updateOption({ questionId, optionId, label })),
    removeOption: (questionId: string, optionId: string) =>
      dispatch(removeOption({ questionId, optionId })),
    removeQuestion: (id: string) => dispatch(removeQuestion(id)),
    moveQuestion: (id: string, direction: -1 | 1) =>
      dispatch(moveQuestion({ id, direction })),
    save,
  };
};
