import type { AnswerInput, Form, QuestionInput } from './generated/graphql.js';
import { assertNever } from './assertNever.js';
import { isValidDate } from './dates.js';
import { FORM_LIMITS } from './limits.js';

export type FormValidationQuestion = Pick<
  QuestionInput,
  'id' | 'title' | 'type' | 'required' | 'options'
> & {
  order?: number;
};

export interface FormValidationInput {
  title: string;
  description?: string | null;
  questions: readonly FormValidationQuestion[];
}

export type ValidationTarget =
  | { field: 'title' | 'description' | 'questions' }
  | { questionId: string };

export interface ValidationProblem {
  target: ValidationTarget;
  message: string;
}

type AnswerValidationForm = Pick<Form, 'questions'>;

const questionProblem = (questionId: string, message: string) => ({
  target: { questionId },
  message,
});

export const validateFormInput = (
  input: FormValidationInput,
): ValidationProblem[] => {
  const problems: ValidationProblem[] = [];
  const title = input.title.trim();

  if (!title) {
    problems.push({
      target: { field: 'title' },
      message: 'Enter a form title.',
    });
  } else if (title.length > FORM_LIMITS.formTitle) {
    problems.push({
      target: { field: 'title' },
      message: `Form titles can be at most ${String(FORM_LIMITS.formTitle)} characters.`,
    });
  }

  if ((input.description?.length ?? 0) > FORM_LIMITS.description) {
    problems.push({
      target: { field: 'description' },
      message: `Descriptions can be at most ${String(FORM_LIMITS.description)} characters.`,
    });
  }

  if (input.questions.length === 0) {
    problems.push({
      target: { field: 'questions' },
      message: 'Add at least one question.',
    });
  } else if (input.questions.length > FORM_LIMITS.questions) {
    problems.push({
      target: { field: 'questions' },
      message: `Forms can have at most ${String(FORM_LIMITS.questions)} questions.`,
    });
  }

  const questionIds = new Set<string>();
  for (const question of input.questions) {
    if (questionIds.has(question.id)) {
      problems.push(
        questionProblem(question.id, 'Question IDs must be unique.'),
      );
    } else {
      questionIds.add(question.id);
    }

    const questionTitle = question.title.trim();
    if (!questionTitle) {
      problems.push(
        questionProblem(question.id, 'Every question needs a title.'),
      );
    } else if (questionTitle.length > FORM_LIMITS.questionTitle) {
      problems.push(
        questionProblem(
          question.id,
          `Question titles can be at most ${String(FORM_LIMITS.questionTitle)} characters.`,
        ),
      );
    }

    if (
      question.type === 'MULTIPLE_CHOICE' ||
      question.type === 'CHECKBOX'
    ) {
      if (question.options.length < 2) {
        problems.push(
          questionProblem(
            question.id,
            'Choice questions need at least two options.',
          ),
        );
      }
      if (question.options.length > FORM_LIMITS.optionsPerQuestion) {
        problems.push(
          questionProblem(
            question.id,
            `Questions can have at most ${String(FORM_LIMITS.optionsPerQuestion)} options.`,
          ),
        );
      }
      const optionIds = question.options.map((option) => option.id);
      if (new Set(optionIds).size !== optionIds.length) {
        problems.push(
          questionProblem(question.id, 'Option IDs must be unique.'),
        );
      }
      const labels = question.options.map((option) => option.label.trim());
      if (labels.some((label) => !label)) {
        problems.push(
          questionProblem(
            question.id,
            'Choice options need non-empty labels.',
          ),
        );
      }
      if (labels.some((label) => label.length > FORM_LIMITS.optionLabel)) {
        problems.push(
          questionProblem(
            question.id,
            `Option labels can be at most ${String(FORM_LIMITS.optionLabel)} characters.`,
          ),
        );
      }
      if (
        new Set(labels.map((label) => label.toLowerCase())).size !==
        labels.length
      ) {
        problems.push(
          questionProblem(
            question.id,
            'Choice options must be unique, ignoring case.',
          ),
        );
      }
    } else if (question.options.length > 0) {
      problems.push(
        questionProblem(
          question.id,
          'Only choice questions can have options.',
        ),
      );
    }
  }

  return problems;
};

export const validateAnswerInput = (
  form: AnswerValidationForm,
  answers: readonly AnswerInput[],
): ValidationProblem[] => {
  const problems: ValidationProblem[] = [];
  const questionById = new Map(
    form.questions.map((question) => [question.id, question]),
  );
  const submittedIds = new Set<string>();

  for (const answer of answers) {
    const question = questionById.get(answer.questionId);
    if (!question) {
      problems.push(
        questionProblem(
          answer.questionId,
          'An answer references a question outside this form.',
        ),
      );
      continue;
    }
    if (submittedIds.has(answer.questionId)) {
      problems.push(
        questionProblem(
          answer.questionId,
          'Each question can be answered only once.',
        ),
      );
      continue;
    }
    submittedIds.add(answer.questionId);

    if (question.required && answer.value.every((value) => !value.trim())) {
      problems.push(
        questionProblem(question.id, `“${question.title}” is required.`),
      );
      continue;
    }
    if (answer.value.some((value) => !value.trim())) {
      problems.push(
        questionProblem(question.id, 'Answers cannot contain empty values.'),
      );
      continue;
    }

    switch (question.type) {
      case 'TEXT':
        if (answer.value.length > 1) {
          problems.push(
            questionProblem(question.id, 'Text questions accept one value.'),
          );
        }
        if (answer.value.some((value) => value.length > FORM_LIMITS.answerText)) {
          problems.push(
            questionProblem(
              question.id,
              `Text answers can be at most ${String(FORM_LIMITS.answerText)} characters.`,
            ),
          );
        }
        break;
      case 'MULTIPLE_CHOICE':
        if (answer.value.length > 1) {
          problems.push(
            questionProblem(
              question.id,
              'Multiple choice questions accept one value.',
            ),
          );
        }
        problems.push(...validateChoiceAnswer(question, answer));
        break;
      case 'CHECKBOX':
        if (answer.value.length > question.options.length) {
          problems.push(
            questionProblem(
              question.id,
              'Too many checkbox values were submitted.',
            ),
          );
        }
        problems.push(...validateChoiceAnswer(question, answer));
        break;
      case 'DATE':
        if (
          answer.value.length !== 1 ||
          !isValidDate(answer.value[0] ?? '')
        ) {
          problems.push(
            questionProblem(
              question.id,
              'Date answers must use YYYY-MM-DD format.',
            ),
          );
        }
        break;
      default:
        assertNever(question.type);
    }
  }

  for (const question of form.questions) {
    if (question.required && !submittedIds.has(question.id)) {
      problems.push(
        questionProblem(question.id, `“${question.title}” is required.`),
      );
    }
  }

  return problems;
};

const validateChoiceAnswer = (
  question: AnswerValidationForm['questions'][number],
  answer: AnswerInput,
): ValidationProblem[] => {
  const problems: ValidationProblem[] = [];
  const allowed = new Set(question.options.map((option) => option.id));
  if (answer.value.some((value) => !allowed.has(value))) {
    problems.push(
      questionProblem(
        question.id,
        `An answer for "${question.title}" is not one of its options.`,
      ),
    );
  }
  if (new Set(answer.value).size !== answer.value.length) {
    problems.push(
      questionProblem(question.id, 'Duplicate option values are not allowed.'),
    );
  }
  return problems;
};
