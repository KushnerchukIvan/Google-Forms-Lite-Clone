import { ClientError } from 'graphql-request';
import { GraphQLError } from 'graphql';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { api } from './enhanced';
import { client } from './baseApi';
import { createAppStore } from '../store/store';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('normalized GraphQL API errors', () => {
  it('preserves readable GraphQL server errors', async () => {
    vi.spyOn(client, 'request').mockRejectedValueOnce(
      new ClientError(
        {
          errors: [new GraphQLError('The form title is invalid.')],
          status: 400,
        },
        { query: 'query GetForms { forms { id } }' },
      ),
    );
    const store = createAppStore();
    const result = await store.dispatch(
      api.endpoints.GetForms.initiate({}),
    );

    expect(result).toHaveProperty('error', {
      message: 'The form title is invalid.',
    });
  });

  it('normalizes network failures to a connection message', async () => {
    vi.spyOn(client, 'request').mockRejectedValueOnce(
      new TypeError('fetch failed'),
    );
    const store = createAppStore();
    const result = await store.dispatch(
      api.endpoints.GetForms.initiate({}),
    );

    expect(result).toHaveProperty('error', {
      message:
        'Unable to connect to the server. Check your connection and try again.',
    });
  });

  it('returns successful query data without an error', async () => {
    vi.spyOn(client, 'request').mockResolvedValueOnce({ forms: [] });
    const store = createAppStore();
    const result = await store.dispatch(
      api.endpoints.GetForms.initiate({}),
    );

    expect(result).toHaveProperty('data', { forms: [] });
    expect(result).not.toHaveProperty('error');
  });
});
