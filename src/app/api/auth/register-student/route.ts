import { type NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { AccessCode } from "@/models/AccessCode";
import { Student } from "@/models/Student";
import { hashPassword, signToken } from "@/lib/auth";
import { registerStudentSchema } from "@/lib/validation";
import { permissionsForRole } from "@/lib/permissions";
import { jsonError, jsonOk, TOKEN_COOKIE } from "@/lib/apiAuth";
import type { AuthUser } from "@/types";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = registerStudentSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.errors[0]?.message ?? "Données invalides.");
  }
  const data = parsed.data;

  await connectToDatabase();

  const code = await AccessCode.findOne({ code: data.accessCode, isUsed: false });
  if (!code) {
    return jsonError("Code d'accès invalide ou déjà utilisé.", 400);
  }
  if (code.expiresAt && code.expiresAt.getTime() < Date.now()) {
    return jsonError("Ce code d'accès a expiré.", 400);
  }

  const existing = await Student.findOne({ email: data.email });
  if (existing) {
    return jsonError("Un compte avec cet e-mail existe déjà.", 409);
  }

  const student = await Student.create({
    schoolId: code.schoolId,
    classId: code.classId,
    name: data.name,
    email: data.email,
    password: await hashPassword(data.password),
    accessCode: data.accessCode,
    studentNumber: data.studentNumber,
  });

  code.isUsed = true;
  code.usedBy = student._id;
  await code.save();

  const authUser: AuthUser = {
    id: String(student._id),
    role: "student",
    schoolId: String(student.schoolId),
    classId: String(student.classId),
    email: student.email,
    name: student.name,
  };
  const token = signToken(authUser);

  const res = jsonOk(
    { user: { ...authUser, permissions: permissionsForRole("student") } },
    201
  );
  res.cookies.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
