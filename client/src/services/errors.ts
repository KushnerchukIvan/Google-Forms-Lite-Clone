export const getErrorMessage = (
  error: { message?: string } | null | undefined,
): string | undefined => error?.message;
