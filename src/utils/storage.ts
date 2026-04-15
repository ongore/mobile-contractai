import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Typed wrappers around AsyncStorage.
 */
export const storage = {
  /**
   * Store a value. Objects are JSON-serialised automatically.
   */
  setItem: async <T>(key: string, value: T): Promise<void> => {
    const serialised =
      typeof value === 'string' ? value : JSON.stringify(value);
    await AsyncStorage.setItem(key, serialised);
  },

  /**
   * Retrieve a value. Pass a type parameter to get typed output.
   * Returns null if the key doesn't exist.
   */
  getItem: async <T>(key: string): Promise<T | null> => {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) {
      return null;
    }
    try {
      return JSON.parse(raw) as T;
    } catch {
      return raw as unknown as T;
    }
  },

  /**
   * Remove a single key.
   */
  removeItem: async (key: string): Promise<void> => {
    await AsyncStorage.removeItem(key);
  },

  /**
   * Remove multiple keys at once.
   */
  multiRemove: async (keys: string[]): Promise<void> => {
    await AsyncStorage.multiRemove(keys);
  },

  /**
   * Clear ALL keys from AsyncStorage. Use with caution.
   */
  clear: async (): Promise<void> => {
    await AsyncStorage.clear();
  },

  /**
   * Get all keys stored in AsyncStorage.
   */
  getAllKeys: async (): Promise<readonly string[]> => {
    return AsyncStorage.getAllKeys();
  },
};
