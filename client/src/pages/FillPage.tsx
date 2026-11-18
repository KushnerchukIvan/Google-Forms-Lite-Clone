import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useGetFormQuery, useSubmitResponseMutation } from '../api/enhanced';
import { AnswerField } from '../components/AnswerField';
import { getErrorMessage } from '../services/errors';
import { toAnswerInputs, validateResponse } from '../services/answers';

export function FillPage() {
  const { id = '' } = useParams();
  const formResult = useGetFormQuery({ id }, { skip: !id });
  const form = formResult.data?.form ?? null;
  const [values, setValues] = useState<Record<string, string[]>>({});
  const [submitResponse, result] = useSubmitResponseMutation();
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [serverError, setServerError] = useState<string | null>(null);

  const setValue = (questionId: string, value: string[]) => {
    setValues((current) => ({ ...current, [questionId]: value }));
    setValidationErrors((current) => {
      if (!current[questionId]) return current;
      return Object.fromEntries(
        Object.entries(current).filter(([id]) => id !== questionId),
      );
    });
  };
  const submit = async () => {
    if (!form) return;
    const validation = validateResponse(form, values);
    setValidationErrors(validation);
    setServerError(null);
    if (Object.keys(validation).length > 0) return;
    try {
      await submitResponse({
        formId: form.id,
        answers: toAnswerInputs(values),
      }).unwrap();
    } catch (error) {
      setServerError(
        getErrorMessage(error) ??
          'Your response could not be submitted. Please try again.',
      );
    }
  };

  if (formResult.isLoading)
    return <main className="page state">Loading form…</main>;
  if (formResult.error)
    return (
      <main className="page state error">
        Could not load this form.{' '}
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
  if (result.isSuccess)
    return (
      <main className="page narrow">
        <div className="panel success-panel">
          <div className="success-mark">✓</div>
          <h1>Response submitted!</h1>
          <p className="muted">Your answers have been recorded.</p>
          <button
            type="button"
            className="button secondary"
            onClick={() => {
              result.reset();
              setValues({});
              setValidationErrors({});
              setServerError(null);
            }}
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
      {serverError && (
        <p className="error-message" role="alert" aria-live="polite">
          {serverError}
        </p>
      )}
      <button
        type="button"
        className="button"
        disabled={result.isLoading}
        onClick={() => void submit()}
      >
        {result.isLoading ? 'Submitting…' : 'Submit response'}
      </button>
    </main>
  );
}
