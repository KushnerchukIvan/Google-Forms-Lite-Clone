import { Link } from 'react-router-dom';
import { FORM_LIMITS } from '@forms/shared';
import { QuestionEditor } from '../components/QuestionEditor';
import { useFormBuilder } from '../hooks/useFormBuilder';

const questionTypes = [
  { type: 'TEXT', label: 'Text' },
  { type: 'MULTIPLE_CHOICE', label: 'Multiple choice' },
  { type: 'CHECKBOX', label: 'Checkboxes' },
  { type: 'DATE', label: 'Date' },
] as const;

export function BuilderPage() {
  const {
    draft,
    validationErrors,
    isLoading,
    errorMessage,
    setTitle,
    setDescription,
    addQuestion,
    updateQuestion,
    addOption,
    updateOption,
    removeOption,
    removeQuestion,
    moveQuestion,
    save,
  } = useFormBuilder();
  return (
    <main className="page narrow">
      <Link className="back-link" to="/">
        ← All forms
      </Link>
      <div className="page-heading">
        <div>
          <p className="eyebrow">FORM BUILDER</p>
          <h1>Create a form</h1>
          <p className="muted">
            Add a title and the questions you want to ask.
          </p>
        </div>
      </div>
      <section className="panel builder-intro">
        <label className="question-label" htmlFor="form-title">
          Form title
        </label>
        <input
          id="form-title"
          className="field"
          maxLength={FORM_LIMITS.formTitle}
          aria-invalid={Boolean(validationErrors?.title)}
          aria-describedby={
            validationErrors?.title ? 'form-title-error' : undefined
          }
          value={draft.title}
          placeholder="Untitled form"
          onChange={(event) => setTitle(event.target.value)}
        />
        {validationErrors?.title && (
          <p
            id="form-title-error"
            className="error-message"
            role="alert"
            aria-live="polite"
          >
            {validationErrors.title}
          </p>
        )}
        <textarea
          className="field textarea"
          maxLength={FORM_LIMITS.description}
          aria-label="Form description"
          aria-invalid={Boolean(validationErrors?.description)}
          aria-describedby={
            validationErrors?.description ? 'form-description-error' : undefined
          }
          value={draft.description}
          placeholder="Form description (optional)"
          onChange={(event) => setDescription(event.target.value)}
        />
        {validationErrors?.description && (
          <p
            id="form-description-error"
            className="error-message"
            role="alert"
            aria-live="polite"
          >
            {validationErrors.description}
          </p>
        )}
      </section>
      {draft.questions.map((question, index) => (
        <QuestionEditor
          key={question.id}
          question={question}
          index={index}
          total={draft.questions.length}
          {...(validationErrors?.questions[question.id]
            ? { error: validationErrors.questions[question.id] }
            : {})}
          onChange={(changes) => updateQuestion(question.id, changes)}
          onOptionAdd={(option) => addOption(question.id, option)}
          onOptionChange={(optionId, label) =>
            updateOption(question.id, optionId, label)
          }
          onOptionRemove={(optionId) => removeOption(question.id, optionId)}
          onRemove={() => removeQuestion(question.id)}
          onMove={(direction) => moveQuestion(question.id, direction)}
        />
      ))}
      <section className="panel add-question">
        <h3>Add a question</h3>
        <div className="type-buttons">
          {questionTypes.map(({ type, label }) => (
            <button
              key={type}
              type="button"
              className="button secondary"
              onClick={() => addQuestion(type)}
            >
              + {label}
            </button>
          ))}
        </div>
        {validationErrors?.form && (
          <p className="error-message" role="alert" aria-live="polite">
            {validationErrors.form}
          </p>
        )}
      </section>
      {errorMessage && (
        <p className="error-message" role="alert" aria-live="polite">
          {errorMessage}
        </p>
      )}
      <div className="bottom-actions">
        <button
          className="button"
          disabled={isLoading}
          onClick={() => void save()}
        >
          {isLoading ? 'Saving…' : 'Save form'}
        </button>
      </div>
    </main>
  );
}
