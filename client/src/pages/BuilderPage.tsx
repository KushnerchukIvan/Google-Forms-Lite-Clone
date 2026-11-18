import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCreateFormMutation } from '../api/enhanced';
import { QuestionEditor } from '../components/QuestionEditor';
import {
  createQuestion,
  moveQuestion,
  validateDraft,
} from '../services/formBuilder';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  resetDraft,
  setDraft,
  type FormDraft,
  type FormDraftQuestion,
} from '../store/formsSlice';

export function BuilderPage() {
  const draft = useAppSelector((state) => state.formDraft);
  const dispatch = useAppDispatch();
  const [createForm, { isLoading, error }] = useCreateFormMutation();
  const [validationError, setValidationError] = useState<string | null>(null);
  const navigate = useNavigate();
  const updateDraft = (updater: (current: FormDraft) => FormDraft) =>
    dispatch(setDraft(updater(draft)));

  const updateQuestion = (index: number, question: FormDraftQuestion) => {
    updateDraft((current) => ({
      ...current,
      questions: current.questions.map((item, itemIndex) =>
        itemIndex === index ? question : item,
      ),
    }));
  };

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
            updateDraft((current) => ({
              ...current,
              title: event.target.value,
            }));
          }}
        />
        <textarea
          className="field textarea"
          value={draft.description}
          placeholder="Form description (optional)"
          onChange={(event) => {
            updateDraft((current) => ({
              ...current,
              description: event.target.value,
            }));
          }}
        />
      </section>
      {draft.questions.map((question, index) => (
        <QuestionEditor
          key={question.id}
          question={question}
          index={index}
          total={draft.questions.length}
          onChange={(updated) => {
            updateQuestion(index, updated);
          }}
          onRemove={() => {
            updateDraft((current) => ({
              ...current,
              questions: current.questions.filter(
                (_, itemIndex) => itemIndex !== index,
              ),
            }));
          }}
          onMove={(direction) => {
            updateDraft((current) => ({
              ...current,
              questions: moveQuestion(current.questions, index, direction),
            }));
          }}
        />
      ))}
      <section className="panel add-question">
        <h3>Add a question</h3>
        <div className="type-buttons">
          <button
            className="button secondary"
            onClick={() => {
              updateDraft((current) => ({
                ...current,
                questions: [...current.questions, createQuestion('TEXT')],
              }));
            }}
          >
            + Text
          </button>
          <button
            className="button secondary"
            onClick={() => {
              updateDraft((current) => ({
                ...current,
                questions: [
                  ...current.questions,
                  createQuestion('MULTIPLE_CHOICE'),
                ],
              }));
            }}
          >
            + Multiple choice
          </button>
          <button
            className="button secondary"
            onClick={() => {
              updateDraft((current) => ({
                ...current,
                questions: [...current.questions, createQuestion('CHECKBOX')],
              }));
            }}
          >
            + Checkboxes
          </button>
          <button
            className="button secondary"
            onClick={() => {
              updateDraft((current) => ({
                ...current,
                questions: [...current.questions, createQuestion('DATE')],
              }));
            }}
          >
            + Date
          </button>
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
