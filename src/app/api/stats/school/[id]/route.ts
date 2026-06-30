import { connectToDatabase } from "@/lib/db";
import { ClassModel } from "@/models/Class";
import { Delegate } from "@/models/Delegate";
import { Student } from "@/models/Student";
import { DocumentModel } from "@/models/Document";
import { withAuth, jsonError, jsonOk } from "@/lib/apiAuth";
import type { AuthUser } from "@/types";

function canAccessSchool(user: AuthUser, schoolId: string): boolean {
  if (user.role === "superadmin") return true;
  return user.schoolId === schoolId;
}

export const GET = withAuth(
  async (_req, { params, user }) => {
    if (!canAccessSchool(user, params.id)) {
      return jsonError("Permission insuffisante.", 403);
    }
    await connectToDatabase();
    const schoolId = params.id;
    const [classes, delegates, students, documents] = await Promise.all([
      ClassModel.countDocuments({ schoolId }),
      Delegate.countDocuments({ schoolId, role: "delegate" }),
      Student.countDocuments({ schoolId }),
      DocumentModel.countDocuments({ schoolId }),
    ]);
    return jsonOk({ stats: { classes, delegates, students, documents } });
  },
  { permission: "stats:school" }
);
