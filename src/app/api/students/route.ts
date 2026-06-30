import { connectToDatabase } from "@/lib/db";
import { Student } from "@/models/Student";
import { ClassModel } from "@/models/Class";
import { withAuth, jsonError, jsonOk } from "@/lib/apiAuth";
import type { AuthUser } from "@/types";

async function canAccessClass(user: AuthUser, classId: string): Promise<boolean> {
  if (user.role === "superadmin") return true;
  if (user.role === "delegate") return user.classId === classId;
  const klass = await ClassModel.findById(classId).select("schoolId").lean();
  return !!klass && String(klass.schoolId) === user.schoolId;
}

// List students of a class: /api/students?classId=...
export const GET = withAuth(
  async (req, { user }) => {
    const classId = req.nextUrl.searchParams.get("classId") || user.classId;
    if (!classId) return jsonError("classId requis.");
    if (!(await canAccessClass(user, classId))) {
      return jsonError("Permission insuffisante.", 403);
    }
    await connectToDatabase();
    const students = await Student.find({ classId })
      .select("-password -downloads")
      .sort({ name: 1 })
      .lean();
    return jsonOk({ students });
  },
  { permission: "student:manage" }
);
