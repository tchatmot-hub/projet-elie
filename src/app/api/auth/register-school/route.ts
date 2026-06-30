import { type NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { School } from "@/models/School";
import { Delegate } from "@/models/Delegate";
import { hashPassword, signToken } from "@/lib/auth";
import { registerSchoolSchema } from "@/lib/validation";
import { permissionsForRole } from "@/lib/permissions";
import { jsonError, jsonOk, TOKEN_COOKIE } from "@/lib/apiAuth";
import type { AuthUser } from "@/types";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = registerSchoolSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.errors[0]?.message ?? "Données invalides.");
  }
  const data = parsed.data;

  await connectToDatabase();

  const existingSchool = await School.findOne({ code: data.code });
  if (existingSchool) {
    return jsonError("Une école avec ce code existe déjà.", 409);
  }
  const existingAdmin = await Delegate.findOne({ email: data.adminEmail });
  if (existingAdmin) {
    return jsonError("Un compte avec cet e-mail existe déjà.", 409);
  }

  const school = await School.create({
    name: data.name,
    code: data.code,
    domain: data.domain,
    logo: data.logo || undefined,
    primaryColor: data.primaryColor,
    secondaryColor: data.secondaryColor,
  });

  const admin = await Delegate.create({
    schoolId: school._id,
    name: data.adminName,
    username: data.adminEmail,
    email: data.adminEmail,
    password: await hashPassword(data.adminPassword),
    role: "school_admin",
  });

  const authUser: AuthUser = {
    id: String(admin._id),
    role: "school_admin",
    schoolId: String(school._id),
    classId: null,
    email: admin.email,
    name: admin.name,
  };
  const token = signToken(authUser);

  const res = jsonOk(
    {
      user: { ...authUser, permissions: permissionsForRole("school_admin") },
      school: { id: String(school._id), name: school.name, code: school.code },
    },
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
