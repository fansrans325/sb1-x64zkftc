import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasPermission: (permission: string) => boolean;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkExistingSession = () => {
      try {
        console.log('🔍 Checking for existing session...');
        const savedUser = localStorage.getItem('rentalinx_user');
        const sessionExpiry = localStorage.getItem('rentalinx_session_expiry');
        
        console.log('Saved user exists:', !!savedUser);
        console.log('Session expiry exists:', !!sessionExpiry);
        
        if (savedUser && sessionExpiry) {
          const expiryDate = new Date(sessionExpiry);
          const now = new Date();
          console.log('Session expiry:', expiryDate);
          console.log('Current time:', now);
          console.log('Session valid:', expiryDate > now);
          
          if (expiryDate > now) {
            const userData = JSON.parse(savedUser);
            setUser(userData);
            console.log('✅ Restored user session:', userData.email, userData.role);
          } else {
            // Session expired
            localStorage.removeItem('rentalinx_user');
            localStorage.removeItem('rentalinx_session_expiry');
            console.log('⏰ Session expired, cleared storage');
          }
        } else {
          console.log('❌ No saved session found');
        }
      } catch (error) {
        console.error('❌ Error checking existing session:', error);
        localStorage.removeItem('rentalinx_user');
        localStorage.removeItem('rentalinx_session_expiry');
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingSession();
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean = false): Promise<{ success: boolean; error?: string }> => {
    console.log('🔐 Login attempt for:', email);
    setIsLoading(true);
    
    try {
      // Input validation
      if (!email || !password) {
        console.log('❌ Missing email or password');
        return { success: false, error: 'Email dan password harus diisi' };
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        console.log('❌ Invalid email format');
        return { success: false, error: 'Format email tidak valid' };
      }

      console.log('🔍 Checking Supabase database for user...');
      
      // Check credentials against Supabase users table
      const { data: users, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .limit(1);

      if (fetchError) {
        console.error('❌ Database error:', fetchError);
        return { success: false, error: 'Terjadi kesalahan sistem. Silakan coba lagi.' };
      }

      console.log('📊 Database query result:', { 
        usersFound: users?.length || 0,
        email: email 
      });

      if (!users || users.length === 0) {
        console.log('❌ No user found with email:', email);
        return { success: false, error: 'Email atau password salah' };
      }

      const foundUser = users[0];
      console.log('👤 Found user in database:', { 
        id: foundUser.id, 
        email: foundUser.email, 
        role: foundUser.role,
        isActive: foundUser.is_active 
      });

      // Check if user is active
      if (!foundUser.is_active) {
        console.log('❌ User account is inactive');
        return { success: false, error: 'Akun Anda telah dinonaktifkan. Hubungi administrator.' };
      }

      // Validate password (hash comparison)
      console.log('🔐 Validating password...');
      const hashedInputPassword = await hashPassword(password);
      
      console.log('🔍 Password validation:', { 
        hashedInput: hashedInputPassword.substring(0, 20) + '...',
        storedHash: foundUser.password_hash?.substring(0, 20) + '...',
        match: hashedInputPassword === foundUser.password_hash 
      });

      if (hashedInputPassword !== foundUser.password_hash) {
        console.log('❌ Password mismatch');
        return { success: false, error: 'Email atau password salah' };
      }

      console.log('✅ Password validated successfully');

      // Update last login
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', foundUser.id);

      // Create user session
      const userSession: User = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role,
        isActive: foundUser.is_active,
        createdAt: new Date(foundUser.created_at),
        lastLogin: new Date(),
        permissions: foundUser.permissions || []
      };

      console.log('👤 Creating user session:', userSession.email, userSession.role);
      
      // Store session BEFORE setting user state
      const sessionDuration = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 8 * 60 * 60 * 1000; // 30 days or 8 hours
      const expiryDate = new Date(Date.now() + sessionDuration);
      
      localStorage.setItem('rentalinx_user', JSON.stringify(userSession));
      localStorage.setItem('rentalinx_session_expiry', expiryDate.toISOString());

      console.log('💾 Session stored with expiry:', expiryDate);
      
      // Set user state AFTER storing session
      setUser(userSession);
      
      console.log('🎉 Login successful!');
      
      return { success: true };
    } catch (error) {
      console.error('❌ Login error:', error);
      return { success: false, error: 'Terjadi kesalahan sistem. Silakan coba lagi.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    console.log('👋 Logging out user');
    setUser(null);
    localStorage.removeItem('rentalinx_user');
    localStorage.removeItem('rentalinx_session_expiry');
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.permissions.includes('all')) return true;
    return user.permissions.includes(permission);
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Input validation
      if (!email) {
        return { success: false, error: 'Email harus diisi' };
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { success: false, error: 'Format email tidak valid' };
      }

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Check if user exists
      const { data: users, error } = await supabase
        .from('users')
        .select('email')
        .eq('email', email.toLowerCase())
        .limit(1);

      if (error) {
        console.error('Database error:', error);
        return { success: false, error: 'Terjadi kesalahan sistem. Silakan coba lagi.' };
      }

      // Don't reveal if email exists or not for security
      return { success: true };
    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, error: 'Terjadi kesalahan sistem. Silakan coba lagi.' };
    }
  };

  console.log('🔄 AuthContext state:', { 
    isAuthenticated: !!user, 
    isLoading, 
    userRole: user?.role,
    userName: user?.name 
  });

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user,
    hasPermission,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper function to hash password (same as backend)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}