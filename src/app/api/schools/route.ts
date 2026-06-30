import { type NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { School } from "@/models/School";
import { Delegate } from "@/models/Delegate";
import { hashPassword } from "@/lib/auth";
import { registerSchoolSchema } from "@/lib/validation";
import { withAuth, jsonError, jsonOk } from "@/lib/apiAuth";

// List all schools (superadmin only).
export const GET = withAuth(
  async () => {
    await connectToDatabase();
    const schools = await School.find().sort({ createdAt: -1 }).lean();
    return jsonOk({ schools });
  },
  { permission: "school:create" }
);

// Create a school + its school admin (superadmin only).
export const POST = withAuth(
  async (req) => {
    const body = await req.json().catch(() => null);
    const parsed = registerSchoolSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.errors[0]?.message ?? "Données invalides.");
    }
    const data = parsed.data;
    await connectToDatabase();

    if (await School.findOne({ code: data.code })) {
      return jsonError("Une école avec ce code existe déjà.", 409);
    }
    if (await Delegate.findOne({ email: data.adminEmail })) {
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
    await Delegate.create({
      schoolId: school._id,
      name: data.adminName,
      username: data.adminEmail,
      email: data.adminEmail,
      password: await hashPassword(data.adminPassword),
      role: "school_admin",
    });

    return jsonOk({ school }, 201);
  },
  { permission: "school:create" }
);
