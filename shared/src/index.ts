export * from './generated/graphql.js';
export type { GraphQLContext } from './context.js';

export const assertNever = (value: never): never => {
  throw new Error(`Unexpected value: ${String(value)}`);
};
