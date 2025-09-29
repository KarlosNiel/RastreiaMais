// frontend/app/dev/impersonate/route.ts
import { NextResponse } from "next/server";

type Role = "PATIENT" | "PROFESSIONAL" | "MANAGER";

export async function GET(req: Request) {
  const url = new URL(req.url);

  const rawRole = (url.searchParams.get("role") || "PATIENT") as string;
  const role: Role =
    rawRole === "MANAGER" || rawRole === "PROFESSIONAL"
      ? (rawRole as Role)
      : "PATIENT";

  const logout = url.searchParams.get("logout") === "1";
  const ttl = Number.parseInt(url.searchParams.get("ttl") || "3600", 10); // segundos

  // destino padrão por papel
  const fallback =
    role === "MANAGER"
      ? "/gestor"
      : role === "PROFESSIONAL"
        ? "/profissional"
        : "/me";

  // aceita apenas caminhos relativos seguros
  const toParam = url.searchParams.get("to");
  const to = toParam && toParam.startsWith("/") ? toParam : fallback;

  const res = NextResponse.redirect(new URL(to, req.url));

  if (logout) {
    // limpa cookie e segue para 'to' (ou fallback)
    res.cookies.set("role", "", { path: "/", maxAge: 0 });
    return res;
  }

  // marca Secure só quando estiver atrás de HTTPS (produção)
  const isHttps = req.headers.get("x-forwarded-proto") === "https";

  res.cookies.set("role", role, {
    path: "/",
    sameSite: "lax",
    maxAge: Number.isFinite(ttl) ? ttl : 3600,
    secure: isHttps,
    httpOnly: false, // precisa ser legível no client (Nav lê document.cookie)
  });

  return res;
}
