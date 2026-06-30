import { type NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { School } from "@/models/School";
import { withAuth, jsonError, jsonOk } from "@/lib/apiAuth";
import type { AuthUser } from "@/types";

function canAccessSchool(user: AuthUser, schoolId: string): boolean {
  if (user.role === "superadmin") return true;
  return user.schoolId === schoolId;
}

export const GET = withAuth(async (_req, { params, user }) => {
  if (!canAccessSchool(user, params.id)) {
    return jsonError("Permission insuffisante.", 403);
  }
  await connectToDatabase();
  const school = await School.findById(params.id).lean();
  if (!school) return jsonError("École introuvable.", 404);
  return jsonOk({ school });
});

export const PUT = withAuth(
  async (req, { params, user }) => {
    if (!canAccessSchool(user, params.id)) {
      return jsonError("Permission insuffisante.", 403);
    }
    const body = await req.json().catch(() => ({}));
    const allowed = [
      "name",
      "domain",
      "logo",
      "primaryColor",
      "secondaryColor",
      "isActive",
      "settings",
    ] as const;
    const update: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in body) update[key] = body[key];
    }
    // Only superadmin may toggle activation.
    if (user.role !== "superadmin") delete update.isActive;

    await connectToDatabase();
    const school = await School.findByIdAndUpdate(params.id, update, {
      new: true,
    }).lean();
    if (!school) return jsonError("École introuvable.", 404);
    return jsonOk({ school });
  },
  { permission: "school:update" }
);

export const DELETE = withAuth(
  async (_req, { params }) => {
    await connectToDatabase();
    const school = await School.findByIdAndDelete(params.id).lean();
    if (!school) return jsonError("École introuvable.", 404);
    return jsonOk({ success: true });
  },
  { permission: "school:delete" }
);
