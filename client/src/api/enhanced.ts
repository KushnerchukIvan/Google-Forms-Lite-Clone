import { api as generatedApi } from './generated';

export const api = generatedApi.enhanceEndpoints({
  addTagTypes: ['Forms', 'Form', 'Responses'],
  endpoints: {
    GetForms: {
      providesTags: ['Forms'],
    },
    GetForm: {
      providesTags: (_result, _error, arg) => [{ type: 'Form', id: arg.id }],
    },
    GetResponses: {
      providesTags: (_result, _error, arg) => [
        { type: 'Responses', id: arg.formId },
      ],
    },
    CreateForm: {
      invalidatesTags: ['Forms'],
    },
    SubmitResponse: {
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Responses', id: arg.formId },
      ],
    },
  },
});

export const {
  useGetFormsQuery,
  useGetFormQuery,
  useGetResponsesQuery,
  useCreateFormMutation,
  useSubmitResponseMutation,
} = api;
