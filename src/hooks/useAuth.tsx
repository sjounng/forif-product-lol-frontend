"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@/types";
import {
  login,
  logout,
  signup,
} from "@/lib/api/auth";
import {
  refreshSession,
  subscribeToSessionExpiry,
} from "@/lib/api/client";

interface AuthContextValue {
  user: User | null;
  isLoggedIn: boolean;
  loading: boolean;
  signIn(email: string, password: string): Promise<void>;
  signUp(email: string, password: string, displayName: string): Promise<void>;
  signOut(): Promise<void>;
  updateCurrentUser(user: User): void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const unsubscribe = subscribeToSessionExpiry(() => {
      if (!active) return;
      setUser(null);
      setLoading(false);
    });
    refreshSession().then((restoredUser) => {
      if (!active) return;
      setUser(restoredUser);
      setLoading(false);
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoggedIn: user !== null,
      loading,
      async signIn(email, password) {
        const result = await login(email, password);
        setUser(result.user);
      },
      async signUp(email, password, displayName) {
        await signup(email, password, displayName);
        const result = await login(email, password);
        setUser(result.user);
      },
      async signOut() {
        try {
          await logout();
        } finally {
          setUser(null);
        }
      },
      updateCurrentUser(updatedUser) {
        setUser(updatedUser);
      },
    }),
    [loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
