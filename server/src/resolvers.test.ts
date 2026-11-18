import { FORM_LIMITS } from '@forms/shared';
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

const readError = (result: unknown): { code: string; message: string } => {
  if (
    !isRecord(result) ||
    !Array.isArray(result.errors) ||
    !isRecord(result.errors[0]) ||
    !isRecord(result.errors[0].extensions) ||
    typeof result.errors[0].extensions.code !== 'string' ||
    typeof result.errors[0].message !== 'string'
  ) {
    throw new Error('Expected GraphQL error details.');
  }
  return {
    code: result.errors[0].extensions.code,
    message: result.errors[0].message,
  };
};

describe('GraphQL resolvers', () => {
  it('enforces form title and description limits', async () => {
    const yoga = createTestYoga();
    const mutation = `mutation CreateForm($title: String!, $description: String, $questions: [QuestionInput!]!) {
      createForm(title: $title, description: $description, questions: $questions) { id }
    }`;
    const oversizedTitle = await execute(yoga, mutation, {
      title: 'T'.repeat(FORM_LIMITS.formTitle + 1),
      description: '',
      questions: [],
    });
    const oversizedDescription = await execute(yoga, mutation, {
      title: 'Form',
      description: 'D'.repeat(FORM_LIMITS.description + 1),
      questions: [],
    });

    expect(readError(oversizedTitle)).toMatchObject({
      code: 'BAD_USER_INPUT',
      message: `Form titles can be at most ${String(FORM_LIMITS.formTitle)} characters.`,
    });
    expect(readError(oversizedDescription)).toMatchObject({
      code: 'BAD_USER_INPUT',
      message: `Descriptions can be at most ${String(FORM_LIMITS.description)} characters.`,
    });
  });

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
            order: 9,
          },
          {
            id: 'date',
            title: 'Date',
            type: 'DATE',
            required: false,
            options: [],
            order: 2,
          },
        ],
      },
    );

    const createData = readData(createResult);
    const formId = readId(createData, 'createForm');
    expect(createData.createForm).toMatchObject({
      questions: [
        { id: 'date', order: 0 },
        { id: 'name', order: 1 },
      ],
    });
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

    expect(readError(result).code).toBe('BAD_USER_INPUT');
  });

  it('rejects a response for an unknown form ID', async () => {
    const result = await execute(
      createTestYoga(),
      `mutation SubmitResponse($formId: ID!, $answers: [AnswerInput!]!) {
        submitResponse(formId: $formId, answers: $answers) { id }
      }`,
      { formId: 'missing-form', answers: [] },
    );

    expect(readError(result)).toMatchObject({
      code: 'NOT_FOUND',
      message: 'Form not found.',
    });
  });

  it('rejects an option label where an option ID is required', async () => {
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
            id: 'contact-method',
            title: 'Contact method',
            type: 'MULTIPLE_CHOICE',
            required: false,
            order: 0,
            options: [
              { id: 'email-id', label: 'Email' },
              { id: 'phone-id', label: 'Phone' },
            ],
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
      { formId, answers: [{ questionId: 'contact-method', value: ['Email'] }] },
    );

    expect(readError(result)).toMatchObject({
      code: 'BAD_USER_INPUT',
      message: 'An answer for "Contact method" is not one of its options.',
    });
  });

  it('rejects a response that omits a required question', async () => {
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
            required: true,
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
      { formId, answers: [] },
    );

    expect(readError(result)).toMatchObject({
      code: 'BAD_USER_INPUT',
      message: '"Name" is required.',
    });
  });

  it('returns NOT_FOUND when querying responses for an unknown form', async () => {
    const result = await execute(
      createTestYoga(),
      'query Responses($formId: ID!) { responses(formId: $formId) { id } }',
      { formId: 'missing-form' },
    );

    expect(readError(result)).toMatchObject({
      code: 'NOT_FOUND',
      message: 'Form not found.',
    });
  });
});
