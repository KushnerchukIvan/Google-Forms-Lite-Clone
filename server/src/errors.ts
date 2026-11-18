import { createGraphQLError } from 'graphql-yoga';

export const inputError = (message: string) =>
  createGraphQLError(message, { extensions: { code: 'BAD_USER_INPUT' } });

export const notFoundError = (message: string) =>
  createGraphQLError(message, { extensions: { code: 'NOT_FOUND' } });
