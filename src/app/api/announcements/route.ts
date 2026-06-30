import { type NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Announcement } from "@/models/Announcement";
import { ClassModel } from "@/models/Class";
import { createAnnouncementSchema } from "@/lib/validation";
import { withAuth, getAuthUser, jsonError, jsonOk } from "@/lib/apiAuth";
import type { AuthUser } from "@/types";

async function canAccessClass(user: AuthUser, classId: string): Promise<boolean> {
  if (user.role === "superadmin") return true;
  if (user.role === "student" || user.role === "delegate") {
    return user.classId === classId;
  }
  const klass = await ClassModel.findById(classId).select("schoolId").lean();
  return !!klass && String(klass.schoolId) === user.schoolId;
}

// List announcements of a class.
export async function GET(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) return jsonError("Authentification requise.", 401);
  const classId = req.nextUrl.searchParams.get("classId") || user.classId;
  if (!classId) return jsonError("classId requis.");
  if (!(await canAccessClass(user, classId))) {
    return jsonError("Permission insuffisante.", 403);
  }
  await connectToDatabase();
  const announcements = await Announcement.find({ classId })
    .sort({ isPinned: -1, createdAt: -1 })
    .lean();
  return jsonOk({ announcements });
}

// Create an announcement (delegate / admin).
export const POST = withAuth(
  async (req, { user }) => {
    const body = await req.json().catch(() => null);
    const parsed = createAnnouncementSchema.safeParse(body);
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

    const created = await Announcement.create({
      ...data,
      schoolId: klass.schoolId,
      authorId: user.id,
    });
    return jsonOk({ announcement: created }, 201);
  },
  { permission: "announcement:manage" }
);
