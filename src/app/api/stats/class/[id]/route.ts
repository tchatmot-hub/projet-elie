import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { ClassModel } from "@/models/Class";
import { Student } from "@/models/Student";
import { DocumentModel } from "@/models/Document";
import { withAuth, jsonError, jsonOk } from "@/lib/apiAuth";
import type { AuthUser } from "@/types";

async function canAccessClass(user: AuthUser, classId: string): Promise<boolean> {
  if (user.role === "superadmin") return true;
  if (user.role === "delegate") return user.classId === classId;
  const klass = await ClassModel.findById(classId).select("schoolId").lean();
  return !!klass && String(klass.schoolId) === user.schoolId;
}

export const GET = withAuth(
  async (_req, { params, user }) => {
    if (!(await canAccessClass(user, params.id))) {
      return jsonError("Permission insuffisante.", 403);
    }
    await connectToDatabase();
    const classId = params.id;
    const [students, documents, downloadAgg] = await Promise.all([
      Student.countDocuments({ classId }),
      DocumentModel.countDocuments({ classId }),
      DocumentModel.aggregate([
        { $match: { classId: Types.ObjectId.createFromHexString(classId) } },
        { $group: { _id: null, total: { $sum: "$downloads" } } },
      ]),
    ]);
    const totalDownloads = downloadAgg[0]?.total ?? 0;
    return jsonOk({ stats: { students, documents, totalDownloads } });
  },
  { permission: "stats:class" }
);
