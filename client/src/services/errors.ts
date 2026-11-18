const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const readMessages = (value: unknown): string | undefined => {
  if (!Array.isArray(value)) return undefined;
  const messages = value.flatMap((item) =>
    isRecord(item) && typeof item.message === 'string' ? [item.message] : [],
  );
  return messages.length > 0 ? messages.join('\n') : undefined;
};

export const getErrorMessage = (error: unknown): string | undefined => {
  if (typeof error === 'string' && error.trim()) return error;
  if (!isRecord(error)) return undefined;

  const data = isRecord(error.data) ? error.data : undefined;
  const response = isRecord(error.response) ? error.response : undefined;
  const graphQLErrors =
    readMessages(data?.errors) ?? readMessages(response?.errors);
  if (graphQLErrors) return graphQLErrors;
  if (typeof error.message === 'string' && error.message.trim()) {
    return error.message;
  }
  if (typeof error.error === 'string' && error.error.trim()) return error.error;
  return undefined;
};
