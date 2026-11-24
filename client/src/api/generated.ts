/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never;
    };
import type * as Types from '../../../shared/src/generated/graphql';

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
