import {Platform} from 'react-native';
import Purchases, {LOG_LEVEL} from 'react-native-purchases';

/**
 * RevenueCat configuration for Clerra.
 *
 * Swap the API keys for your real production keys before shipping. The test key
 * below works for sandbox/simulator flows only.
 */
const API_KEYS = {
  ios:     'test_ybzrKTRdOksAhAdxdXmtWYwkxvb',
  android: 'test_ybzrKTRdOksAhAdxdXmtWYwkxvb',
};

/** Entitlement identifier configured in the RevenueCat dashboard. */
export const ENTITLEMENT_ID = 'Clerra Pro';

/** Product / package identifiers used on the default offering. */
export const PACKAGES = {
  monthly: 'monthly',
  yearly:  'yearly',
} as const;

let configured = false;

/**
 * Initializes the Purchases SDK. Safe to call multiple times — only the first
 * call configures the SDK. Call `identifyUser` separately once you know the
 * authenticated user's ID.
 */
export function initRevenueCat(): void {
  if (configured) return;

  if (__DEV__) Purchases.setLogLevel(LOG_LEVEL.DEBUG);

  const apiKey = Platform.select(API_KEYS);
  if (!apiKey) return;

  Purchases.configure({apiKey});
  configured = true;
}

/** Link the current authenticated user to their RevenueCat customer record. */
export async function identifyUser(userId: string): Promise<void> {
  if (!configured) initRevenueCat();
  try {
    await Purchases.logIn(userId);
  } catch (e) {
    if (__DEV__) console.warn('[RevenueCat] logIn failed', e);
  }
}

/** Reset to an anonymous RevenueCat user (call on sign-out). */
export async function resetUser(): Promise<void> {
  if (!configured) return;
  try {
    await Purchases.logOut();
  } catch (e) {
    if (__DEV__) console.warn('[RevenueCat] logOut failed', e);
  }
}
