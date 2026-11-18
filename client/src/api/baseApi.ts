import { createApi } from '@reduxjs/toolkit/query/react';
import { GraphQLClient } from 'graphql-request';
import { graphqlRequestBaseQuery } from '@rtk-query/graphql-request-base-query';

export interface GraphQLApiError {
  name: string;
  message: string;
}

export const client = new GraphQLClient(
  import.meta.env.VITE_GRAPHQL_URL ?? 'http://localhost:4000/graphql',
);

export const api = createApi({
  reducerPath: 'api',
  baseQuery: graphqlRequestBaseQuery<GraphQLApiError>({
    client,
    customErrors: (error) => ({
      name: error.name,
      message:
        error.response.errors?.map(({ message }) => message).join('\n') ||
        error.message,
    }),
  }),
  endpoints: () => ({}),
});
