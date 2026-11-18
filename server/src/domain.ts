import type {
  Answer,
  Form,
  Option,
  Question,
  QuestionType,
  Response as GraphQLResponse,
} from '@forms/shared';

export type { Answer, Form, Option, Question, QuestionType };

export type FormResponse = GraphQLResponse;

export interface Store {
  forms: Map<string, Form>;
  responses: Map<string, FormResponse[]>;
}
