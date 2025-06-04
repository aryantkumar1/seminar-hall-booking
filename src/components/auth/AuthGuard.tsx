'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

interface AuthGuardProps {
  children: ReactNode;
  requiredRole: 'admin' | 'faculty';
  fallbackPath: string;
}

export function AuthGuard({ children, requiredRole, fallbackPath }: AuthGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);

  // Skip auth check for login and register pages
  const isAuthPage = pathname.includes('/login') || pathname.includes('/register');

  // Always call useAuth (Rules of Hooks)
  const { user, loading, sessionRecovered } = useAuth();

  // Mark as client-side after hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Listen for auth state changes from AuthContext and page visibility
  useEffect(() => {
    if (!isClient) return;

    const handleAuthStateChange = (event: CustomEvent) => {
      console.log('🛡️ AuthGuard: Received auth state change event', event.detail);
      setAuthChecked(false); // Reset to trigger new auth check
      setIsCheckingAuth(false); // Reset checking state
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🛡️ AuthGuard: Page became visible - handler disabled to prevent cross-tab issues');
        // DISABLED: This was causing cross-tab logout issues
      }
    };

    const handleFocus = () => {
      console.log('🛡️ AuthGuard: Window focused - handler disabled to prevent cross-tab issues');
      // DISABLED: This was causing cross-tab logout issues
    };

    const handleLoginSuccess = (event: CustomEvent) => {
      console.log('🛡️ AuthGuard: Login success event received', event.detail);
      setAuthChecked(true); // Mark as checked since login just succeeded
      setIsCheckingAuth(false); // Reset checking state
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'lastLoginTime') {
        console.log('🛡️ AuthGuard: Login detected in another tab');
        setAuthChecked(false); // Reset to trigger new auth check
        setIsCheckingAuth(false); // Reset checking state
      }
    };

    window.addEventListener('authStateChanged', handleAuthStateChange as EventListener);
    window.addEventListener('loginSuccess', handleLoginSuccess as EventListener);
    window.addEventListener('storage', handleStorageChange);
    // DISABLED: visibility and focus handlers to prevent cross-tab issues
    // document.addEventListener('visibilitychange', handleVisibilityChange);
    // window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('authStateChanged', handleAuthStateChange as EventListener);
      window.removeEventListener('loginSuccess', handleLoginSuccess as EventListener);
      window.removeEventListener('storage', handleStorageChange);
      // DISABLED: visibility and focus handlers to prevent cross-tab issues
      // document.removeEventListener('visibilitychange', handleVisibilityChange);
      // window.removeEventListener('focus', handleFocus);
    };
  }, [isClient]);

  useEffect(() => {
    console.log('🛡️ AuthGuard useEffect triggered:', {
      isAuthPage,
      isClient,
      loading,
      hasUser: !!user,
      userRole: user?.role,
      requiredRole,
      pathname,
      authChecked,
      sessionRecovered
    });

    // Skip auth check for login and register pages
    if (isAuthPage) {
      console.log('🛡️ AuthGuard: Skipping check - auth page');
      setAuthChecked(true);
      return;
    }

    // Don't check auth until client-side hydration is complete
    if (!isClient) {
      console.log('🛡️ AuthGuard: Waiting for client-side hydration');
      return;
    }

    // If AuthContext is still loading, wait for it to complete
    if (loading) {
      console.log('🛡️ AuthGuard: AuthContext still loading, waiting...');
      return;
    }

    // If we've already checked auth and found valid authentication, don't check again
    if (authChecked && (user?.role === requiredRole)) {
      console.log('🛡️ AuthGuard: Auth already verified, skipping check');
      return;
    }

    // Prevent multiple simultaneous auth checks
    if (isCheckingAuth) {
      console.log('🛡️ AuthGuard: Auth check already in progress, skipping');
      return;
    }

    // Add a small delay to ensure everything is properly initialized
    // Use longer delay if page was recently hidden (tab switching scenario)
    const wasHidden = document.hidden;
    const delay = wasHidden ? 500 : 200; // Longer delay if coming from hidden state

    const checkTimeout = setTimeout(() => {
      console.log('🛡️ AuthGuard: Running delayed auth check', { delay, wasHidden });
      setIsCheckingAuth(true);

      // Always check localStorage first, regardless of AuthContext state
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      console.log('🔍 AuthGuard: Direct localStorage check:', {
        hasToken: !!token,
        hasUserData: !!userData,
        tokenLength: token?.length || 0,
        userDataLength: userData?.length || 0
      });

      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          console.log('🔍 AuthGuard: Parsed user from localStorage:', {
            name: parsedUser.name,
            role: parsedUser.role,
            requiredRole
          });

          if (parsedUser.role === requiredRole) {
            console.log('✅ AuthGuard: Access granted via localStorage - user has correct role');
            setAuthChecked(true);
            setIsCheckingAuth(false);
            return;
          } else {
            console.log('❌ AuthGuard: Role mismatch in localStorage');
          }
        } catch (error) {
          console.log('❌ AuthGuard: Corrupted localStorage data:', error);
          // Clear corrupted data
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      }

      // If localStorage check fails, check AuthContext as backup
      if (user && user.role === requiredRole) {
        console.log('✅ AuthGuard: Access granted via AuthContext');
        setAuthChecked(true);
        setIsCheckingAuth(false);
        return;
      }

      // Only redirect if we're absolutely sure there's no valid authentication
      // Be more conservative to avoid redirecting during login flow

      // Case 1: Clear role mismatch with all data present
      if (token && userData && user && user.role !== requiredRole) {
        console.log('❌ AuthGuard: Role mismatch - redirecting to login');
        console.log('❌ Redirect reason:', {
          userRole: user?.role,
          requiredRole
        });
        setIsCheckingAuth(false);
        router.push(fallbackPath);
        return;
      }

      // Case 2: No authentication data at all (but be more conservative)
      if (!token && !userData && !user && !loading && isClient) {
        console.log('❌ AuthGuard: No authentication found - redirecting to login');
        setIsCheckingAuth(false);
        router.push(fallbackPath);
        return;
      }

      // Case 3: Partial auth data - wait for AuthContext to sync
      if ((token || userData) && !user && !loading) {
        console.log('🔄 AuthGuard: Have localStorage data but no user context, waiting...');
        setIsCheckingAuth(false);
        // Don't redirect yet, give AuthContext more time to sync
        return;
      }

      // Default: Inconclusive state, don't redirect
      console.log('🔄 AuthGuard: Inconclusive auth state, waiting for next check');
      setIsCheckingAuth(false);
    }, delay); // Dynamic delay based on page visibility state

    return () => clearTimeout(checkTimeout);
  }, [user, loading, router, isAuthPage, requiredRole, fallbackPath, isClient, pathname, authChecked]);

  // Always show children to avoid hydration issues
  // Auth checks happen in useEffect and will redirect if needed
  return <>{children}</>;
}
