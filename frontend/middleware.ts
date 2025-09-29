// frontend/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type Role = "PATIENT" | "PROFESSIONAL" | "MANAGER";
const ROLE_COOKIE = "role";

// Opcional: desligar o portal do paciente via flag
const ENABLE_PATIENT_PORTAL =
  process.env.NEXT_PUBLIC_ENABLE_PATIENT_PORTAL !== "false";

// Mapeamento de prefixo de rota -> papéis permitidos
const ACL: Array<{ prefix: string; roles: Role[]; enabled?: boolean }> = [
  { prefix: "/gestor", roles: ["MANAGER"] },
  { prefix: "/config", roles: ["MANAGER"] },
  { prefix: "/profissional", roles: ["PROFESSIONAL", "MANAGER"] },
  { prefix: "/pacientes", roles: ["PROFESSIONAL", "MANAGER"] },
  { prefix: "/me", roles: ["PATIENT"], enabled: ENABLE_PATIENT_PORTAL },
];

function redirectToLogin(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = "/auth/login";
  url.search = ""; // limpa query, opcional
  return NextResponse.redirect(url);
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const role = (req.cookies.get(ROLE_COOKIE)?.value ?? "") as Role | "";

  // Vê se a URL bate com algum prefixo protegido
  const rule = ACL.find((r) => pathname.startsWith(r.prefix));

  if (!rule) {
    // rota não protegida -> segue
    return NextResponse.next();
  }

  // rota protegida mas desabilitada por feature flag
  if (rule.enabled === false) {
    return redirectToLogin(req);
  }

  // sem papel -> manda pro login
  if (!role) {
    return redirectToLogin(req);
  }

  // papel não permitido -> login
  if (!rule.roles.includes(role)) {
    return redirectToLogin(req);
  }

  return NextResponse.next();
}

// Só roda nas áreas protegidas
export const config = {
  matcher: [
    "/gestor/:path*",
    "/config/:path*",
    "/profissional/:path*",
    "/pacientes/:path*",
    "/me/:path*",
  ],
};
