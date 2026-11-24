import { createApi, type BaseQueryFn } from '@reduxjs/toolkit/query/react';
import { ClientError, GraphQLClient } from 'graphql-request';
import { graphqlRequestBaseQuery } from '@rtk-query/graphql-request-base-query';

export interface GraphQLApiError {
  message: string;
  name?: string;
}

interface GraphQLRequestArgs {
  document: string;
  variables?: unknown;
}

const networkErrorMessage =
  'Unable to connect to the server. Check your connection and try again.';

const serverErrorMessage = (error: ClientError): string =>
  error.response.errors?.map(({ message }) => message).join('\n') ||
  error.message ||
  'The server returned an error.';

export const client = new GraphQLClient(
  import.meta.env.VITE_GRAPHQL_URL ?? 'http://localhost:4000/graphql',
);

const requestBaseQuery = graphqlRequestBaseQuery<GraphQLApiError>({
  client,
  customErrors: (error) => ({ message: serverErrorMessage(error) }),
});

const normalizedBaseQuery: BaseQueryFn<
  GraphQLRequestArgs,
  unknown,
  GraphQLApiError
> = async (args, queryApi, extraOptions) => {
  try {
    const result = await requestBaseQuery(args, queryApi, extraOptions);
    if (result.error === undefined) return result;
    return {
      error: {
        message: result.error.name ? networkErrorMessage : result.error.message,
      },
    };
  } catch (error) {
    return {
      error: {
        message:
          error instanceof ClientError
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
