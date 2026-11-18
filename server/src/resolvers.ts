import { randomUUID } from 'node:crypto';
import { FORM_LIMITS, type Resolvers } from '@forms/shared';
import type { Store, Question } from './domain.js';
import { inputError, notFoundError } from './errors.js';
import { validateAnswers, validateQuestions } from './validation.js';

export const createResolvers = (store: Store): Resolvers => ({
  Query: {
    forms: () =>
      [...store.forms.values()].sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt),
      ),
    form: (_parent, { id }) => store.forms.get(id) ?? null,
    responses: (_parent, { formId }) => {
      if (!store.forms.has(formId)) throw notFoundError('Form not found.');
      return store.responses.get(formId) ?? [];
    },
  },
  Mutation: {
    createForm: (_parent, { title, description, questions }) => {
      if (!title.trim()) throw inputError('Form title is required.');
      if (title.trim().length > FORM_LIMITS.formTitle) {
        throw inputError(
          `Form titles can be at most ${String(FORM_LIMITS.formTitle)} characters.`,
        );
      }
      if ((description?.length ?? 0) > FORM_LIMITS.description) {
        throw inputError(
          `Descriptions can be at most ${String(FORM_LIMITS.description)} characters.`,
        );
      }
      validateQuestions(questions);
      const normalizedQuestions: Question[] = questions
        .map((question) => ({
          ...question,
          title: question.title.trim(),
          options: question.options.map((option) => ({
            ...option,
            label: option.label.trim(),
          })),
        }))
        .sort((a, b) => a.order - b.order)
        .map((question, order) => ({ ...question, order }));
      const form = {
        id: randomUUID(),
        title: title.trim(),
        description: description?.trim() ?? '',
        questions: normalizedQuestions,
        createdAt: new Date().toISOString(),
      };
      store.forms.set(form.id, form);
      store.responses.set(form.id, []);
      return form;
    },
    submitResponse: (_parent, { formId, answers }) => {
      const form = store.forms.get(formId);
      if (!form) throw notFoundError('Form not found.');
      validateAnswers(form, answers);
      const response = {
        id: randomUUID(),
        formId,
        answers: answers.map((answer) => ({
          ...answer,
          value: [...answer.value],
        })),
        submittedAt: new Date().toISOString(),
      };
      const current = store.responses.get(formId) ?? [];
      store.responses.set(formId, [...current, response]);
      return response;
    },
  },
});
