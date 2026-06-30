import { NextResponse, type NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";
import { hasPermission, type Permission } from "@/lib/permissions";
import type { AuthUser } from "@/types";

export const TOKEN_COOKIE = "pc_token";

/** Extracts and verifies the authenticated user from cookie or Bearer header. */
export function getAuthUser(req: NextRequest): AuthUser | null {
  const cookieToken = req.cookies.get(TOKEN_COOKIE)?.value;
  const header = req.headers.get("authorization");
  const bearer = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  const token = cookieToken || bearer;
  if (!token) return null;
  return verifyToken(token);
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

type Handler = (
  req: NextRequest,
  ctx: { params: Record<string, string>; user: AuthUser }
) => Promise<NextResponse> | NextResponse;

interface GuardOptions {
  permission?: Permission;
}

/**
 * Wraps a route handler, requiring a valid token and (optionally) a permission.
 */
export function withAuth(
  handler: Handler,
  options: GuardOptions = {}
): (req: NextRequest, ctx: { params: Record<string, string> }) => Promise<NextResponse> {
  return async (req, ctx) => {
    const user = getAuthUser(req);
    if (!user) {
      return jsonError("Authentification requise.", 401);
    }
    if (options.permission && !hasPermission(user.role, options.permission)) {
      return jsonError("Permission insuffisante.", 403);
    }
    return handler(req, { params: ctx.params ?? {}, user });
  };
}
