"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("access");
    if (storedToken) setToken(storedToken);
    setLoading(false);
  }, []);

  const contextValue = {
    token,
    setToken: (newToken: string | null) => {
      if (newToken) {
        localStorage.setItem("access", newToken);
      } else {
        localStorage.removeItem("access");
      }
      setToken(newToken);
    },
    isAuthenticated: !!token
  };

  if (loading) return null;

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}