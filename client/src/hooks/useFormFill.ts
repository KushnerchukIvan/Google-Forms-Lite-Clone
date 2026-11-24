import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGetFormQuery, useSubmitResponseMutation } from '../api/enhanced';
import { getErrorMessage } from '../services/errors';
import { toAnswerInputs, validateResponse } from '../services/answers';

export const useFormFill = () => {
  const { id = '' } = useParams();
  const formResult = useGetFormQuery({ id }, { skip: !id });
  const form = formResult.data?.form ?? null;
  const [values, setValues] = useState<Record<string, string[]>>({});
  const [submitResponse, responseResult] = useSubmitResponseMutation();
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const setValue = (questionId: string, value: string[]) => {
    setValues((current) => ({ ...current, [questionId]: value }));
    setValidationErrors((current) => {
      if (!current[questionId]) return current;
      return Object.fromEntries(
        Object.entries(current).filter(([id]) => id !== questionId),
      );
    });
  };

  const submit = async () => {
    if (!form) return;
    const validation = validateResponse(form, values);
    setValidationErrors(validation);
    if (Object.keys(validation).length > 0) return;
    await submitResponse({
      formId: form.id,
      answers: toAnswerInputs(values),
    });
  };

  const submitAnotherResponse = () => {
    responseResult.reset();
    setValues({});
    setValidationErrors({});
  };

  return {
    form,
    values,
    validationErrors,
    isLoading: formResult.isLoading,
    loadError: formResult.error,
    loadErrorMessage: getErrorMessage(formResult.error),
    refetch: formResult.refetch,
    isSubmitted: responseResult.isSuccess,
    isSubmitting: responseResult.isLoading,
    submitErrorMessage: getErrorMessage(responseResult.error),
    setValue,
    submit,
    submitAnotherResponse,
  };
};
