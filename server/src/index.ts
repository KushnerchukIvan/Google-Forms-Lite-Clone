import { createServer } from 'node:http';
import { createSchema, createYoga } from 'graphql-yoga';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createResolvers } from './resolvers.js';
import { store } from './store.js';

const schemaPath = resolve(process.cwd(), '../shared/schema.graphql');
const typeDefs = await readFile(schemaPath, 'utf8');
const yoga = createYoga({
  schema: createSchema({ typeDefs, resolvers: createResolvers(store) }),
  graphqlEndpoint: '/graphql',
});
const server = createServer((request, response) => {
  void yoga(request, response);
});
const port = Number(process.env.PORT ?? 4000);

server.on('listening', () => {
  process.stdout.write(
    `GraphQL API ready at http://localhost:${String(port)}/graphql\n`,
  );
});
server.listen(port);
