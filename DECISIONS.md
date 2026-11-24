# Architecture decisions

## Monorepo and shared types

The project uses npm workspaces for `client`, `server`, and `shared`. npm workspaces and one lockfile were chosen over separate repositories, pnpm-specific tooling, or a task-runner such as Turborepo or Nx because this application has only three small packages and needs a single command to run both processes. `shared/schema.graphql` is the source of truth; GraphQL Code Generator produces resolver/schema types and client operation types. This avoids manually duplicating API models.

## GraphQL schema and answer model

List inputs and outputs use non-null lists of non-null items, such as `[QuestionInput!]!` and `[Response!]!`. This is stricter than the nullable signatures in the initial request: a missing collection is not meaningful for form creation or response queries, and null elements cannot be processed as domain entities. `form(id:)` stays nullable because an unknown ID is a normal lookup result. Descriptions may be omitted on input and are normalized to an empty string.

An answer stores `value: [String!]!`. A text/date answer has one string, a single-choice answer stores one option ID, and a checkbox answer can store several option IDs. A GraphQL union or separate value fields would introduce several response shapes and client-side branches without adding useful validation; the server instead validates answer cardinality and allowed option IDs against the question type. `required` is stored on each question, and integer `order` is persisted so both client and server use the same ordering.

The schema intentionally makes `responses` return `[Response!]!`, and makes `createForm` accept a non-null question list and return `Form!`: empty results are represented by `[]`, while a failed create is a GraphQL error, not a nullable success. `QuestionInput` requires client-generated IDs and order so the builder can keep stable identities and ordering before persistence.

## Server structure and errors

GraphQL Yoga was selected over Express with a separate GraphQL adapter or a larger framework such as NestJS. It provides the GraphQL endpoint directly with a small setup surface suitable for this single-process application. The server separates schema, resolvers, validation, errors, and store concerns. Resolvers receive a `Store` dependency rather than closing over the singleton, so tests can create isolated data stores without starting a network listener.

Validation rules live in `shared/src/validation.ts` as pure functions returning structured field/question problems. This keeps immediate client feedback and authoritative server validation identical without coupling shared code to React or Yoga. Previously, the client had its own rule copies in `client/src/services/formBuilder.ts` and `client/src/services/answers.ts`, while `server/src/validation.ts` separately enforced related constraints. The client alone required at least one question; this is now a shared rule and is also enforced by the server so both sides agree.

GraphQL errors use stable `BAD_USER_INPUT` and `NOT_FOUND` extension codes with readable messages; a typed result union was not used because normal GraphQL error responses already fit the API and UI workflows. Errors are created through Yoga's GraphQL helper so the server handles them as GraphQL errors. The error audit found server GraphQL error creation in `server/src/errors.ts`; GraphQL response parsing in `client/src/api/baseApi.ts`; shape-specific parsing in `client/src/services/errors.ts`; mutation `try/catch` and local `serverError` state in the builder and fill workflows; and generic fallback strings on the builder, home, fill, and response screens. The resulting three layers are: Yoga resolvers throw `GraphQLError` values with stable codes and readable messages; the RTK Query base API normalizes server and connection errors to `{ message: string }`; and UI hooks read that message through the single small `getErrorMessage` helper. Pages no longer catch mutation errors or store duplicate server-error state.

Shared limits keep client constraints and server enforcement aligned. Titles and labels are capped at 100–200 characters for concise UI text, descriptions at 1,000 and text answers at 2,000 to allow useful context, while 50 questions and 20 options bound form size and validation work. CORS origins come from `.env` as an explicit allowlist, so local and deployment origins can be configured without changing application code.

## Client architecture and state

React Router provides explicit routes for the four screens instead of conditional rendering in a single component; it keeps URL state shareable. `useFormBuilder`, `useFormFill`, `useHomeForms`, and `useResponses` own route workflows, including queries, mutations, validation state, formatting, and response grouping; pages render their returned state and actions. Reusable question editing lives in a component. A feature-folder-per-screen structure was also possible, but the shared question editor and services are used across page workflows.

RTK Query owns server state and caching, including form and response data. The Redux slice contains only the form-builder draft; answer drafts and validation state are owned by `useFormFill`. Copying fetched forms or responses into slices would duplicate the RTK Query cache and require extra synchronization.

## IDs and ordering

`crypto.randomUUID()` supplies IDs for persisted forms and responses on the server and for draft questions/options in the browser. UUIDs avoid collisions without a database or shared counter; sequential IDs would be simpler but require global coordination and can collide across independently created drafts. The builder uses explicit move-up/move-down buttons rather than drag-and-drop, which supports keyboard interaction without adding a dependency. The server sorts persisted questions by their submitted order.

## Code generation and tests

GraphQL Code Generator reads the shared schema and client operation documents to create resolver/schema types and client operation types. Client operation documents are imported as raw strings, and `client/src/api/enhanced.ts` defines typed RTK Query endpoints using the generated operation types. The RTK Query codegen plugin hard-codes an `as unknown as string` cast, so the endpoint definitions use raw operation documents rather than that plugin. `codegen.ts` uses the documented `plainString` operation mode and formats outputs through `afterAllFileWrite`; `scripts/normalize-generated.mjs` was removed rather than maintaining regex rewrites after generation. The resolver-types plugin still emits `any` in its generic subscription helper declarations even though this schema has no subscriptions, and offers no option to change those specific declarations. One ESLint override therefore disables only explicit-any and unsafe rules for generated directories; generated code is not edited manually and handwritten code remains strictly checked.

Vitest covers shared validation, client adapters and route hooks, Redux draft behavior, page interactions, and GraphQL resolver flows. Pure-function tests keep domain rules fast to isolate, while resolver tests exercise the schema and API behavior without starting a separate HTTP process. API tests verify server errors, network failures, and success. Broader end-to-end testing could add value as the application grows, but is not needed to cover the critical current flows.
