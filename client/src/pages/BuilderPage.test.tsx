// @vitest-environment jsdom

import { fireEvent, render, screen, cleanup } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { BuilderPage } from './BuilderPage';
import { createAppStore } from '../store/store';

afterEach(cleanup);

describe('BuilderPage', () => {
  it('adds a question and shows validation beside the invalid field', () => {
    const store = createAppStore();

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/forms/new']}>
          <BuilderPage />
        </MemoryRouter>
      </Provider>,
    );

    fireEvent.change(screen.getByLabelText('Form title'), {
      target: { value: 'Weekend plans' },
    });
    fireEvent.click(screen.getByRole('button', { name: '+ Text' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save form' }));

    const title = screen.getByRole('textbox', { name: 'Question title' });
    expect(title.getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByRole('alert').textContent).toContain(
      'Every question needs a title.',
    );
  });
});
