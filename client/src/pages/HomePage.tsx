import { Link } from 'react-router-dom';
import { useGetFormsQuery } from '../api/enhanced';

export function HomePage() {
  const { data, isLoading, error, refetch } = useGetFormsQuery(undefined);
  const forms = data?.forms ?? [];
  return (
    <main className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">WORKSPACE</p>
          <h1>Your forms</h1>
          <p className="muted">
            Create forms, collect answers and review submissions.
          </p>
        </div>
        <Link className="button" to="/forms/new">
          + Create new form
        </Link>
      </div>
      {isLoading && <p className="state">Loading forms…</p>}
      {error && (
        <div className="state error">
          Could not load forms.{' '}
          <button className="text-button" onClick={() => void refetch()}>
            Try again
          </button>
        </div>
      )}
      {!isLoading && !error && forms.length === 0 && (
        <div className="empty panel">
          <h2>No forms yet</h2>
          <p className="muted">
            Create your first form to start collecting responses.
          </p>
          <Link className="button" to="/forms/new">
            Create a form
          </Link>
        </div>
      )}
      <div className="form-grid">
        {forms.map((form) => (
          <article className="panel form-card" key={form.id}>
            <div className="form-icon">▤</div>
            <h2>{form.title}</h2>
            <p className="muted clamp">
              {form.description || 'No description'}
            </p>
            <p className="meta">
              {form.questions.length} questions · Created{' '}
              {new Date(form.createdAt).toLocaleDateString()}
            </p>
            <div className="card-actions">
              <Link className="button" to={`/forms/${form.id}/fill`}>
                View Form
              </Link>
              <Link
                className="button secondary"
                to={`/forms/${form.id}/responses`}
              >
                View Responses
              </Link>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
