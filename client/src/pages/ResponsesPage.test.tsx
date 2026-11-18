// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import type { GetFormQuery, GetResponsesQuery } from '../api/generated';
import { api } from '../api/enhanced';
import { ResponsesPage } from './ResponsesPage';
import { createAppStore } from '../store/store';

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
      required: true,
      order: 0,
      options: [
        { id: 'email-id', label: 'Email' },
        { id: 'phone-id', label: 'Phone' },
      ],
    },
  ],
};

const response: NonNullable<GetResponsesQuery['responses']>[number] = {
  id: 'response-1',
  formId: 'form-1',
  submittedAt: '2026-01-02T00:00:00.000Z',
  answers: [{ questionId: 'choice', value: ['phone-id'] }],
};

afterEach(cleanup);

describe('ResponsesPage', () => {
  it('renders the response label and singular count', async () => {
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

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[`/forms/${form.id}/responses`]}>
          <Routes>
            <Route path="/forms/:id/responses" element={<ResponsesPage />} />
          </Routes>
        </MemoryRouter>
      </Provider>,
    );

    expect(await screen.findByText('1 submission')).toBeDefined();
    expect(screen.getByText('Phone')).toBeDefined();
  });
});
