// Optional UI preferences must never prevent editing when storage is unavailable.
export const localPreferences = {
  getItem(key: string) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem(key: string, value: string) {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* Keep the in-memory state. */
    }
  },
  removeItem(key: string) {
    try {
      localStorage.removeItem(key);
    } catch {
      /* Storage is optional. */
    }
  },
};
