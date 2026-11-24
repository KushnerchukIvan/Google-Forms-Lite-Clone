import { describe, expect, it } from 'vitest';
import { getErrorMessage } from './errors';

describe('getErrorMessage', () => {
  it('returns the normalized RTK Query error message', () => {
    expect(getErrorMessage({ message: 'Pick is required.' })).toBe(
      'Pick is required.',
    );
  });

  it('returns undefined when there is no message', () => {
    expect(getErrorMessage(undefined)).toBeUndefined();
    expect(getErrorMessage(null)).toBeUndefined();
  });
});
