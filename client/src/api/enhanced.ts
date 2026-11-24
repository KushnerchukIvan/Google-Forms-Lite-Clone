import type {
  CreateFormMutation,
  CreateFormMutationVariables,
  GetFormQuery,
  GetFormQueryVariables,
  GetFormsQuery,
  GetFormsQueryVariables,
  GetResponsesQuery,
  GetResponsesQueryVariables,
  SubmitResponseMutation,
  SubmitResponseMutationVariables,
} from './generated';
import CreateFormDocument from './operations/CreateForm.graphql?raw';
import GetFormDocument from './operations/GetForm.graphql?raw';
import GetFormsDocument from './operations/GetForms.graphql?raw';
import GetResponsesDocument from './operations/GetResponses.graphql?raw';
import SubmitResponseDocument from './operations/SubmitResponse.graphql?raw';
import { api as baseApi } from './baseApi';

const generatedApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    GetForms: build.query<GetFormsQuery, GetFormsQueryVariables>({
      query: (variables) => ({ document: GetFormsDocument, variables }),
    }),
    GetForm: build.query<GetFormQuery, GetFormQueryVariables>({
      query: (variables) => ({ document: GetFormDocument, variables }),
    }),
    GetResponses: build.query<GetResponsesQuery, GetResponsesQueryVariables>({
      query: (variables) => ({ document: GetResponsesDocument, variables }),
    }),
    CreateForm: build.mutation<CreateFormMutation, CreateFormMutationVariables>(
      {
        query: (variables) => ({ document: CreateFormDocument, variables }),
      },
    ),
    SubmitResponse: build.mutation<
      SubmitResponseMutation,
      SubmitResponseMutationVariables
    >({
      query: (variables) => ({ document: SubmitResponseDocument, variables }),
    }),
  }),
});

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
