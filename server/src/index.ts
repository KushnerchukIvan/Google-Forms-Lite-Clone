import { createServer } from 'node:http';
import { createSchema, createYoga } from 'graphql-yoga';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { createResolvers } from './resolvers.js';
import { store } from './store.js';

const envPath = new URL('../../.env', import.meta.url);
if (existsSync(envPath)) process.loadEnvFile(envPath);

const allowedOrigins = (
  process.env.CORS_ORIGIN ??
  'http://localhost:5173,http://127.0.0.1:5173'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const schemaPath = new URL('../../shared/schema.graphql', import.meta.url);
const typeDefs = await readFile(schemaPath, 'utf8');
const yoga = createYoga({
  schema: createSchema({ typeDefs, resolvers: createResolvers(store) }),
  graphqlEndpoint: '/graphql',
  cors: { origin: allowedOrigins },
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
