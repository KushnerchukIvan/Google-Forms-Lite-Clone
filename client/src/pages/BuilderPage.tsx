import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCreateFormMutation } from '../api/enhanced';
import { QuestionEditor } from '../components/QuestionEditor';
import { createQuestion, validateDraft } from '../services/formBuilder';
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
  const [validationError, setValidationError] = useState<string | null>(null);
  const navigate = useNavigate();

  const save = async () => {
    const validation = validateDraft(draft);
    setValidationError(validation);
    if (validation) return;
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
    } catch {
      setValidationError('The form could not be saved. Please try again.');
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
          value={draft.title}
          placeholder="Untitled form"
          onChange={(event) => {
            dispatch(setTitle(event.target.value));
          }}
        />
        <textarea
          className="field textarea"
          value={draft.description}
          placeholder="Form description (optional)"
          onChange={(event) => {
            dispatch(setDescription(event.target.value));
          }}
        />
      </section>
      {draft.questions.map((question, index) => (
        <QuestionEditor
          key={question.id}
          question={question}
          index={index}
          total={draft.questions.length}
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
      </section>
      {(validationError || error) && (
        <p className="error-message">
          {validationError ?? 'Something went wrong.'}
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
