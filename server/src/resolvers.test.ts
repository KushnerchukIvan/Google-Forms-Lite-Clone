import { readFile } from 'node:fs/promises';
import { createSchema, createYoga } from 'graphql-yoga';
import { describe, expect, it } from 'vitest';
import { createResolvers } from './resolvers.js';
import { createStore } from './store.js';

const typeDefs = await readFile(
  new URL('../../shared/schema.graphql', import.meta.url),
  'utf8',
);

const createTestYoga = () =>
  createYoga({
    schema: createSchema({
      typeDefs,
      resolvers: createResolvers(createStore()),
    }),
    graphqlEndpoint: '/graphql',
  });

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const execute = async (
  yoga: ReturnType<typeof createYoga>,
  query: string,
  variables: Record<string, unknown>,
): Promise<unknown> => {
  const response = await yoga.fetch('http://localhost/graphql', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  expect(response.status).toBe(200);
  const result: unknown = await response.json();
  return result;
};

const readData = (result: unknown): Record<string, unknown> => {
  if (!isRecord(result) || !isRecord(result.data))
    throw new Error('Expected GraphQL data.');
  expect(result.errors).toBeUndefined();
  return result.data;
};

const readId = (data: Record<string, unknown>, field: string): string => {
  const result = data[field];
  if (!isRecord(result) || typeof result.id !== 'string') {
    throw new Error(`Expected ${field} to return an object with an ID.`);
  }
  return result.id;
};

describe('GraphQL resolvers', () => {
  it('creates a form, submits a response, and returns it in queries', async () => {
    const yoga = createTestYoga();
    const createResult = await execute(
      yoga,
      `mutation CreateForm($title: String!, $description: String, $questions: [QuestionInput!]!) {
        createForm(title: $title, description: $description, questions: $questions) {
          id
          title
          questions { id order }
        }
      }`,
      {
        title: 'Contact',
        description: '',
        questions: [
          {
            id: 'name',
            title: 'Name',
            type: 'TEXT',
            required: true,
            options: [],
            order: 0,
          },
        ],
      },
    );

    const formId = readId(readData(createResult), 'createForm');
    const formResult = await execute(
      yoga,
      'query Form($id: ID!) { form(id: $id) { title } forms { id title } }',
      { id: formId },
    );

    const formData = readData(formResult);
    expect(formData.form).toMatchObject({ title: 'Contact' });
    expect(formData.forms).toMatchObject([{ id: formId, title: 'Contact' }]);

    const submitResult = await execute(
      yoga,
      `mutation SubmitResponse($formId: ID!, $answers: [AnswerInput!]!) {
        submitResponse(formId: $formId, answers: $answers) { id formId answers { questionId value } }
      }`,
      { formId, answers: [{ questionId: 'name', value: ['Ada'] }] },
    );

    const responseId = readId(readData(submitResult), 'submitResponse');
    const responsesResult = await execute(
      yoga,
      'query Responses($formId: ID!) { responses(formId: $formId) { id formId answers { questionId value } } }',
      { formId },
    );

    expect(readData(responsesResult).responses).toMatchObject([
      {
        id: responseId,
        formId,
        answers: [{ questionId: 'name', value: ['Ada'] }],
      },
    ]);
  });

  it('returns a BAD_USER_INPUT GraphQL error for an answer outside the form', async () => {
    const yoga = createTestYoga();
    const createResult = await execute(
      yoga,
      `mutation CreateForm($title: String!, $questions: [QuestionInput!]!) {
        createForm(title: $title, questions: $questions) { id }
      }`,
      {
        title: 'Contact',
        questions: [
          {
            id: 'name',
            title: 'Name',
            type: 'TEXT',
            required: false,
            options: [],
            order: 0,
          },
        ],
      },
    );
    const formId = readId(readData(createResult), 'createForm');
    const result = await execute(
      yoga,
      `mutation SubmitResponse($formId: ID!, $answers: [AnswerInput!]!) {
        submitResponse(formId: $formId, answers: $answers) { id }
      }`,
      { formId, answers: [{ questionId: 'other', value: ['answer'] }] },
    );

    if (
      !isRecord(result) ||
      !Array.isArray(result.errors) ||
      !isRecord(result.errors[0]) ||
      !isRecord(result.errors[0].extensions)
    ) {
      throw new Error('Expected GraphQL error details.');
    }
    expect(result.errors[0].extensions.code).toBe('BAD_USER_INPUT');
  });
});
