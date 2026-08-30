'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id?: string;
  name: string;
  email: string;
  avatar?: string;
  isGuest?: boolean;
}

export interface RateLimitInfo {
  limit: number;
  used: number;
  remaining: number;
  usageFormatted: string;
  remainingFormatted: string;
  resetAt: string | null;
  resetMessage?: string;
  isGuest?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  rateLimit: RateLimitInfo;
  setRateLimit: React.Dispatch<React.SetStateAction<RateLimitInfo>>;
  refreshRateLimit: () => Promise<void>;
  loginWithCredential: (credential: string) => Promise<boolean>;
  logout: () => void;
  loginAsGuest: (name?: string, email?: string) => void;
}

const DEFAULT_AUTH_RATE_LIMIT: RateLimitInfo = {
  limit: 67,
  used: 0,
  remaining: 67,
  usageFormatted: '0/67 roasts used this 24 hr',
  remainingFormatted: '67/67 roasts remaining',
  resetAt: null,
  resetMessage: 'Limits will reset on next day at current generation time',
  isGuest: false,
};

const DEFAULT_GUEST_RATE_LIMIT: RateLimitInfo = {
  limit: 1,
  used: 0,
  remaining: 1,
  usageFormatted: '0/1 roast used (Guest Trial)',
  remainingFormatted: '1/1 roast remaining (Sign in with Google for 67 roasts)',
  resetAt: null,
  resetMessage: 'Guest users are limited to 1 roast generation per 24 hours',
  isGuest: true,
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null;
    const savedUser = localStorage.getItem('jaas_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        console.error('Failed to parse saved user:', e);
      }
    }
    return null;
  });

  const [rateLimit, setRateLimit] = useState<RateLimitInfo>(() => {
    if (user) {
      return user.isGuest ? DEFAULT_GUEST_RATE_LIMIT : DEFAULT_AUTH_RATE_LIMIT;
    }
    return DEFAULT_GUEST_RATE_LIMIT;
  });

  const refreshRateLimit = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/judge/rate-limit`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.rateLimit) {
          setRateLimit(data.rateLimit);
        }
      }
    } catch (err) {
      console.warn('Could not refresh rate limit status:', err);
    }
  };

  useEffect(() => {
    let isMounted = true;
    fetch(`${API_BASE_URL}/api/judge/rate-limit`, {
      credentials: 'include',
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data?.rateLimit) {
          setRateLimit(data.rateLimit);
        }
      })
      .catch((err) => {
        console.warn('Could not refresh rate limit status:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  const loginWithCredential = async (credential: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ credential }),
      });

      const data = await res.json();
      if (data.success) {
        let decodedPayload: { name?: string; email?: string; picture?: string } = {};
        try {
          const base64Url = credential.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split('')
              .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );
          decodedPayload = JSON.parse(jsonPayload);
        } catch (err) {
          console.warn('Could not decode JWT payload directly:', err);
        }

        const newUser: User = {
          id: data.user?.id,
          name: data.user?.name || decodedPayload.name || 'Google User',
          email: data.user?.email || decodedPayload.email || 'user@gmail.com',
          avatar: data.user?.avatar || decodedPayload.picture || 'https://api.dicebear.com/7.x/pixel-art/svg?seed=jaas',
          isGuest: false,
        };

        setUser(newUser);
        setRateLimit(DEFAULT_AUTH_RATE_LIMIT);
        localStorage.setItem('jaas_user', JSON.stringify(newUser));
        refreshRateLimit();
        return true;
      }
    } catch (err) {
      console.error('Google Auth Error:', err);
    }
    return false;
  };

  const loginAsGuest = async (name = 'Guest User', email = 'guest@windows.xp') => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (e) {
      console.warn('Clear cookies on guest login call notice:', e);
    }
    const guestUser: User = {
      name,
      email,
      avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=' + name,
      isGuest: true,
    };
    setUser(guestUser);
    setRateLimit(DEFAULT_GUEST_RATE_LIMIT);
    localStorage.setItem('jaas_user', JSON.stringify(guestUser));
    refreshRateLimit();
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (e) {
      console.warn('Logout API call notice:', e);
    }
    setUser(null);
    setRateLimit(DEFAULT_GUEST_RATE_LIMIT);
    localStorage.removeItem('jaas_user');
    refreshRateLimit();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        rateLimit,
        setRateLimit,
        refreshRateLimit,
        loginWithCredential,
        logout,
        loginAsGuest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
