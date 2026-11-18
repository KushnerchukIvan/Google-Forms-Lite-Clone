import { assertNever } from '@forms/shared';
import type { GetFormQuery } from '../api/generated';

type FormQuestion = NonNullable<GetFormQuery['form']>['questions'][number];

interface Props {
  question: FormQuestion;
  value: string[];
  onChange: (value: string[]) => void;
}

export function AnswerField({ question, value, onChange }: Props) {
  switch (question.type) {
    case 'TEXT':
      return (
        <input
          id={`answer-${question.id}`}
          className="field"
          value={value[0] ?? ''}
          placeholder="Your answer"
          onChange={(event) => {
            onChange([event.target.value]);
          }}
        />
      );
    case 'DATE':
      return (
        <input
          id={`answer-${question.id}`}
          className="field date-field"
          type="date"
          value={value[0] ?? ''}
          onChange={(event) => {
            onChange([event.target.value]);
          }}
        />
      );
    case 'MULTIPLE_CHOICE':
      return (
        <div className="choice-list">
          {question.options.map((option) => (
            <label className="choice" key={option.id}>
              <input
                type="radio"
                name={question.id}
                value={option.id}
                checked={value[0] === option.id}
                onChange={() => {
                  onChange([option.id]);
                }}
              />
              {option.label}
            </label>
          ))}
        </div>
      );
    case 'CHECKBOX':
      return (
        <div className="choice-list">
          {question.options.map((option) => (
            <label className="choice" key={option.id}>
              <input
                type="checkbox"
                value={option.id}
                checked={value.includes(option.id)}
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
      );
    default:
      return assertNever(question.type);
  }
}
