import { describe, expect, it } from 'vitest';
import { getErrorMessage } from './errors';

describe('getErrorMessage', () => {
  it('returns GraphQL messages from an RTK Query error', () => {
    expect(
      getErrorMessage({
        name: 'GraphQLRequestError',
        message: 'Pick is required.',
      }),
    ).toBe('Pick is required.');
  });

  it('joins messages from GraphQL response errors', () => {
    expect(
      getErrorMessage({
        response: {
          errors: [{ message: 'First issue.' }, { message: 'Second issue.' }],
        },
      }),
    ).toBe('First issue.\nSecond issue.');
  });

  it('returns undefined for an unrecognized error', () => {
    expect(getErrorMessage(null)).toBeUndefined();
  });
});
