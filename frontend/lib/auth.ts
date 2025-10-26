import { cookies } from "next/headers";
import { useContext } from "react";
import { AuthContext } from "@/context/authContext";

export type Role = "PATIENT" | "PROFESSIONAL" | "MANAGER";

export async function getRole(): Promise<Role | null> {
  const cookieStore = await cookies();
  const r = cookieStore.get("role")?.value as Role | undefined;
  return r ?? null;
}

import { post } from "./api";

export async function login(username: string, password: string) {
  try {
    const res = await post<{ access?: string; token?: string }>("/api/token/", {
      username,
      password,
    });

    console.log("Resposta do servidor:", res); // Log para verificar a resposta

    const token = res.access ?? res.token;
    if (!token) throw new Error("Token não recebido do servidor");

    localStorage.setItem("access", token);
    console.log("Token armazenado:", token); // Log para confirmar que o token foi armazenado
    return token;
  } catch (err: any) {
    console.error("Erro ao fazer login:", err); // Log do erro
    throw new Error(err?.message ?? "Erro ao fazer login");
  }
}


