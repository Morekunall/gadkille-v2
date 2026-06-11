/**
 * Extract a user-facing message from an axios/API error.
 */
export function getApiErrorMessage(err, fallback = 'Something went wrong.') {
  const data = err?.response?.data;
  if (data?.message) return data.message;
  if (typeof data === 'string' && data.trim()) return data;
  if (err?.request && !err?.response) {
    return 'Cannot reach server. Check your connection or try again in a minute.';
  }
  if (err?.message) return err.message;
  return fallback;
}
