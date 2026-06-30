import { type NextRequest } from "next/server";
import { getAuthUser, jsonError, jsonOk } from "@/lib/apiAuth";
import { permissionsForRole } from "@/lib/permissions";

export async function GET(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) {
    return jsonError("Non authentifié.", 401);
  }
  return jsonOk({
    user: { ...user, permissions: permissionsForRole(user.role) },
  });
}
