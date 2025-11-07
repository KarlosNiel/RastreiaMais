"use client";

import { useEffect, useState } from "react";
import { meFetch, logout, MeResponse } from "@/lib/auth";

export function useAuth() {
  const [user, setUser] = useState<MeResponse["user"] | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadUser() {
    try {
      const me = await meFetch();
      setUser(me.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUser();

    // Atualiza automaticamente quando o login ou refresh for feito
    function handleRefresh() {
      loadUser();
    }
    window.addEventListener("tokenRefresh", handleRefresh);
    return () => window.removeEventListener("tokenRefresh", handleRefresh);
  }, []);

  return { user, loading, logout };
}
