import { assertNever } from '@forms/shared';
import type { GetFormQuery } from '../api/generated';

type FormQuestion = NonNullable<GetFormQuery['form']>['questions'][number];

interface Props {
  question: FormQuestion;
  value: string[];
  onChange: (value: string[]) => void;
  invalid: boolean;
  errorId?: string;
}

export function AnswerField({
  question,
  value,
  onChange,
  invalid,
  errorId,
}: Props) {
  switch (question.type) {
    case 'TEXT':
      return (
        <>
          <label className="question-label" htmlFor={`answer-${question.id}`}>
            {question.title}
            {question.required && <span className="required"> *</span>}
          </label>
          <input
            id={`answer-${question.id}`}
            className="field"
            value={value[0] ?? ''}
            placeholder="Your answer"
            aria-invalid={invalid}
            aria-describedby={errorId}
            onChange={(event) => {
              onChange([event.target.value]);
            }}
          />
        </>
      );
    case 'DATE':
      return (
        <>
          <label className="question-label" htmlFor={`answer-${question.id}`}>
            {question.title}
            {question.required && <span className="required"> *</span>}
          </label>
          <input
            id={`answer-${question.id}`}
            className="field date-field"
            type="date"
            value={value[0] ?? ''}
            aria-invalid={invalid}
            aria-describedby={errorId}
            onChange={(event) => {
              onChange([event.target.value]);
            }}
          />
        </>
      );
    case 'MULTIPLE_CHOICE':
      return (
        <fieldset
          className="choice-fieldset"
          aria-invalid={invalid}
          aria-describedby={errorId}
        >
          <legend className="question-label">
            {question.title}
            {question.required && <span className="required"> *</span>}
          </legend>
          <div className="choice-list">
            {question.options.map((option) => (
              <label className="choice" key={option.id}>
                <input
                  type="radio"
                  name={question.id}
                  value={option.id}
                  checked={value[0] === option.id}
                  aria-invalid={invalid}
                  aria-describedby={errorId}
                  onChange={() => {
                    onChange([option.id]);
                  }}
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>
      );
    case 'CHECKBOX':
      return (
        <fieldset
          className="choice-fieldset"
          aria-invalid={invalid}
          aria-describedby={errorId}
        >
          <legend className="question-label">
            {question.title}
            {question.required && <span className="required"> *</span>}
          </legend>
          <div className="choice-list">
            {question.options.map((option) => (
              <label className="choice" key={option.id}>
                <input
                  type="checkbox"
                  value={option.id}
                  checked={value.includes(option.id)}
                  aria-invalid={invalid}
                  aria-describedby={errorId}
                  onChange={(event) => {
                    onChange(
                      event.target.checked
                        ? [...value, option.id]
                        : value.filter((item) => item !== option.id),
                    );
                  }}
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>
      );
    default:
      return assertNever(question.type);
  }
}
