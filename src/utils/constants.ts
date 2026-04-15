/**
 * API base URL. Can be overridden via environment variable.
 */
export const API_BASE_URL =
  (process.env.API_BASE_URL as string) || 'http://localhost:3001';

/**
 * Free tier contract limit.
 */
export const FREE_CONTRACT_LIMIT = 1;

/**
 * TanStack Query cache keys.
 */
export const QUERY_KEYS = {
  CONTRACTS: 'contracts',
  CONTRACT: 'contract',
  ME: 'me',
} as const;

/**
 * AsyncStorage keys.
 */
export const STORAGE_KEYS = {
  AUTH: 'auth-storage',
  HAS_SEEN_ONBOARDING: 'has_seen_onboarding',
  DEVICE_ID: 'device_id',
} as const;

/**
 * Contract status polling interval in milliseconds.
 */
export const POLLING_INTERVAL_MS = 10_000;

/**
 * OTP code length.
 */
export const OTP_LENGTH = 6;

/**
 * Maximum image size in bytes for base64 upload.
 * Default: 4 MB
 */
export const MAX_IMAGE_SIZE_BYTES = 4 * 1024 * 1024;
