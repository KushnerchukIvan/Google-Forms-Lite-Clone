import { FORM_LIMITS } from '@forms/shared';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { GetFormQuery } from '../api/generated';
import { api } from '../api/enhanced';
import { client } from '../api/baseApi';
import { FillPage } from './FillPage';
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
    {
      id: 'comment',
      title: 'Comment',
      type: 'TEXT',
      required: false,
      order: 1,
      options: [],
    },
  ],
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('FillPage', () => {
  it('shows field validation, submits a response, and allows another submission', async () => {
    const store = createAppStore();
    await store.dispatch(
      api.util.upsertQueryData('GetForm', { id: form.id }, { form }),
    );
    const request = vi.spyOn(client, 'request');
    request.mockResolvedValueOnce({
      submitResponse: {
        id: 'response-1',
        formId: form.id,
        submittedAt: '2026-01-02T00:00:00.000Z',
        answers: [{ questionId: 'choice', value: ['email-id'] }],
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[`/forms/${form.id}/fill`]}>
          <Routes>
            <Route path="/forms/:id/fill" element={<FillPage />} />
          </Routes>
        </MemoryRouter>
      </Provider>,
    );

    expect(screen.getByLabelText('Comment')).toHaveProperty(
      'maxLength',
      FORM_LIMITS.answerText,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Submit response' }));
    const validationAlert = await screen.findByRole('alert');
    expect(validationAlert.textContent).toContain(
      '"Preferred contact" is required.',
    );

    fireEvent.click(screen.getByRole('radio', { name: 'Email' }));
    fireEvent.click(screen.getByRole('button', { name: 'Submit response' }));
    expect(
      await screen.findByRole('heading', { name: 'Response submitted!' }),
    ).toBeDefined();
    fireEvent.click(
      await screen.findByRole('button', { name: 'Submit another response' }),
    );
    await waitFor(() => {
      expect(
        screen.getByRole('radio', { name: 'Email' }).matches(':checked'),
      ).toBe(false);
    });
  });
});
