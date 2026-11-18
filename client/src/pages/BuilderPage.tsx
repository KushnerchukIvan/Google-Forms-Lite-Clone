import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FORM_LIMITS } from '@forms/shared';
import { useCreateFormMutation } from '../api/enhanced';
import { QuestionEditor } from '../components/QuestionEditor';
import {
  createQuestion,
  hasDraftValidationErrors,
  validateDraft,
  type DraftValidationErrors,
} from '../services/formBuilder';
import { getErrorMessage } from '../services/errors';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  addOption,
  addQuestion,
  moveQuestion,
  removeOption,
  removeQuestion,
  resetDraft,
  setDescription,
  setTitle,
  updateOption,
  updateQuestion,
} from '../store/formsSlice';

const questionTypes = [
  { type: 'TEXT', label: 'Text' },
  { type: 'MULTIPLE_CHOICE', label: 'Multiple choice' },
  { type: 'CHECKBOX', label: 'Checkboxes' },
  { type: 'DATE', label: 'Date' },
] as const;

export function BuilderPage() {
  const draft = useAppSelector((state) => state.formDraft);
  const dispatch = useAppDispatch();
  const [createForm, { isLoading, error }] = useCreateFormMutation();
  const [validationErrors, setValidationErrors] =
    useState<DraftValidationErrors | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const navigate = useNavigate();

  const save = async () => {
    const validation = validateDraft(draft);
    setValidationErrors(validation);
    setServerError(null);
    if (hasDraftValidationErrors(validation)) return;
    try {
      const result = await createForm({
        title: draft.title,
        description: draft.description,
        questions: draft.questions.map((question, order) => ({
          ...question,
          order,
        })),
      }).unwrap();
      dispatch(resetDraft());
      void navigate(`/forms/${result.createForm.id}/fill`);
    } catch (error) {
      setServerError(
        getErrorMessage(error) ??
          'The form could not be saved. Please try again.',
      );
    }
  };

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
          onChange={(event) => {
            dispatch(setTitle(event.target.value));
          }}
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
          onChange={(event) => {
            dispatch(setDescription(event.target.value));
          }}
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
          onChange={(changes) => {
            dispatch(updateQuestion({ id: question.id, changes }));
          }}
          onOptionAdd={(option) => {
            dispatch(addOption({ questionId: question.id, option }));
          }}
          onOptionChange={(optionId, label) => {
            dispatch(
              updateOption({ questionId: question.id, optionId, label }),
            );
          }}
          onOptionRemove={(optionId) => {
            dispatch(removeOption({ questionId: question.id, optionId }));
          }}
          onRemove={() => {
            dispatch(removeQuestion(question.id));
          }}
          onMove={(direction) => {
            dispatch(moveQuestion({ id: question.id, direction }));
          }}
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
              onClick={() => {
                dispatch(addQuestion(createQuestion(type)));
              }}
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
      {(serverError || error) && (
        <p className="error-message" role="alert" aria-live="polite">
          {serverError ?? getErrorMessage(error) ?? 'Something went wrong.'}
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
