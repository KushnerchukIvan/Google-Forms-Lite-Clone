import { renderToStaticMarkup } from 'react-dom/server';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { BuilderPage } from './BuilderPage';
import { store } from '../store/store';

describe('BuilderPage', () => {
  it('renders a labeled form title input', () => {
    const markup = renderToStaticMarkup(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/forms/new']}>
          <BuilderPage />
        </MemoryRouter>
      </Provider>,
    );

    expect(markup).toContain('Form title');
    expect(markup).toContain('id="form-title"');
    expect(markup).toContain('+ Text');
    expect(markup).toContain('+ Multiple choice');
    expect(markup).toContain('+ Checkboxes');
    expect(markup).toContain('+ Date');
  });
});
