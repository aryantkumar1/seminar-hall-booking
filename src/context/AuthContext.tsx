'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'faculty';
  profilePicture?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  sessionRecovered: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: 'admin' | 'faculty') => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [sessionRecovered, setSessionRecovered] = useState(false);
  const { toast } = useToast();

  // Debug user state changes and emit events
  const setUserWithLogging = (newUser: User | null) => {
    console.log('👤 User state changing:', { from: user?.name || 'null', to: newUser?.name || 'null' });
    setUser(newUser);

    // Emit auth state change event for other components to listen
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('authStateChanged', {
        detail: { user: newUser }
      }));
    }
  };

  // Immediately restore user from localStorage if available
  const restoreUserFromStorage = (force = false) => {
    console.log('🔄 restoreUserFromStorage called', { force });
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      console.log('🔍 Checking localStorage on init:', {
        hasToken: !!token,
        hasUserData: !!userData,
        tokenLength: token?.length || 0,
        userDataLength: userData?.length || 0,
        currentUser: user?.name || 'null'
      });
      console.log('🔍 Raw userData:', userData);
      console.log('🔍 Raw token:', token?.substring(0, 20) + '...');

      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          console.log('🔄 About to set user:', parsedUser);

          // Always restore if forced, or if no current user, or if user data differs
          if (force || !user || user.id !== parsedUser.id || user.name !== parsedUser.name) {
            setUserWithLogging(parsedUser);
            setSessionRecovered(true);
            console.log('✅ Successfully restored user from localStorage:', parsedUser.name);
          } else {
            console.log('✅ User already matches localStorage, no update needed');
          }
        } catch (error) {
          console.error('❌ Failed to parse stored user data:', error);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          setUserWithLogging(null);
        }
      } else {
        console.log('❌ No valid localStorage data found');
        // NEVER clear user state in restoreUserFromStorage
        // The only way to clear should be explicit logout or server validation failure
        console.log('🔄 Keeping existing user state - localStorage restore should never clear user');
      }

      // Mark as initialized regardless of whether user was found
      console.log('🏁 Setting initialized=true, loading=false');
      setInitialized(true);
      setLoading(false);
    } else {
      console.log('❌ Window not available - server side');
    }
  };

  // Initialize auth state immediately on mount
  useEffect(() => {
    console.log('🚀 AuthContext: Initializing...');

    // Mark as client-side and restore user immediately
    setIsClient(true);

    // Restore user synchronously
    if (typeof window !== 'undefined') {
      console.log('🚀 AuthContext: Running immediate initialization');

      // Check if this is a page reload by looking at performance navigation
      const isReload = performance.navigation?.type === 1 ||
                      performance.getEntriesByType('navigation')[0]?.type === 'reload';

      console.log('🔍 Page load type:', { isReload });

      // Force restore on reload to ensure auth state is properly restored
      restoreUserFromStorage(isReload);
    }

    // Listen for auth changes (e.g., from other tabs)
    const handleAuthChange = () => {
      console.log('🔄 AuthContext: Auth change event received');
      restoreUserFromStorage();
    };

    // Listen for page visibility changes (tab switching) - DISABLED to prevent cross-tab issues
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🔄 AuthContext: Page became visible - visibility handler disabled to prevent cross-tab issues');
        // DISABLED: This was causing cross-tab logout issues
        // Only restore if we have localStorage data but no user context
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (!user && token && userData) {
          console.log('🔄 AuthContext: Restoring user on visibility change');
          try {
            const parsedUser = JSON.parse(userData);
            setUserWithLogging(parsedUser);
            setSessionRecovered(true);
          } catch (error) {
            console.error('❌ Failed to parse user data on visibility change:', error);
          }
        }
      }
    };

    // Listen for focus events (when user returns to tab) - DISABLED to prevent cross-tab issues
    const handleFocus = () => {
      console.log('🔄 AuthContext: Window focused - focus handler disabled to prevent cross-tab issues');
      // DISABLED: This was causing cross-tab logout issues
      // Only restore if we have localStorage data but no user context
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (!user && token && userData) {
        console.log('🔄 AuthContext: Restoring user on focus');
        try {
          const parsedUser = JSON.parse(userData);
          setUserWithLogging(parsedUser);
          setSessionRecovered(true);
        } catch (error) {
          console.error('❌ Failed to parse user data on focus:', error);
        }
      }
    };

    // Listen for storage changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' || e.key === 'user') {
        console.log('🔄 AuthContext: Storage changed from another tab', {
          key: e.key,
          oldValue: e.oldValue?.substring(0, 20) + '...',
          newValue: e.newValue?.substring(0, 20) + '...'
        });

        // ONLY sync if there's new auth data - NEVER clear
        if (e.newValue && e.key === 'user') {
          try {
            const newUser = JSON.parse(e.newValue);
            console.log('🔄 AuthContext: Syncing user from another tab:', newUser.name);

            // Only update if it's different from current user
            if (!user || user.id !== newUser.id || user.name !== newUser.name) {
              setUserWithLogging(newUser);
              setSessionRecovered(true);
              console.log('✅ Successfully synced user from another tab');
            } else {
              console.log('✅ User already matches, no sync needed');
            }
          } catch (error) {
            console.error('❌ Failed to parse user data from storage event:', error);
          }
        }
        // NEVER clear user state based on storage events from other tabs
        // The only way to clear should be explicit logout
      } else if (e.key === 'lastLoginTime') {
        // Another tab just logged in, check if we need to sync
        console.log('🔄 AuthContext: Login detected in another tab');
        setTimeout(() => {
          const token = localStorage.getItem('token');
          const userData = localStorage.getItem('user');

          if (token && userData && !user) {
            console.log('🔄 AuthContext: Syncing auth state after cross-tab login');
            try {
              const parsedUser = JSON.parse(userData);
              setUserWithLogging(parsedUser);
              setSessionRecovered(true);
            } catch (error) {
              console.error('❌ Failed to parse user data:', error);
            }
          }
        }, 50);
      }
    };

    window.addEventListener('authChanged', handleAuthChange);
    // DISABLED: visibility and focus handlers to prevent cross-tab issues
    // document.addEventListener('visibilitychange', handleVisibilityChange);
    // window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('authChanged', handleAuthChange);
      // DISABLED: visibility and focus handlers to prevent cross-tab issues
      // document.removeEventListener('visibilitychange', handleVisibilityChange);
      // window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const checkAuth = async () => {
    try {
      // Check if we're in the browser environment
      if (typeof window === 'undefined') {
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        setUserWithLogging(null);
        setLoading(false);
        return;
      }

      console.log('🔍 Validating token with server...');
      const response = await api.getCurrentUser();

      if (response.data?.user) {
        // Update user data from server
        setUserWithLogging(response.data.user);
        // Also update localStorage with fresh data
        localStorage.setItem('user', JSON.stringify(response.data.user));
        console.log('✅ Auth validated with server:', response.data.user.name);
      } else if (response.error) {
        // Handle different types of errors
        const currentPath = window.location.pathname;
        const isLoginPage = currentPath.includes('/login') || currentPath.includes('/register');

        console.warn('⚠️ Server validation failed:', response.error);

        if (!isLoginPage) {
          // Only clear user/token if it's actually invalid (401/403), not for network errors
          if (response.error.includes('401') || response.error.includes('403') || response.error.includes('Unauthorized')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUserWithLogging(null);
            console.log('🚫 Invalid token, cleared auth data');
          } else {
            console.log('🔄 Network/server error, keeping existing auth data');
            // Don't clear user - keep them logged in with cached data
          }
        } else {
          // On login pages, silently clear invalid tokens
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUserWithLogging(null);
        }
      } else {
        // No data and no error - unexpected response
        console.warn('⚠️ Unexpected server response:', response);
        console.log('🔄 Keeping existing auth data due to unexpected response');
      }
    } catch (error) {
      // Don't log errors on login pages - they're expected
      const currentPath = window.location.pathname;
      const isLoginPage = currentPath.includes('/login') || currentPath.includes('/register');

      if (!isLoginPage) {
        console.warn('Auth check network error:', error);
        // Don't clear user data for network errors - user might still be authenticated
        console.log('🔄 Network error during auth check, keeping existing session');
      }

      // Only clear auth data if it's clearly an auth error, not a network error
      if (error instanceof Error && error.message.includes('401')) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
        setUserWithLogging(null);
        console.log('🚫 Auth error, cleared auth data');
      }
    } finally {
      setLoading(false);
    }
  };

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🔐 AuthContext login called');
      const response = await api.login(email, password);
      console.log('🔐 AuthContext login response:', response);

      if (response.error) {
        toast({
          title: 'Login Failed',
          description: response.error,
          variant: 'destructive',
        });
        return false;
      }

      if (response.data?.user) {
        console.log('🔐 Setting user in AuthContext:', response.data.user);

        // Store user data in localStorage FIRST to ensure it's available immediately
        localStorage.setItem('user', JSON.stringify(response.data.user));
        console.log('🔐 User stored in localStorage via AuthContext');

        // Then update the context state
        setUserWithLogging(response.data.user);
        setSessionRecovered(true);
        setLoading(false); // Ensure loading is false after successful login

        // Emit additional event to notify components
        window.dispatchEvent(new CustomEvent('loginSuccess', {
          detail: { user: response.data.user }
        }));

        // Also emit a cross-tab login event
        localStorage.setItem('lastLoginTime', Date.now().toString());

        toast({
          title: 'Login Successful',
          description: `Welcome back, ${response.data.user.name}!`,
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Login Failed',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
      return false;
    }
  }, [toast]);

  const register = useCallback(async (
    name: string, 
    email: string, 
    password: string, 
    role: 'admin' | 'faculty'
  ): Promise<boolean> => {
    try {
      const response = await api.register(name, email, password, role);
      
      if (response.error) {
        toast({
          title: 'Registration Failed',
          description: response.error,
          variant: 'destructive',
        });
        return false;
      }

      if (response.data?.user) {
        setUserWithLogging(response.data.user);
        // Store user data in localStorage for persistence
        localStorage.setItem('user', JSON.stringify(response.data.user));
        toast({
          title: 'Registration Successful',
          description: `Welcome to HallHub, ${response.data.user.name}!`,
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: 'Registration Failed',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
      return false;
    }
  }, [toast]);

  const logout = useCallback(async () => {
    try {
      await api.logout();
      setUserWithLogging(null);
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out',
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear user state even if API call fails
      setUserWithLogging(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }, [toast]);

  const refreshUser = useCallback(async () => {
    try {
      const response = await api.getCurrentUser();
      if (response.data?.user) {
        setUserWithLogging(response.data.user);
      }
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  }, []);

  const refreshAuth = useCallback(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    sessionRecovered,
    login,
    register,
    logout,
    refreshUser,
    refreshAuth,
  };

  // Don't show loading screen to avoid hydration issues
  // Just let the children render and handle auth in AuthGuard

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
