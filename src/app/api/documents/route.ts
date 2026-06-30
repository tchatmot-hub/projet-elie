import { type NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { DocumentModel } from "@/models/Document";
import { ClassModel } from "@/models/Class";
import { createDocumentSchema } from "@/lib/validation";
import { withAuth, getAuthUser, jsonError, jsonOk } from "@/lib/apiAuth";
import type { AuthUser } from "@/types";

async function canAccessClass(user: AuthUser, classId: string): Promise<boolean> {
  if (user.role === "superadmin") return true;
  if (user.role === "student" || user.role === "delegate") {
    return user.classId === classId;
  }
  // school_admin: class must belong to their school
  const klass = await ClassModel.findById(classId).select("schoolId").lean();
  return !!klass && String(klass.schoolId) === user.schoolId;
}

// List documents of a class with optional text search and type filter.
export async function GET(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) return jsonError("Authentification requise.", 401);

  const classId = req.nextUrl.searchParams.get("classId") || user.classId;
  if (!classId) return jsonError("classId requis.");
  if (!(await canAccessClass(user, classId))) {
    return jsonError("Permission insuffisante.", 403);
  }

  const q = req.nextUrl.searchParams.get("q")?.trim();
  const type = req.nextUrl.searchParams.get("type")?.trim();

  await connectToDatabase();
  const filter: Record<string, unknown> = { classId };
  if (type && type !== "tous") filter.type = type;
  if (q) {
    filter.$or = [
      { title: { $regex: q, $options: "i" } },
      { subject: { $regex: q, $options: "i" } },
      { professor: { $regex: q, $options: "i" } },
    ];
  }
  const documents = await DocumentModel.find(filter)
    .sort({ createdAt: -1 })
    .lean();
  return jsonOk({ documents });
}

// Upload (publish) a document — delegates and admins only.
export const POST = withAuth(
  async (req, { user }) => {
    const body = await req.json().catch(() => null);
    const parsed = createDocumentSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.errors[0]?.message ?? "Données invalides.");
    }
    const data = parsed.data;
    if (!(await canAccessClass(user, data.classId))) {
      return jsonError("Permission insuffisante.", 403);
    }
    await connectToDatabase();
    const klass = await ClassModel.findById(data.classId).select("schoolId").lean();
    if (!klass) return jsonError("Classe introuvable.", 404);

    const created = await DocumentModel.create({
      ...data,
      schoolId: klass.schoolId,
      uploadedBy: user.id,
    });
    return jsonOk({ document: created }, 201);
  },
  { permission: "document:upload" }
);
