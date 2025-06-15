import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

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

// Demo users - hardcoded untuk memastikan login berfungsi
const DEMO_USERS = [
  {
    id: '1',
    name: 'Administrator Rentalinx',
    email: 'admin@rentalinx.com',
    password: 'Admin123!',
    role: 'admin' as const,
    isActive: true,
    createdAt: new Date(),
    permissions: ['all']
  },
  {
    id: '2',
    name: 'Manager Rentalinx',
    email: 'manager@rentalinx.com',
    password: 'password123',
    role: 'manager' as const,
    isActive: true,
    createdAt: new Date(),
    permissions: ['dashboard', 'customers', 'vehicles', 'reports', 'maintenance', 'vendors', 'kir', 'tax', 'pricing', 'hpp', 'invoices']
  },
  {
    id: '3',
    name: 'Sari Telemarketing Mobil',
    email: 'sari.mobil@rentalinx.com',
    password: 'password123',
    role: 'telemarketing-mobil' as const,
    isActive: true,
    createdAt: new Date(),
    permissions: ['customers']
  },
  {
    id: '4',
    name: 'Budi Telemarketing Bus',
    email: 'budi.bus@rentalinx.com',
    password: 'password123',
    role: 'telemarketing-bus' as const,
    isActive: true,
    createdAt: new Date(),
    permissions: ['customers']
  }
];

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

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log('🔍 Checking demo users...');
      
      // Check credentials against demo users
      const foundUser = DEMO_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());

      console.log('📊 User lookup result:', { 
        userFound: !!foundUser, 
        email: email 
      });

      if (!foundUser) {
        console.log('❌ No user found with email:', email);
        return { success: false, error: 'Email atau password salah' };
      }

      console.log('👤 Found user:', { 
        id: foundUser.id, 
        email: foundUser.email, 
        role: foundUser.role,
        isActive: foundUser.isActive 
      });

      // Check if user is active
      if (!foundUser.isActive) {
        console.log('❌ User account is inactive');
        return { success: false, error: 'Akun Anda telah dinonaktifkan. Hubungi administrator.' };
      }

      // Validate password (direct comparison for demo)
      console.log('🔐 Validating password...');
      
      console.log('🔍 Password validation:', { 
        inputPassword: password, 
        storedPassword: foundUser.password,
        match: password === foundUser.password 
      });

      if (password !== foundUser.password) {
        console.log('❌ Password mismatch');
        return { success: false, error: 'Email atau password salah' };
      }

      console.log('✅ Password validated successfully');

      // Create user session
      const userSession: User = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role,
        isActive: foundUser.isActive,
        createdAt: foundUser.createdAt,
        lastLogin: new Date(),
        permissions: foundUser.permissions
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

      // Check if user exists in demo users
      const userExists = DEMO_USERS.some(u => u.email.toLowerCase() === email.toLowerCase());

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