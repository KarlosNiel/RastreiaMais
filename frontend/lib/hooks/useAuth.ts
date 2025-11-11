"use client";

import { useEffect, useState } from "react";
import { meFetch, logout, MeResponse } from "@/lib/auth";

// Singleton para evitar múltiplas instâncias
let globalUserState: {
  user: MeResponse["user"] | null;
  loading: boolean;
  listeners: Set<() => void>;
} = {
  user: null,
  loading: true,
  listeners: new Set(),
};

let loadUserPromise: Promise<void> | null = null;

async function loadUser() {
  if (loadUserPromise) return loadUserPromise;
  
  loadUserPromise = (async () => {
    try {
      // Só faz a chamada se houver token
      const token = localStorage.getItem("access") || sessionStorage.getItem("access");
      if (!token) {
        globalUserState.user = null;
        globalUserState.loading = false;
        notifyListeners();
        return;
      }

      const me = await meFetch();
      globalUserState.user = me.user;
    } catch {
      globalUserState.user = null;
    } finally {
      globalUserState.loading = false;
      notifyListeners();
    }
  })().finally(() => {
    loadUserPromise = null;
  });

  return loadUserPromise;
}

function notifyListeners() {
  globalUserState.listeners.forEach(listener => listener());
}

export function useAuth() {
  const [, forceUpdate] = useState({});

  const triggerUpdate = () => forceUpdate({});

  useEffect(() => {
    // Adiciona listener
    globalUserState.listeners.add(triggerUpdate);

    // Carrega usuário apenas se ainda não foi carregado
    if (globalUserState.loading && !loadUserPromise) {
      loadUser();
    }

    // Atualiza quando o token for renovado
    function handleRefresh() {
      // Só recarrega se não há token (logout) ou se há token mas não há usuário (login)
      const hasToken = !!(localStorage.getItem("access") || sessionStorage.getItem("access"));
      if (!hasToken || (hasToken && !globalUserState.user)) {
        globalUserState.loading = true;
        loadUser();
      }
    }
    
    // Verificação periódica de expiração do token (a cada 30 segundos)
    const checkTokenExpiry = () => {
      const timestamp = localStorage.getItem("token_timestamp") || sessionStorage.getItem("token_timestamp");
      if (timestamp) {
        const tokenTime = parseInt(timestamp, 10);
        const now = Date.now();
        const EXPIRY_TIME = 5 * 60 * 1000; // 5 minutos
        
        if (now - tokenTime > EXPIRY_TIME) {
          // Token expirou, fazer logout
          globalUserState.user = null;
          globalUserState.loading = false;
          
          // Limpar tokens
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          localStorage.removeItem("token_timestamp");
          sessionStorage.removeItem("access");
          sessionStorage.removeItem("refresh");
          sessionStorage.removeItem("token_timestamp");
          
          // Redirecionar para login
          if (typeof window !== "undefined") {
            const currentPath = window.location.pathname;
            if (!currentPath.startsWith("/auth/login")) {
              window.location.href = "/auth/login";
            }
          }
          
          notifyListeners();
        }
      }
    };

    const intervalId = setInterval(checkTokenExpiry, 30000); // Verifica a cada 30 segundos
    
    window.addEventListener("tokenRefresh", handleRefresh);

    return () => {
      globalUserState.listeners.delete(triggerUpdate);
      window.removeEventListener("tokenRefresh", handleRefresh);
      clearInterval(intervalId);
    };
  }, []);

  return { 
    user: globalUserState.user, 
    loading: globalUserState.loading, 
    logout: async () => {
      await logout();
      globalUserState.user = null;
      globalUserState.loading = false;
      notifyListeners();
    }
  };
}
