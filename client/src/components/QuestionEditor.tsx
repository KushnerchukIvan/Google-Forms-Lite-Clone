import type { FormDraftQuestion } from '../store/formsSlice';

interface Props {
  question: FormDraftQuestion;
  index: number;
  total: number;
  onChange: (question: FormDraftQuestion) => void;
  onRemove: () => void;
  onMove: (direction: -1 | 1) => void;
}

export function QuestionEditor({
  question,
  index,
  total,
  onChange,
  onRemove,
  onMove,
}: Props) {
  const updateOption = (optionId: string, label: string) => {
    onChange({
      ...question,
      options: question.options.map((option) =>
        option.id === optionId ? { ...option, label } : option,
      ),
    });
  };

  return (
    <section className="panel question-editor">
      <div className="question-toolbar">
        <span className="muted">Question {index + 1}</span>
        <div className="inline-actions">
          <button
            type="button"
            className="button secondary small"
            disabled={index === 0}
            onClick={() => {
              onMove(-1);
            }}
          >
            ↑
          </button>
          <button
            type="button"
            className="button secondary small"
            disabled={index === total - 1}
            onClick={() => {
              onMove(1);
            }}
          >
            ↓
          </button>
          <button
            type="button"
            className="button danger small"
            onClick={() => {
              onRemove();
            }}
          >
            Remove
          </button>
        </div>
      </div>
      <input
        className="field"
        value={question.title}
        placeholder="Question title"
        onChange={(event) => {
          onChange({ ...question, title: event.target.value });
        }}
      />
      <div className="question-toolbar">
        <label className="muted">{question.type.replace('_', ' ')}</label>
        <label className="check-label">
          <input
            type="checkbox"
            checked={question.required}
            onChange={(event) => {
              onChange({ ...question, required: event.target.checked });
            }}
          />{' '}
          Required
        </label>
      </div>
      {(question.type === 'MULTIPLE_CHOICE' ||
        question.type === 'CHECKBOX') && (
        <div className="option-list">
          {question.options.map((option) => (
            <div className="option-row" key={option.id}>
              <input
                className="field"
                value={option.label}
                onChange={(event) => {
                  updateOption(option.id, event.target.value);
                }}
              />
              <button
                type="button"
                className="icon-button"
                aria-label="Remove option"
                onClick={() => {
                  onChange({
                    ...question,
                    options: question.options.filter(
                      (item) => item.id !== option.id,
                    ),
                  });
                }}
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            className="text-button"
            onClick={() => {
              onChange({
                ...question,
                options: [
                  ...question.options,
                  {
                    id: crypto.randomUUID(),
                    label: `Option ${String(question.options.length + 1)}`,
                  },
                ],
              });
            }}
          >
            + Add option
          </button>
        </div>
      )}
    </section>
  );
}
