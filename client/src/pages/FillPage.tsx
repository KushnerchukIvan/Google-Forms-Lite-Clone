import { Link } from 'react-router-dom';
import { AnswerField } from '../components/AnswerField';
import { useFormFill } from '../hooks/useFormFill';

export function FillPage() {
  const {
    form,
    values,
    validationErrors,
    isLoading,
    loadError,
    refetch,
    isSubmitted,
    isSubmitting,
    submitErrorMessage,
    setValue,
    submit,
    submitAnotherResponse,
  } = useFormFill();

  if (isLoading) return <main className="page state">Loading form…</main>;
  if (loadError)
    return (
      <main className="page state error">
        Could not load this form.{' '}
        <button className="text-button" onClick={() => void refetch()}>
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
  if (isSubmitted)
    return (
      <main className="page narrow">
        <div className="panel success-panel">
          <div className="success-mark">✓</div>
          <h1>Response submitted!</h1>
          <p className="muted">Your answers have been recorded.</p>
          <button
            type="button"
            className="button secondary"
            onClick={submitAnotherResponse}
          >
            Submit another response
          </button>
          <Link to="/" className="button">
            Back to forms
          </Link>
        </div>
      </main>
    );

  return (
    <main className="page narrow">
      <Link className="back-link" to="/">
        ← All forms
      </Link>
      <header className="panel form-header">
        <p className="eyebrow">FORM</p>
        <h1>{form.title}</h1>
        {form.description && <p className="muted">{form.description}</p>}
      </header>
      {form.questions.map((question) => (
        <section className="panel answer-card" key={question.id}>
          <AnswerField
            question={question}
            value={values[question.id] ?? []}
            invalid={Boolean(validationErrors[question.id])}
            {...(validationErrors[question.id]
              ? { errorId: `answer-error-${question.id}` }
              : {})}
            onChange={(value) => {
              setValue(question.id, value);
            }}
          />
          {validationErrors[question.id] && (
            <p
              id={`answer-error-${question.id}`}
              className="error-message"
              role="alert"
              aria-live="polite"
            >
              {validationErrors[question.id]}
            </p>
          )}
        </section>
      ))}
      {submitErrorMessage && (
        <p className="error-message" role="alert" aria-live="polite">
          {submitErrorMessage}
        </p>
      )}
      <button
        type="button"
        className="button"
        disabled={isSubmitting}
        onClick={() => void submit()}
      >
        {isSubmitting ? 'Submitting…' : 'Submit response'}
      </button>
    </main>
  );
}
