import { type NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Delegate } from "@/models/Delegate";
import { Student } from "@/models/Student";
import { verifyPassword, signToken } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";
import { permissionsForRole } from "@/lib/permissions";
import { jsonError, jsonOk, TOKEN_COOKIE } from "@/lib/apiAuth";
import type { AuthUser } from "@/types";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.errors[0]?.message ?? "Données invalides.");
  }
  const { email, password } = parsed.data;

  await connectToDatabase();

  // Staff accounts (delegate / school_admin / superadmin) live in Delegate.
  const staff = await Delegate.findOne({ email });
  if (staff && staff.isActive) {
    const ok = await verifyPassword(password, staff.password);
    if (ok) {
      staff.lastLogin = new Date();
      await staff.save();
      return issueToken({
        id: String(staff._id),
        role: staff.role as AuthUser["role"],
        schoolId: staff.schoolId ? String(staff.schoolId) : null,
        classId: staff.classId ? String(staff.classId) : null,
        email: staff.email,
        name: staff.name,
      });
    }
  }

  const student = await Student.findOne({ email });
  if (student && student.isActive) {
    const ok = await verifyPassword(password, student.password);
    if (ok) {
      student.lastLogin = new Date();
      await student.save();
      return issueToken({
        id: String(student._id),
        role: "student",
        schoolId: String(student.schoolId),
        classId: String(student.classId),
        email: student.email,
        name: student.name,
      });
    }
  }

  return jsonError("E-mail ou mot de passe incorrect.", 401);
}

function issueToken(authUser: AuthUser) {
  const token = signToken(authUser);
  const res = jsonOk({
    user: { ...authUser, permissions: permissionsForRole(authUser.role) },
  });
  res.cookies.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
