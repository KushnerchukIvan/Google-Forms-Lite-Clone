import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { GetFormQuery } from '../api/generated';
import { useGetFormQuery, useSubmitResponseMutation } from '../api/enhanced';
import { FillPage } from './FillPage';

vi.mock('../api/enhanced', () => ({
  useGetFormQuery: vi.fn(),
  useSubmitResponseMutation: vi.fn(),
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

describe('FillPage', () => {
  beforeEach(() => {
    vi.mocked(useGetFormQuery).mockReturnValue({
      data: { form },
      isLoading: false,
      error: undefined,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetFormQuery>);
    vi.mocked(useSubmitResponseMutation).mockReturnValue([
      vi.fn(),
      { isLoading: false, isSuccess: false, reset: vi.fn() },
    ] as ReturnType<typeof useSubmitResponseMutation>);
  });

  it('renders choice answers keyed by option ID', () => {
    const markup = renderToStaticMarkup(
      <MemoryRouter initialEntries={['/forms/form-1/fill']}>
        <Routes>
          <Route path="/forms/:id/fill" element={<FillPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(markup).toContain('Preferred contact');
    expect(markup).toContain('value="email-id"');
    expect(markup).toContain('value="phone-id"');
    expect(markup).toContain('Email');
    expect(markup).toContain('Phone');
  });
});
