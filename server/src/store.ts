import type { Store } from './domain.js';

export const createStore = (): Store => ({
  forms: new Map(),
  responses: new Map(),
});

export const store = createStore();
