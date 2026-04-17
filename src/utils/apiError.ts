/**
 * Readable message from an axios/fetch-style error object.
 */
export function getApiErrorMessage(err: unknown, fallback: string): string {
  const e = err as {
    response?: {data?: {message?: string; data?: {message?: string}}};
    message?: string;
  };
  const d = e?.response?.data;
  if (d && typeof d === 'object') {
    if (typeof d.message === 'string' && d.message.length > 0) {
      return d.message;
    }
    if (
      d.data &&
      typeof d.data === 'object' &&
      typeof d.data.message === 'string' &&
      d.data.message.length > 0
    ) {
      return d.data.message;
    }
  }
  if (!e?.response && e?.message === 'Network Error') {
    return (
      'Cannot reach the server. Start the backend (cd backend && npm run dev). ' +
      'On a physical phone, set API_BASE_URL to http://YOUR-COMPUTER-IP:3001/api (not localhost).'
    );
  }
  return fallback;
}

/** Alias for backwards-compatibility with new screens. */
export const extractApiError = getApiErrorMessage;
