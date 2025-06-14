// Security utilities for the application

export const sanitizeInput = (input: string): string => {
  // Remove potentially dangerous characters
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password minimal 8 karakter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password harus mengandung huruf kecil');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password harus mengandung huruf besar');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password harus mengandung angka');
  }
  
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password harus mengandung karakter khusus');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const generateSecureToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

export const hashPassword = async (password: string): Promise<string> => {
  // In a real application, use bcrypt or similar
  // This is a simplified version for demo purposes
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const isSecureContext = (): boolean => {
  return window.isSecureContext || location.protocol === 'https:';
};

export const logSecurityEvent = (event: string, details?: any): void => {
  // In production, send to security monitoring service
  console.log(`[SECURITY] ${event}`, details);
};

// Rate limiting utility
class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();
  
  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 15 * 60 * 1000 // 15 minutes
  ) {}
  
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const record = this.attempts.get(identifier);
    
    if (!record || now > record.resetTime) {
      this.attempts.set(identifier, { count: 1, resetTime: now + this.windowMs });
      return true;
    }
    
    if (record.count >= this.maxAttempts) {
      return false;
    }
    
    record.count++;
    return true;
  }
  
  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }
  
  getRemainingTime(identifier: string): number {
    const record = this.attempts.get(identifier);
    if (!record) return 0;
    
    const now = Date.now();
    return Math.max(0, record.resetTime - now);
  }
}

export const loginRateLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes

// CSRF protection
export const generateCSRFToken = (): string => {
  return generateSecureToken();
};

export const validateCSRFToken = (token: string, storedToken: string): boolean => {
  return token === storedToken;
};

// Session management
export const isSessionValid = (sessionData: any): boolean => {
  if (!sessionData) return false;
  
  const expiryTime = new Date(sessionData.expiryTime);
  return expiryTime > new Date();
};

export const extendSession = (sessionData: any, extensionMs: number = 30 * 60 * 1000): any => {
  return {
    ...sessionData,
    expiryTime: new Date(Date.now() + extensionMs).toISOString()
  };
};