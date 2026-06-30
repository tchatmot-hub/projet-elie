import { connectToDatabase } from "@/lib/db";
import { AccessCode } from "@/models/AccessCode";
import { ClassModel } from "@/models/Class";
import { withAuth, jsonError, jsonOk } from "@/lib/apiAuth";
import type { AuthUser } from "@/types";

async function canAccessClass(user: AuthUser, classId: string): Promise<boolean> {
  if (user.role === "superadmin") return true;
  if (user.role === "delegate") return user.classId === classId;
  const klass = await ClassModel.findById(classId).select("schoolId").lean();
  return !!klass && String(klass.schoolId) === user.schoolId;
}

// List access codes for a class: /api/codes?classId=...
export const GET = withAuth(
  async (req, { user }) => {
    const classId = req.nextUrl.searchParams.get("classId") || user.classId;
    if (!classId) return jsonError("classId requis.");
    if (!(await canAccessClass(user, classId))) {
      return jsonError("Permission insuffisante.", 403);
    }
    await connectToDatabase();
    const codes = await AccessCode.find({ classId })
      .sort({ createdAt: -1 })
      .lean();
    return jsonOk({ codes });
  },
  { permission: "code:generate" }
);
