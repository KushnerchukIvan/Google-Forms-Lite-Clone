import { act, renderHook } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import type { GetFormQuery, GetFormsQuery, GetResponsesQuery } from '../api/generated';
import { api } from '../api/enhanced';
import { createAppStore } from '../store/store';
import { useFormBuilder } from './useFormBuilder';
import { useFormFill } from './useFormFill';
import { useHomeForms } from './useHomeForms';
import { useResponses } from './useResponses';

const form: NonNullable<GetFormQuery['form']> = {
  id: 'form-1',
  title: 'Contact',
  description: '',
  createdAt: '2026-01-01T00:00:00.000Z',
  questions: [
    {
      id: 'choice',
      title: 'Preferred contact',
      type: 'MULTIPLE_CHOICE',
      required: false,
      order: 0,
      options: [{ id: 'email', label: 'Email' }],
    },
  ],
};

const response: NonNullable<GetResponsesQuery['responses']>[number] = {
  id: 'response-1',
  formId: form.id,
  submittedAt: '2026-01-02T00:00:00.000Z',
  answers: [{ questionId: 'choice', value: ['email'] }],
};

const createWrapper =
  (store: ReturnType<typeof createAppStore>, path: string, route: string) =>
  ({ children }: PropsWithChildren) => (
    <Provider store={store}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path={route} element={<>{children}</>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );

describe('form workflow hooks', () => {
  it('updates the draft through useFormBuilder and validates it', async () => {
    const store = createAppStore();
    const { result } = renderHook(() => useFormBuilder(), {
      wrapper: createWrapper(store, '/forms/new', '/forms/new'),
    });

    act(() => {
      result.current.setTitle('Contact');
      result.current.addQuestion('TEXT');
    });
    await act(async () => result.current.save());

    expect(store.getState().formDraft.questions).toHaveLength(1);
    expect(
      Object.values(result.current.validationErrors?.questions ?? {}),
    ).toEqual(['Every question needs a title.']);
  });

  it('loads the selected form and updates answer draft in useFormFill', async () => {
    const store = createAppStore();
    await store.dispatch(
      api.util.upsertQueryData('GetForm', { id: form.id }, { form }),
    );
    const { result } = renderHook(() => useFormFill(), {
      wrapper: createWrapper(
        store,
        `/forms/${form.id}/fill`,
        '/forms/:id/fill',
      ),
    });

    act(() => {
      result.current.setValue('choice', ['email']);
    });

    expect(result.current.form?.title).toBe('Contact');
    expect(result.current.values.choice).toEqual(['email']);
  });

  it('prepares display data in useHomeForms', async () => {
    const store = createAppStore();
    const forms: GetFormsQuery['forms'] = [
      {
        id: form.id,
        title: form.title,
        description: form.description,
        createdAt: form.createdAt,
        questions: [{ id: 'choice' }],
      },
    ];
    await store.dispatch(
      api.util.upsertQueryData('GetForms', undefined, { forms }),
    );
    const { result } = renderHook(() => useHomeForms(), {
      wrapper: createWrapper(store, '/', '/'),
    });

    expect(result.current.forms[0]).toMatchObject({
      id: form.id,
      questionCount: 1,
      createdDate: new Date(form.createdAt).toLocaleDateString(),
    });
  });

  it('groups answers and calculates the response count in useResponses', async () => {
    const store = createAppStore();
    await store.dispatch(
      api.util.upsertQueryData('GetForm', { id: form.id }, { form }),
    );
    await store.dispatch(
      api.util.upsertQueryData(
        'GetResponses',
        { formId: form.id },
        { responses: [response] },
      ),
    );
    const { result } = renderHook(() => useResponses(), {
      wrapper: createWrapper(
        store,
        `/forms/${form.id}/responses`,
        '/forms/:id/responses',
      ),
    });

    expect(result.current.responseCountLabel).toBe('1 submission');
    expect(result.current.responses[0]?.answers[0]?.values).toEqual(['Email']);
  });
});
