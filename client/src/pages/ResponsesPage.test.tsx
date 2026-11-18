import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { GetFormQuery, GetResponsesQuery } from '../api/generated';
import { useGetFormQuery, useGetResponsesQuery } from '../api/enhanced';
import { ResponsesPage } from './ResponsesPage';

vi.mock('../api/enhanced', () => ({
  useGetFormQuery: vi.fn(),
  useGetResponsesQuery: vi.fn(),
}));

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

const responses: NonNullable<GetResponsesQuery['responses']> = [
  {
    id: 'response-1',
    formId: 'form-1',
    submittedAt: '2026-01-02T00:00:00.000Z',
    answers: [{ questionId: 'choice', value: ['phone-id'] }],
  },
];

describe('ResponsesPage', () => {
  beforeEach(() => {
    vi.mocked(useGetFormQuery).mockReturnValue({
      data: { form },
      isLoading: false,
      error: undefined,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetFormQuery>);
    vi.mocked(useGetResponsesQuery).mockReturnValue({
      data: { responses },
      isLoading: false,
      error: undefined,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetResponsesQuery>);
  });

  it('displays stored option IDs as their labels', () => {
    const markup = renderToStaticMarkup(
      <MemoryRouter initialEntries={['/forms/form-1/responses']}>
        <Routes>
          <Route path="/forms/:id/responses" element={<ResponsesPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(markup).toContain('1 submissions');
    expect(markup).toContain('Preferred contact');
    expect(markup).toContain('<p>Phone</p>');
    expect(markup).not.toContain('<p>phone-id</p>');
  });
});
