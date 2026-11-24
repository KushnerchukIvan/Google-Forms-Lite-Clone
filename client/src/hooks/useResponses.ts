import { useParams } from 'react-router-dom';
import { useGetFormQuery, useGetResponsesQuery } from '../api/enhanced';
import { getErrorMessage } from '../services/errors';
import { formatAnswer } from '../services/answers';

export const useResponses = () => {
  const { id = '' } = useParams();
  const formResult = useGetFormQuery({ id }, { skip: !id });
  const form = formResult.data?.form ?? null;
  const responsesResult = useGetResponsesQuery(
    { formId: id },
    { skip: !id || !form },
  );
  const responses = (responsesResult.data?.responses ?? []).map(
    (response, index) => ({
      ...response,
      label: `Response ${String(index + 1)}`,
      submittedDate: new Date(response.submittedAt).toLocaleString(),
      answers: (form?.questions ?? []).map((question) => {
        const answer = response.answers.find(
          (item) => item.questionId === question.id,
        );
        return {
          questionId: question.id,
          questionTitle: question.title,
          values: formatAnswer(question, answer?.value ?? []),
        };
      }),
    }),
  );
  const responseCountLabel = `${String(responses.length)} ${
    responses.length === 1 ? 'submission' : 'submissions'
  }`;

  return {
    form,
    responses,
    responseCountLabel,
    isLoading: formResult.isLoading || responsesResult.isLoading,
    formError: formResult.error,
    formErrorMessage: getErrorMessage(formResult.error),
    refetchForm: formResult.refetch,
    responsesError: responsesResult.error,
    responsesErrorMessage: getErrorMessage(responsesResult.error),
    refetchResponses: responsesResult.refetch,
  };
};
