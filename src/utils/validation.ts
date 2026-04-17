const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

/** Validates a 10-digit US phone number (digits only, no formatting). */
export function validatePhoneDigits(digits: string): boolean {
  return /^\d{10}$/.test(digits);
}

/** Strips all non-digit characters from a phone string. */
export function stripPhoneFormatting(phone: string): string {
  return phone.replace(/\D/g, '');
}

/** Formats 10 raw digits as (555) 555-5555. */
export function formatPhoneDisplay(digits: string): string {
  const d = digits.replace(/\D/g, '').slice(0, 10);
  if (d.length <= 3)  return d;
  if (d.length <= 6)  return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

/** Converts 10-digit string to E.164 with +1 country code. */
export function toE164(digits: string): string {
  const clean = digits.replace(/\D/g, '');
  return `+1${clean}`;
}
