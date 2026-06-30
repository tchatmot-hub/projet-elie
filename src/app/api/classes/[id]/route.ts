import { type NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { ClassModel } from "@/models/Class";
import { withAuth, jsonError, jsonOk } from "@/lib/apiAuth";
import type { AuthUser } from "@/types";

async function loadClass(id: string) {
  await connectToDatabase();
  return ClassModel.findById(id);
}

function canAccessSchool(user: AuthUser, schoolId: string): boolean {
  if (user.role === "superadmin") return true;
  return user.schoolId === schoolId;
}

export const GET = withAuth(async (_req, { params, user }) => {
  const klass = await loadClass(params.id);
  if (!klass) return jsonError("Classe introuvable.", 404);
  if (!canAccessSchool(user, String(klass.schoolId))) {
    return jsonError("Permission insuffisante.", 403);
  }
  return jsonOk({ class: klass });
});

export const PUT = withAuth(
  async (req, { params, user }) => {
    const klass = await loadClass(params.id);
    if (!klass) return jsonError("Classe introuvable.", 404);
    if (!canAccessSchool(user, String(klass.schoolId))) {
      return jsonError("Permission insuffisante.", 403);
    }
    const body = await req.json().catch(() => ({}));
    const allowed = ["name", "code", "academicYear", "level", "department"] as const;
    for (const key of allowed) {
      if (key in body) klass.set(key, body[key]);
    }
    await klass.save();
    return jsonOk({ class: klass });
  },
  { permission: "class:manage" }
);

export const DELETE = withAuth(
  async (_req, { params, user }) => {
    const klass = await loadClass(params.id);
    if (!klass) return jsonError("Classe introuvable.", 404);
    if (!canAccessSchool(user, String(klass.schoolId))) {
      return jsonError("Permission insuffisante.", 403);
    }
    await klass.deleteOne();
    return jsonOk({ success: true });
  },
  { permission: "class:manage" }
);
