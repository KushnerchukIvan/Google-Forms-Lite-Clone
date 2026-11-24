/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never;
    };
import type * as Types from '../../../shared/src/generated/graphql';

import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
import { api } from './baseApi';
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

export type GetFormsQueryVariables = Exact<{ [key: string]: never }>;

export type GetFormsQuery = {
  forms: Array<{
    id: string;
    title: string;
    description: string;
    createdAt: string;
    questions: Array<{ id: string }>;
  }>;
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
  public __meta__?: Record<string, any> | undefined;

  constructor(value: string, __meta__?: Record<string, any> | undefined) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
  }

  override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}

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
export const GetFormsDocument = new TypedDocumentString(`
    query GetForms {
  forms {
    id
    title
    description
    createdAt
    questions {
      id
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
    CreateForm: build.mutation<CreateFormMutation, CreateFormMutationVariables>(
      {
        query: (variables) => ({
          document: CreateFormDocument as unknown as string,
          variables,
        }),
      },
    ),
    GetForm: build.query<GetFormQuery, GetFormQueryVariables>({
      query: (variables) => ({
        document: GetFormDocument as unknown as string,
        variables,
      }),
    }),
    GetForms: build.query<GetFormsQuery, GetFormsQueryVariables | void>({
      query: (variables) => ({
        document: GetFormsDocument as unknown as string,
        variables,
      }),
    }),
    GetResponses: build.query<GetResponsesQuery, GetResponsesQueryVariables>({
      query: (variables) => ({
        document: GetResponsesDocument as unknown as string,
        variables,
      }),
    }),
    SubmitResponse: build.mutation<
      SubmitResponseMutation,
      SubmitResponseMutationVariables
    >({
      query: (variables) => ({
        document: SubmitResponseDocument as unknown as string,
        variables,
      }),
    }),
  }),
});

export { injectedRtkApi as api };
export const {
  useCreateFormMutation,
  useGetFormQuery,
  useLazyGetFormQuery,
  useGetFormsQuery,
  useLazyGetFormsQuery,
  useGetResponsesQuery,
  useLazyGetResponsesQuery,
  useSubmitResponseMutation,
} = injectedRtkApi;
