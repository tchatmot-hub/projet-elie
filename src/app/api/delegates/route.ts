import { type NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Delegate } from "@/models/Delegate";
import { ClassModel } from "@/models/Class";
import { hashPassword } from "@/lib/auth";
import { createDelegateSchema } from "@/lib/validation";
import { withAuth, jsonError, jsonOk } from "@/lib/apiAuth";
import type { AuthUser } from "@/types";

function canAccessSchool(user: AuthUser, schoolId: string): boolean {
  if (user.role === "superadmin") return true;
  return user.schoolId === schoolId;
}

// List delegates: /api/delegates?classId=... or ?schoolId=...
export const GET = withAuth(
  async (req, { user }) => {
    const classId = req.nextUrl.searchParams.get("classId");
    const schoolId = req.nextUrl.searchParams.get("schoolId") || user.schoolId;
    await connectToDatabase();
    const filter: Record<string, unknown> = { role: "delegate" };
    if (classId) filter.classId = classId;
    else if (schoolId) filter.schoolId = schoolId;
    if (schoolId && !canAccessSchool(user, schoolId)) {
      return jsonError("Permission insuffisante.", 403);
    }
    const delegates = await Delegate.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();
    return jsonOk({ delegates });
  },
  { permission: "delegate:manage" }
);

// Create (nominate) a delegate for a class (school admin / superadmin).
export const POST = withAuth(
  async (req, { user }) => {
    const body = await req.json().catch(() => null);
    const parsed = createDelegateSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.errors[0]?.message ?? "Données invalides.");
    }
    const data = parsed.data;
    if (!canAccessSchool(user, data.schoolId)) {
      return jsonError("Permission insuffisante.", 403);
    }
    await connectToDatabase();

    const klass = await ClassModel.findById(data.classId);
    if (!klass || String(klass.schoolId) !== data.schoolId) {
      return jsonError("Classe invalide pour cette école.", 400);
    }
    if (await Delegate.findOne({ email: data.email })) {
      return jsonError("Un compte avec cet e-mail existe déjà.", 409);
    }
    if (await Delegate.findOne({ username: data.username })) {
      return jsonError("Ce nom d'utilisateur est déjà pris.", 409);
    }

    const delegate = await Delegate.create({
      schoolId: data.schoolId,
      classId: data.classId,
      name: data.name,
      username: data.username,
      email: data.email,
      password: await hashPassword(data.password),
      role: "delegate",
    });
    const obj = delegate.toObject();
    delete (obj as Record<string, unknown>).password;
    return jsonOk({ delegate: obj }, 201);
  },
  { permission: "delegate:manage" }
);
