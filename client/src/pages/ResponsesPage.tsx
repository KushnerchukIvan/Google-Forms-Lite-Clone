import { Link } from 'react-router-dom';
import { useResponses } from '../hooks/useResponses';

export function ResponsesPage() {
  const {
    form,
    responses,
    responseCountLabel,
    isLoading,
    formError,
    formErrorMessage,
    refetchForm,
    responsesError,
    responsesErrorMessage,
    refetchResponses,
  } = useResponses();

  if (isLoading) return <main className="page state">Loading responses…</main>;
  if (formError)
    return (
      <main className="page state error">
        {formErrorMessage}{' '}
        <button className="text-button" onClick={() => void refetchForm()}>
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
  if (responsesError)
    return (
      <main className="page state error">
        {responsesErrorMessage}{' '}
        <button
          className="text-button"
          onClick={() => void refetchResponses()}
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
          <p className="muted">{responseCountLabel}</p>
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
      {responses.map((response) => (
        <article className="panel response-card" key={response.id}>
          <div className="question-toolbar">
            <h2>{response.label}</h2>
            <span className="meta">{response.submittedDate}</span>
          </div>
          {response.answers.map((answer) => (
            <div className="response-answer" key={answer.questionId}>
              <strong>{answer.questionTitle}</strong>
              <p>
                {answer.values.join(', ') || (
                  <span className="muted">No answer</span>
                )}
              </p>
            </div>
          ))}
        </article>
      ))}
    </main>
  );
}
