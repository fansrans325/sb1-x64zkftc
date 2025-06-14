import { useState, useEffect } from 'react';
import { generateSecureToken } from '../utils/security';

interface SecureStorageOptions {
  encrypt?: boolean;
  expiry?: number; // in milliseconds
}

export const useSecureStorage = <T>(
  key: string, 
  defaultValue: T, 
  options: SecureStorageOptions = {}
) => {
  const [value, setValue] = useState<T>(defaultValue);
  const [isLoading, setIsLoading] = useState(true);

  // Simple encryption/decryption (in production, use proper encryption)
  const encrypt = (data: string): string => {
    if (!options.encrypt) return data;
    return btoa(data); // Base64 encoding (not secure, use proper encryption in production)
  };

  const decrypt = (data: string): string => {
    if (!options.encrypt) return data;
    try {
      return atob(data);
    } catch {
      return data; // Return as-is if decryption fails
    }
  };

  const getStoredValue = (): T => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;

      const decryptedItem = decrypt(item);
      const parsedItem = JSON.parse(decryptedItem);

      // Check expiry
      if (options.expiry && parsedItem.expiry) {
        if (new Date(parsedItem.expiry) < new Date()) {
          localStorage.removeItem(key);
          return defaultValue;
        }
        return parsedItem.value;
      }

      return parsedItem;
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);
      return defaultValue;
    }
  };

  const setStoredValue = (newValue: T): void => {
    try {
      let dataToStore: any = newValue;

      // Add expiry if specified
      if (options.expiry) {
        dataToStore = {
          value: newValue,
          expiry: new Date(Date.now() + options.expiry).toISOString()
        };
      }

      const serializedValue = JSON.stringify(dataToStore);
      const encryptedValue = encrypt(serializedValue);
      localStorage.setItem(key, encryptedValue);
      setValue(newValue);
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error);
    }
  };

  const removeStoredValue = (): void => {
    try {
      localStorage.removeItem(key);
      setValue(defaultValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  };

  useEffect(() => {
    const storedValue = getStoredValue();
    setValue(storedValue);
    setIsLoading(false);
  }, [key]);

  return {
    value,
    setValue: setStoredValue,
    removeValue: removeStoredValue,
    isLoading
  };
};

// Hook for secure session management
export const useSecureSession = () => {
  const sessionKey = 'rentalinx_secure_session';
  const csrfKey = 'rentalinx_csrf_token';

  const { value: session, setValue: setSession, removeValue: removeSession } = useSecureStorage(
    sessionKey,
    null,
    { encrypt: true, expiry: 8 * 60 * 60 * 1000 } // 8 hours
  );

  const { value: csrfToken, setValue: setCSRFToken } = useSecureStorage(
    csrfKey,
    generateSecureToken(),
    { encrypt: false }
  );

  const createSession = (userData: any, rememberMe: boolean = false) => {
    const sessionData = {
      user: userData,
      createdAt: new Date().toISOString(),
      csrfToken: generateSecureToken(),
      rememberMe
    };

    setSession(sessionData);
    setCSRFToken(sessionData.csrfToken);
    
    return sessionData;
  };

  const validateSession = (): boolean => {
    if (!session) return false;
    
    // Additional validation logic can be added here
    const sessionAge = Date.now() - new Date(session.createdAt).getTime();
    const maxAge = session.rememberMe ? 30 * 24 * 60 * 60 * 1000 : 8 * 60 * 60 * 1000; // 30 days or 8 hours
    
    return sessionAge < maxAge;
  };

  const destroySession = () => {
    removeSession();
    setCSRFToken(generateSecureToken());
  };

  return {
    session,
    csrfToken,
    createSession,
    validateSession,
    destroySession,
    isValid: validateSession()
  };
};