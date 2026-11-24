import { useGetFormsQuery } from '../api/enhanced';

export const useHomeForms = () => {
  const { data, isLoading, error, refetch } = useGetFormsQuery(undefined);
  const forms = (data?.forms ?? []).map((form) => ({
    ...form,
    questionCount: form.questions.length,
    createdDate: new Date(form.createdAt).toLocaleDateString(),
  }));

  return {
    forms,
    isLoading,
    error,
    refetch,
  };
};
