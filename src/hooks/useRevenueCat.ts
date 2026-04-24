import {useCallback, useEffect, useState} from 'react';
import Purchases, {
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage,
} from 'react-native-purchases';
import {ENTITLEMENT_ID} from '@/config/revenueCat';

interface RevenueCatState {
  customerInfo: CustomerInfo | null;
  offering:     PurchasesOffering | null;
  isPro:        boolean;
  loading:      boolean;

  purchasePackage: (pkg: PurchasesPackage) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  refresh: () => Promise<void>;
}

/**
 * Single source of truth for subscription state. Use anywhere in the app to
 * gate Pro-only features: `const {isPro} = useRevenueCat();`
 */
export function useRevenueCat(): RevenueCatState {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [offering,     setOffering]     = useState<PurchasesOffering | null>(null);
  const [loading,      setLoading]      = useState(true);

  const refresh = useCallback(async () => {
    try {
      const [info, offerings] = await Promise.all([
        Purchases.getCustomerInfo(),
        Purchases.getOfferings(),
      ]);
      setCustomerInfo(info);
      setOffering(offerings.current ?? null);
    } catch (e) {
      if (__DEV__) console.warn('[RevenueCat] refresh failed', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const listener = Purchases.addCustomerInfoUpdateListener(setCustomerInfo);
    return () => {
      // RN SDK returns an EmitterSubscription-like object
      // @ts-ignore - `remove` exists at runtime
      listener?.remove?.();
    };
  }, [refresh]);

  const purchasePackage = useCallback(async (pkg: PurchasesPackage) => {
    try {
      const {customerInfo: info} = await Purchases.purchasePackage(pkg);
      setCustomerInfo(info);
      return info.entitlements.active[ENTITLEMENT_ID] !== undefined;
    } catch (e: any) {
      if (!e?.userCancelled && __DEV__) {
        console.warn('[RevenueCat] purchase failed', e);
      }
      return false;
    }
  }, []);

  const restorePurchases = useCallback(async () => {
    try {
      const info = await Purchases.restorePurchases();
      setCustomerInfo(info);
      return info.entitlements.active[ENTITLEMENT_ID] !== undefined;
    } catch (e) {
      if (__DEV__) console.warn('[RevenueCat] restore failed', e);
      return false;
    }
  }, []);

  const isPro =
    customerInfo?.entitlements.active[ENTITLEMENT_ID] !== undefined;

  return {customerInfo, offering, isPro, loading, purchasePackage, restorePurchases, refresh};
}
