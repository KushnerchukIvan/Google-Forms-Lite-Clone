# Architecture decisions

## Monorepo and shared types

The project uses npm workspaces for `client`, `server`, and `shared`. npm workspaces and one lockfile were chosen over separate repositories, pnpm-specific tooling, or a task-runner such as Turborepo or Nx because this application has only three small packages and needs a single command to run both processes. `shared/schema.graphql` is the source of truth; GraphQL Code Generator produces resolver/schema types and client operation types/hooks. This avoids manually duplicating API models.

## GraphQL schema and answer model

List inputs and outputs use non-null lists of non-null items, such as `[QuestionInput!]!` and `[Response!]!`. This is stricter than the nullable signatures in the initial request: a missing collection is not meaningful for form creation or response queries, and null elements cannot be processed as domain entities. `form(id:)` stays nullable because an unknown ID is a normal lookup result. Descriptions may be omitted on input and are normalized to an empty string.

An answer stores `value: [String!]!`. A text/date answer has one string, a single-choice answer stores one option ID, and a checkbox answer can store several option IDs. A GraphQL union or separate value fields would introduce several response shapes and client-side branches without adding useful validation; the server instead validates answer cardinality and allowed option IDs against the question type. `required` is stored on each question, and integer `order` is persisted so both client and server use the same ordering.

The schema intentionally makes `responses` return `[Response!]!`, and makes `createForm` accept a non-null question list and return `Form!`: empty results are represented by `[]`, while a failed create is a GraphQL error, not a nullable success. `QuestionInput` requires client-generated IDs and order so the builder can keep stable identities and ordering before persistence.

## Server structure and errors

GraphQL Yoga was selected over Express with a separate GraphQL adapter or a larger framework such as NestJS. It provides the GraphQL endpoint directly with a small setup surface suitable for this single-process application. The server separates schema, resolvers, validation, errors, and store concerns. Resolvers receive a `Store` dependency rather than closing over the singleton, so tests can create isolated data stores without starting a network listener.

Both client and server validate input. Client validation gives immediate feedback, while server validation remains authoritative because requests can bypass the UI. Domain validation is implemented in focused functions. GraphQL errors use stable `BAD_USER_INPUT` and `NOT_FOUND` extension codes with readable messages; a typed result union was not used because normal GraphQL error responses already fit the API and UI workflows. Errors are created through Yoga's GraphQL helper so the server handles them as GraphQL errors.

Shared limits keep client constraints and server enforcement aligned. Titles and labels are capped at 100–200 characters for concise UI text, descriptions at 1,000 and text answers at 2,000 to allow useful context, while 50 questions and 20 options bound form size and validation work. CORS origins come from `.env` as an explicit allowlist, so local and deployment origins can be configured without changing application code.

## Client architecture and state

React Router provides explicit routes for the four screens instead of conditional rendering in a single component; it keeps URL state shareable and route components focused. The client follows a layer-oriented structure: pages compose UI, reusable question editing lives in a component, and form/answer rules live in services. A feature-folder-per-screen structure was also possible, but the shared question editor and services are used across page workflows.

RTK Query owns server state and caching, including form and response data. The Redux slice contains only the form-builder draft, and answers being entered stay in local component state because they belong to one fill session. Copying fetched forms or responses into slices would duplicate the RTK Query cache and require extra synchronization.

## IDs and ordering

`crypto.randomUUID()` supplies IDs for persisted forms and responses on the server and for draft questions/options in the browser. UUIDs avoid collisions without a database or shared counter; sequential IDs would be simpler but require global coordination and can collide across independently created drafts. The builder uses explicit move-up/move-down buttons rather than drag-and-drop, which supports keyboard interaction without adding a dependency. The server sorts persisted questions by their submitted order.

## Code generation and tests

GraphQL Code Generator reads the shared schema and client operation documents to create server resolver types and RTK Query hooks. The RTK Query codegen plugin injects generated endpoints into the shared base API; hand-written endpoint types or separate client/server model declarations would drift from the schema. A post-generation normalization step removes generator-emitted unsafe types and comments to preserve the project's strict typing conventions.

Vitest covers pure client validation/transformation functions, Redux draft behavior, a builder component case, server validation, and GraphQL resolver flows. Pure-function tests keep domain rules fast to isolate, while resolver tests exercise the schema and API behavior without starting a separate HTTP process. Broader end-to-end testing could add value as the application grows, but is not needed to cover the critical current flows.
