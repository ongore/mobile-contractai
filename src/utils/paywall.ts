import RevenueCatUI from 'react-native-purchases-ui';

/**
 * Present the native RevenueCat Customer Center (manage subscription,
 * request refunds, contact support). The paywall itself is a custom screen —
 * navigate to `Paywall` from the main stack instead of calling into RN UI.
 */
export async function presentCustomerCenter(): Promise<void> {
  await RevenueCatUI.presentCustomerCenter();
}
