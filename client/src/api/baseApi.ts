import { createApi, type BaseQueryFn } from '@reduxjs/toolkit/query/react';
import { GraphQLClient } from 'graphql-request';
import { graphqlRequestBaseQuery } from '@rtk-query/graphql-request-base-query';

export interface GraphQLApiError {
  message: string;
  kind?: 'server';
}

interface GraphQLClientErrorLike {
  message: string;
  response: {
    errors?: readonly { message: string }[];
  };
}

interface GraphQLRequestArgs {
  document: string;
  variables?: unknown;
}

const networkErrorMessage =
  'Unable to connect to the server. Check your connection and try again.';

const serverErrorMessage = (error: GraphQLClientErrorLike): string =>
  error.response.errors?.map(({ message }) => message).join('\n') ||
  error.message ||
  'The server returned an error.';

const isGraphQLClientErrorLike = (
  error: unknown,
): error is GraphQLClientErrorLike => {
  if (
    typeof error !== 'object' ||
    error === null ||
    !('message' in error) ||
    !('response' in error) ||
    typeof error.message !== 'string' ||
    typeof error.response !== 'object' ||
    error.response === null
  ) {
    return false;
  }

  if (!('errors' in error.response) || error.response.errors === undefined) {
    return true;
  }

  return (
    Array.isArray(error.response.errors) &&
    error.response.errors.every(
      (item: unknown) =>
        typeof item === 'object' &&
        item !== null &&
        'message' in item &&
        typeof item.message === 'string',
    )
  );
};

export const client = new GraphQLClient(
  import.meta.env.VITE_GRAPHQL_URL ?? 'http://localhost:4000/graphql',
);

const requestBaseQuery = graphqlRequestBaseQuery<GraphQLApiError>({
  client,
  customErrors: (error) => ({
    message: serverErrorMessage(error),
    kind: 'server',
  }),
});

const normalizedBaseQuery: BaseQueryFn<
  GraphQLRequestArgs,
  unknown,
  GraphQLApiError
> = async (args, queryApi, extraOptions) => {
  try {
    const result = await requestBaseQuery(
      { ...args, document: args.document.valueOf() },
      queryApi,
      extraOptions,
    );
    if (result.error === undefined) return result;
    return {
      error: {
        message:
          result.error.kind === 'server'
            ? result.error.message
            : networkErrorMessage,
      },
    };
  } catch (error) {
    return {
      error: {
        message: isGraphQLClientErrorLike(error)
          ? serverErrorMessage(error)
          : networkErrorMessage,
      },
    };
  }
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: normalizedBaseQuery,
  endpoints: () => ({}),
});
