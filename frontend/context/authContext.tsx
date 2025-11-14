"use client";

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
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = getAccess();
    if (storedToken) setTokenState(storedToken);
    setLoading(false);

    // Escuta mudanças no localStorage para sincronizar entre abas
    const handleStorageChange = () => {
      const currentToken = getAccess();
      setTokenState(currentToken);
    };

    if (isBrowser()) {
      window.addEventListener("storage", handleStorageChange);
      window.addEventListener("tokenRefresh", handleStorageChange);

      return () => {
        window.removeEventListener("storage", handleStorageChange);
        window.removeEventListener("tokenRefresh", handleStorageChange);
      };
    }
  }, []);

  const setToken = (newToken: string | null) => {
    // Atualiza o estado do React
    setTokenState(newToken);

    // Atualiza o storage
    if (newToken) {
      localStorage.setItem("access", newToken);
    } else {
      localStorage.removeItem("access");
    }

    // Dispara evento para avisar toda a aplicação
    window.dispatchEvent(new Event("tokenRefresh"));
  };

  const contextValue = {
    token,
    setToken,
    isAuthenticated: !!token,
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
