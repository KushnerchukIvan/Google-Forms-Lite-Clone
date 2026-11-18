type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never;
    };
import type * as Types from '../../../shared/src/generated/graphql';

import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
import { api } from './baseApi';
export type GetFormsQueryVariables = Exact<{ [key: string]: never }>;

export type GetFormsQuery = {
  forms: Array<{
    id: string;
    title: string;
    description: string;
    createdAt: string;
    questions: Array<{
      id: string;
      title: string;
      type: Types.QuestionType;
      required: boolean;
      order: number;
      options: Array<{ id: string; label: string }>;
    }>;
  }>;
};

export type GetFormQueryVariables = Exact<{
  id: string;
}>;

export type GetFormQuery = {
  form: {
    id: string;
    title: string;
    description: string;
    createdAt: string;
    questions: Array<{
      id: string;
      title: string;
      type: Types.QuestionType;
      required: boolean;
      order: number;
      options: Array<{ id: string; label: string }>;
    }>;
  } | null;
};

export type GetResponsesQueryVariables = Exact<{
  formId: string;
}>;

export type GetResponsesQuery = {
  responses: Array<{
    id: string;
    formId: string;
    submittedAt: string;
    answers: Array<{ questionId: string; value: Array<string> }>;
  }>;
};

export type CreateFormMutationVariables = Exact<{
  title: string;
  description?: string | null | undefined;
  questions: Array<Types.QuestionInput> | Types.QuestionInput;
}>;

export type CreateFormMutation = {
  createForm: {
    id: string;
    title: string;
    description: string;
    createdAt: string;
    questions: Array<{
      id: string;
      title: string;
      type: Types.QuestionType;
      required: boolean;
      order: number;
      options: Array<{ id: string; label: string }>;
    }>;
  };
};

export type SubmitResponseMutationVariables = Exact<{
  formId: string;
  answers: Array<Types.AnswerInput> | Types.AnswerInput;
}>;

export type SubmitResponseMutation = {
  submitResponse: {
    id: string;
    formId: string;
    submittedAt: string;
    answers: Array<{ questionId: string; value: Array<string> }>;
  };
};

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<
    DocumentTypeDecoration<TResult, TVariables>['__apiType']
  >;
  private value: string;
  public __meta__: Record<string, unknown> | undefined;

  constructor(value: string, __meta__?: Record<string, unknown>) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
  }

  override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}

export const GetFormsDocument = new TypedDocumentString(`
    query GetForms {
  forms {
    id
    title
    description
    createdAt
    questions {
      id
      title
      type
      required
      order
      options {
        id
        label
      }
    }
  }
}
    `);
export const GetFormDocument = new TypedDocumentString(`
    query GetForm($id: ID!) {
  form(id: $id) {
    id
    title
    description
    createdAt
    questions {
      id
      title
      type
      required
      order
      options {
        id
        label
      }
    }
  }
}
    `);
export const GetResponsesDocument = new TypedDocumentString(`
    query GetResponses($formId: ID!) {
  responses(formId: $formId) {
    id
    formId
    submittedAt
    answers {
      questionId
      value
    }
  }
}
    `);
export const CreateFormDocument = new TypedDocumentString(`
    mutation CreateForm($title: String!, $description: String, $questions: [QuestionInput!]!) {
  createForm(title: $title, description: $description, questions: $questions) {
    id
    title
    description
    createdAt
    questions {
      id
      title
      type
      required
      order
      options {
        id
        label
      }
    }
  }
}
    `);
export const SubmitResponseDocument = new TypedDocumentString(`
    mutation SubmitResponse($formId: ID!, $answers: [AnswerInput!]!) {
  submitResponse(formId: $formId, answers: $answers) {
    id
    formId
    submittedAt
    answers {
      questionId
      value
    }
  }
}
    `);

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    GetForms: build.query<GetFormsQuery, GetFormsQueryVariables | undefined>({
      query: (variables) => ({
        document: GetFormsDocument.toString(),
        variables,
      }),
    }),
    GetForm: build.query<GetFormQuery, GetFormQueryVariables>({
      query: (variables) => ({
        document: GetFormDocument.toString(),
        variables,
      }),
    }),
    GetResponses: build.query<GetResponsesQuery, GetResponsesQueryVariables>({
      query: (variables) => ({
        document: GetResponsesDocument.toString(),
        variables,
      }),
    }),
    CreateForm: build.mutation<CreateFormMutation, CreateFormMutationVariables>(
      {
        query: (variables) => ({
          document: CreateFormDocument.toString(),
          variables,
        }),
      },
    ),
    SubmitResponse: build.mutation<
      SubmitResponseMutation,
      SubmitResponseMutationVariables
    >({
      query: (variables) => ({
        document: SubmitResponseDocument.toString(),
        variables,
      }),
    }),
  }),
});

export { injectedRtkApi as api };
export const {
  useGetFormsQuery,
  useLazyGetFormsQuery,
  useGetFormQuery,
  useLazyGetFormQuery,
  useGetResponsesQuery,
  useLazyGetResponsesQuery,
  useCreateFormMutation,
  useSubmitResponseMutation,
} = injectedRtkApi;
