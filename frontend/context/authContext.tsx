"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

function isBrowser() {
  return typeof window !== "undefined";
}

function getAccess(): string | null {
  try {
    if (!isBrowser()) return null;
    return localStorage.getItem("access") || sessionStorage.getItem("access");
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = getAccess();
    if (storedToken) setToken(storedToken);
    setLoading(false);

    // Escuta mudanças no localStorage para sincronizar entre abas
    const handleStorageChange = () => {
      const currentToken = getAccess();
      setToken(currentToken);
    };

    if (isBrowser()) {
      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('tokenRefresh', handleStorageChange);
      
      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('tokenRefresh', handleStorageChange);
      };
    }
  }, []);

  const contextValue = {
    token,
    setToken: (newToken: string | null) => {
      setToken(newToken);
      // Não gerenciamos o localStorage aqui - isso é feito pela lib/api.ts
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