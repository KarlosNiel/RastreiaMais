// frontend/middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

type Role = "PATIENT" | "PROFESSIONAL" | "MANAGER";
const ROLE_COOKIE = "role";

const ENABLE_PATIENT_PORTAL =
  process.env.NEXT_PUBLIC_ENABLE_PATIENT_PORTAL !== "false";

/** ACL: prefixo protegido → papéis permitidos */
const ACL: Array<{ prefix: string; roles: Role[]; enabled?: boolean }> = [
  { prefix: "/gestor", roles: ["MANAGER"] },
  { prefix: "/config", roles: ["MANAGER"] },
  { prefix: "/profissional", roles: ["PROFESSIONAL", "MANAGER"] },
  { prefix: "/pacientes", roles: ["PROFESSIONAL", "MANAGER"] },
  { prefix: "/cadastros", roles: ["PROFESSIONAL", "MANAGER"] }, // novo
  { prefix: "/me", roles: ["PATIENT"], enabled: ENABLE_PATIENT_PORTAL },
];

/** Para onde enviar quando precisa logar */
const LOGIN_BY_PREFIX: Record<string, string> = {
  "/gestor": "/auth/login/profissional",
  "/config": "/auth/login/profissional",
  "/profissional": "/auth/login/profissional",
  "/pacientes": "/auth/login/profissional",
  "/cadastros": "/auth/login/profissional", // novo
  "/me": "/auth/login/paciente",
};

/** Dashboard por papel */
const DASHBOARD_BY_ROLE: Record<Role, string> = {
  MANAGER: "/gestor",
  PROFESSIONAL: "/profissional",
  PATIENT: "/me",
};

function redirectTo(req: NextRequest, pathname: string) {
  const url = req.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  return NextResponse.redirect(url);
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const role = (req.cookies.get(ROLE_COOKIE)?.value ?? "") as Role | "";

  // casa somente /prefixo ou /prefixo/...
  const rule = ACL.find(
    (r) => pathname === r.prefix || pathname.startsWith(r.prefix + "/")
  );
  if (!rule) return NextResponse.next();

  // desabilitado por feature flag
  if (rule.enabled === false) {
    const loginPath = LOGIN_BY_PREFIX[rule.prefix] ?? "/auth/login";
    return redirectTo(req, loginPath);
  }

  // sem papel → ir ao login apropriado
  if (!role) {
    const loginPath =
      LOGIN_BY_PREFIX[rule.prefix] ??
      (ENABLE_PATIENT_PORTAL ? "/auth/login" : "/auth/login/profissional");
    return redirectTo(req, loginPath);
  }

  // papel não permitido → mandar ao dashboard do papel
  if (!rule.roles.includes(role)) {
    const dash = DASHBOARD_BY_ROLE[role] ?? "/auth/login";
    return redirectTo(req, dash);
  }

  return NextResponse.next();
}

/** matcher cobre a rota “crua” e com sufixo */
export const config = {
  matcher: [
    "/gestor",
    "/gestor/:path*",
    "/config",
    "/config/:path*",
    "/profissional",
    "/profissional/:path*",
    "/pacientes",
    "/pacientes/:path*",
    "/cadastros", // novo
    "/cadastros/:path*", // novo
    "/me",
    "/me/:path*",
  ],
};
