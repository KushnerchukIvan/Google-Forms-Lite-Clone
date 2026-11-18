import { Link, useParams } from 'react-router-dom';
import { useGetFormQuery, useGetResponsesQuery } from '../api/enhanced';
import { formatAnswer } from '../services/answers';

export function ResponsesPage() {
  const { id = '' } = useParams();
  const formResult = useGetFormQuery({ id }, { skip: !id });
  const form = formResult.data?.form ?? null;
  const responsesResult = useGetResponsesQuery(
    { formId: id },
    { skip: !id || !form },
  );
  const responses = responsesResult.data?.responses ?? [];
  if (formResult.isLoading || responsesResult.isLoading)
    return <main className="page state">Loading responses…</main>;
  if (formResult.error)
    return (
      <main className="page state error">
        Could not load the form.{' '}
        <button
          className="text-button"
          onClick={() => void formResult.refetch()}
        >
          Try again
        </button>
      </main>
    );
  if (!form)
    return (
      <main className="page state">
        Form not found. <Link to="/">Go home</Link>
      </main>
    );
  if (responsesResult.error)
    return (
      <main className="page state error">
        Could not load responses.{' '}
        <button
          className="text-button"
          onClick={() => void responsesResult.refetch()}
        >
          Try again
        </button>
      </main>
    );

  return (
    <main className="page narrow">
      <Link className="back-link" to="/">
        ← All forms
      </Link>
      <div className="page-heading">
        <div>
          <p className="eyebrow">RESPONSES</p>
          <h1>{form.title}</h1>
          <p className="muted">
            {responses.length}{' '}
            {responses.length === 1 ? 'submission' : 'submissions'}
          </p>
        </div>
        <Link className="button secondary" to={`/forms/${form.id}/fill`}>
          Open form
        </Link>
      </div>
      {responses.length === 0 && (
        <div className="panel empty">
          <h2>No responses yet</h2>
          <p className="muted">Share the form to start collecting answers.</p>
        </div>
      )}
      {responses.map((response, index) => (
        <article className="panel response-card" key={response.id}>
          <div className="question-toolbar">
            <h2>Response {index + 1}</h2>
            <span className="meta">
              {new Date(response.submittedAt).toLocaleString()}
            </span>
          </div>
          {form.questions.map((question) => {
            const answer = response.answers.find(
              (item) => item.questionId === question.id,
            );
            return (
              <div className="response-answer" key={question.id}>
                <strong>{question.title}</strong>
                <p>
                  {formatAnswer(question, answer?.value ?? []).join(', ') || (
                    <span className="muted">No answer</span>
                  )}
                </p>
              </div>
            );
          })}
        </article>
      ))}
    </main>
  );
}
