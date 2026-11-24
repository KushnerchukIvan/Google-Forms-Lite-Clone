import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: './shared/schema.graphql',
  documents: './client/src/api/operations/**/*.graphql',
  generates: {
    './shared/src/generated/graphql.ts': {
      plugins: ['typescript', 'typescript-resolvers'],
      config: {
        enumsAsTypes: true,
        scalars: { ID: 'string' },
        defaultScalarType: 'unknown',
        contextType: '../context#GraphQLContext',
        useTypeImports: true,
      },
    },
    './client/src/api/generated.ts': {
      plugins: ['typescript-operations'],
      config: {
        enumsAsTypes: true,
        scalars: { ID: 'string' },
        defaultScalarType: 'unknown',
        importSchemaTypesFrom: './shared/src/generated/graphql.ts',
        namespacedImportName: 'Types',
        documentMode: 'plainString',
        useTypeImports: true,
      },
    },
  },
  hooks: {
    afterAllFileWrite: ['prettier --write'],
  },
};

export default config;
