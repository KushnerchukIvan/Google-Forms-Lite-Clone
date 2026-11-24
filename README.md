# Forms Lite

A full-stack Google Forms-inspired application. Create forms, collect submissions, and review answers.

## Requirements

- Node.js 22 or newer
- npm 10 or newer

## Quick start

```bash
npm install
npm run dev
```

Open the client at http://localhost:5173. The GraphQL endpoint is available at http://localhost:4000/graphql.

The dev command generates GraphQL artifacts, builds the shared package, and then starts the API and Vite client together. The API uses an in-memory store, so all forms and responses are reset when the server restarts.

## Commands

| Command             | Description                                                        |
| ------------------- | ------------------------------------------------------------------ |
| `npm run dev`       | Generate GraphQL artifacts and run client + server                 |
| `npm run codegen`   | Generate shared schema and client operation types               |
| `npm run typecheck` | Type-check all workspaces                                          |
| `npm run lint`      | Run strict ESLint checks                                           |
| `npm run test`      | Run shared, server, and client tests                               |
| `npm run build`     | Generate artifacts and build all workspaces                        |
| `npm run format`    | Format the repository with Prettier                                |

## Environment

Copy `.env.example` to `.env` if you need to override defaults. `PORT` configures the API port, `VITE_GRAPHQL_URL` configures the GraphQL endpoint used by the browser, and `CORS_ORIGIN` is a comma-separated allowlist of browser origins for the API. Add the network origin you use when opening Vite from another device.

## Project structure

```text
.
├── client
│   └── src
│       ├── api             # RTK Query base API and typed endpoints
│       │   └── operations  # GraphQL operation documents
│       ├── components      # Presentation components
│       ├── hooks           # Route workflow state, queries, and actions
│       ├── pages           # Screens that render hook results
│       ├── services        # Shared-validation adapters and display transforms
│       └── store           # Redux store and local builder draft slice
├── server
│   └── src
│       ├── domain.ts       # Server domain types
│       ├── resolvers.ts    # GraphQL resolvers
│       ├── store.ts        # Injectable in-memory store
│       └── validation.ts   # Thin shared-validation adapters
├── shared
│   ├── schema.graphql      # Single source of truth
│   └── src
│       ├── generated       # GraphQL Code Generator output
│       └── validation.ts   # Shared form and answer rules
└── codegen.ts
```

## Features

- Form list, form builder, form filler, and response viewer.
- Text, multiple choice, checkbox, and date question types.
- Required questions, editable choice options, and move-up/move-down ordering.
- Client and server validation.
- RTK Query caching, mutation invalidation, loading and error states.
- GraphQL errors with `BAD_USER_INPUT` and `NOT_FOUND` extension codes.

## Architecture decisions

### Monorepo and shared schema

npm workspaces keep setup simple and use one lockfile without adding a task-runner dependency. `shared/schema.graphql` is the source of truth. GraphQL Code Generator creates shared schema and resolver types plus a client RTK Query API artifact. The RTK Query plugin injects typed operations into a shared base API using the documented GraphQL Request base-query adapter. Both workspaces consume the shared package rather than maintaining independent copies of GraphQL model definitions.

### Server framework

GraphQL Yoga was selected over Express + a separate GraphQL middleware and over a larger framework such as NestJS. It provides a focused GraphQL server with a small setup surface, which fits this single-process in-memory application.

### GraphQL nullability

The list inputs and list outputs are strengthened to non-null lists of non-null items (`[QuestionInput!]!`, `[AnswerInput!]!`, `[Response!]!`). Empty collections are valid, while `null` entries have no useful domain meaning. `form` remains nullable because an unknown ID is a normal lookup outcome. `description` is nullable at input and normalized to an empty string in the domain.

### Answer representation

`Answer.value` is `[String!]!`. This supports one text/date value, one selected option ID for single choice, and multiple option IDs for checkboxes while keeping the GraphQL model compact. The server validates cardinality and allowed option IDs against the corresponding question type. A GraphQL union was avoided because clients would need to branch on multiple object types for a simple display model.

### Required questions and ordering

`required` is part of the Question model and input. `order` is an integer persisted with each question. The builder changes order with explicit up/down controls, which are keyboard-friendly and avoid a drag-and-drop dependency.

### IDs

`crypto.randomUUID()` generates IDs for forms, questions, options, and responses. UUIDs are generated client-side for draft question and option identities and server-side for persisted forms and responses.

### Client state

RTK Query owns all server state and cache entries. The Redux slice is reserved for transient form-builder draft state; server results are not copied into slices. The answer draft is local component state because it is scoped to one form-filling session and does not need to be shared globally.

### Routing and UI structure

React Router provides four explicit route screens. Route components render presentation components from route-specific hooks: `useFormBuilder`, `useFormFill`, `useHomeForms`, and `useResponses`. These hooks own mutations, draft state, validation state, query orchestration, formatting, and response grouping. The Redux slice remains limited to the form-builder draft.

### Validation and error handling

`shared/src/validation.ts` is the source of truth for form and answer rules. The client services adapt its structured problems to field-level messages; server wrappers turn the first problem into a `BAD_USER_INPUT` GraphQL error. A form must contain at least one question on both sides, matching the former client-only rule. `baseApi` normalizes GraphQL and network failures to `{ message }`, and the UI reads that message from RTK Query results.

### Code generation

The codegen configuration reads the shared GraphQL schema and client operation documents to create server resolver types and client operation types. Client operation documents are imported as raw strings and used by typed RTK Query endpoints in `client/src/api/enhanced.ts`; this avoids unsafe casts emitted unconditionally by the RTK Query codegen plugin. `codegen.ts` formats generated files through `afterAllFileWrite`. Generated files are committed build artifacts; rerun `npm run codegen` after changing the schema or GraphQL operations.

### Tests

Vitest covers shared form and answer validation, GraphQL resolver flows, client-side adapters and draft state, each route hook, and key page interactions. API tests cover GraphQL server errors, connection failures, and successful requests. Cases include required answers, date checks, question ordering, answer normalization, and GraphQL error codes. Validation functions receive their form/store dependencies explicitly, allowing focused tests without starting an HTTP server.

See [DECISIONS.md](./DECISIONS.md) for the alternatives considered and rationale for the schema, code generation, client/server structure, state, validation, errors, IDs, ordering, and tests.

## GraphQL API

- `forms`
- `form(id: ID!)`
- `responses(formId: ID!)`
- `createForm(title: String!, description: String, questions: [QuestionInput!]!)`
- `submitResponse(formId: ID!, answers: [AnswerInput!]!)`

Open the Yoga GraphiQL interface at `http://localhost:4000/graphql` in development.

## Known limitations / future work

- Forms and responses are stored in memory and are lost when the API restarts; durable persistence is intentionally out of scope.
- The form and response lists are unpaginated and intended for small datasets.
- There is no authentication or ownership model, so forms are accessible to anyone with their links.
- Automated browser end-to-end coverage could complement the current unit, resolver, and component interaction tests.
