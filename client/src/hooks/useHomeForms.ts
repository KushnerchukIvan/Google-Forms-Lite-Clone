import { useGetFormsQuery } from '../api/enhanced';
import { getErrorMessage } from '../services/errors';

export const useHomeForms = () => {
  const { data, isLoading, error, refetch } = useGetFormsQuery({});
  const forms = (data?.forms ?? []).map((form) => ({
    ...form,
    questionCount: form.questions.length,
    createdDate: new Date(form.createdAt).toLocaleDateString(),
  }));

  return {
    forms,
    isLoading,
    errorMessage: getErrorMessage(error),
    refetch,
  };
};
