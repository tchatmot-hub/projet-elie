import { type NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { DocumentModel } from "@/models/Document";
import { withAuth, jsonError, jsonOk } from "@/lib/apiAuth";
import type { AuthUser } from "@/types";

function canModify(user: AuthUser, schoolId: string, classId: string): boolean {
  if (user.role === "superadmin") return true;
  if (user.role === "school_admin") return user.schoolId === schoolId;
  if (user.role === "delegate") return user.classId === classId;
  return false;
}

export const PUT = withAuth(
  async (req, { params, user }) => {
    await connectToDatabase();
    const doc = await DocumentModel.findById(params.id);
    if (!doc) return jsonError("Document introuvable.", 404);
    if (!canModify(user, String(doc.schoolId), String(doc.classId))) {
      return jsonError("Permission insuffisante.", 403);
    }
    const body = await req.json().catch(() => ({}));
    const allowed = [
      "title",
      "description",
      "subject",
      "professor",
      "type",
      "tags",
      "isPublic",
    ] as const;
    for (const key of allowed) {
      if (key in body) doc.set(key, body[key]);
    }
    doc.version += 1;
    await doc.save();
    return jsonOk({ document: doc });
  },
  { permission: "document:upload" }
);

export const DELETE = withAuth(
  async (_req, { params, user }) => {
    await connectToDatabase();
    const doc = await DocumentModel.findById(params.id);
    if (!doc) return jsonError("Document introuvable.", 404);
    if (!canModify(user, String(doc.schoolId), String(doc.classId))) {
      return jsonError("Permission insuffisante.", 403);
    }
    await doc.deleteOne();
    return jsonOk({ success: true });
  },
  { permission: "document:delete" }
);
