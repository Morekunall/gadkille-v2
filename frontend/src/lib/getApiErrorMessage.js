/**
 * Extract a user-facing message from an axios/API error.
 */
export function getApiErrorMessage(err, fallback = 'Something went wrong.') {
  const data = err?.response?.data;
  if (data?.message) return data.message;
  if (typeof data === 'string' && data.trim()) {
    const text = data.trim();
    if (text.startsWith('<!DOCTYPE') || text.startsWith('<html')) {
      const status = err?.response?.status;
      if (status === 404) {
        return 'API route not found. Restart the backend server or redeploy the latest backend code.';
      }
      return fallback;
    }
    return text;
  }
  if (err?.request && !err?.response) {
    return 'Cannot reach server. Check your connection or try again in a minute.';
  }
  if (err?.message) return err.message;
  return fallback;
}
