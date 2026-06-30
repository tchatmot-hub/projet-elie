import { type NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { ClassModel } from "@/models/Class";
import { createClassSchema } from "@/lib/validation";
import { withAuth, jsonError, jsonOk } from "@/lib/apiAuth";
import type { AuthUser } from "@/types";

function canAccessSchool(user: AuthUser, schoolId: string): boolean {
  if (user.role === "superadmin") return true;
  return user.schoolId === schoolId;
}

// List classes of a school: /api/classes?schoolId=...
export const GET = withAuth(async (req, { user }) => {
  const schoolId = req.nextUrl.searchParams.get("schoolId") || user.schoolId;
  if (!schoolId) return jsonError("schoolId requis.");
  if (!canAccessSchool(user, schoolId)) {
    return jsonError("Permission insuffisante.", 403);
  }
  await connectToDatabase();
  const classes = await ClassModel.find({ schoolId }).sort({ name: 1 }).lean();
  return jsonOk({ classes });
});

// Create a class (school admin / superadmin).
export const POST = withAuth(
  async (req, { user }) => {
    const body = await req.json().catch(() => null);
    const parsed = createClassSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.errors[0]?.message ?? "Données invalides.");
    }
    const data = parsed.data;
    if (!canAccessSchool(user, data.schoolId)) {
      return jsonError("Permission insuffisante.", 403);
    }
    await connectToDatabase();
    if (await ClassModel.findOne({ schoolId: data.schoolId, code: data.code })) {
      return jsonError("Une classe avec ce code existe déjà dans cette école.", 409);
    }
    const created = await ClassModel.create(data);
    return jsonOk({ class: created }, 201);
  },
  { permission: "class:manage" }
);
