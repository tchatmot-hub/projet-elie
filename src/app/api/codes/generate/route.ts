import { connectToDatabase } from "@/lib/db";
import { AccessCode } from "@/models/AccessCode";
import { ClassModel } from "@/models/Class";
import { generateAccessCode } from "@/lib/validation";
import { withAuth, jsonError, jsonOk } from "@/lib/apiAuth";
import type { AuthUser } from "@/types";

async function canAccessClass(user: AuthUser, classId: string): Promise<boolean> {
  if (user.role === "superadmin") return true;
  if (user.role === "delegate") return user.classId === classId;
  const klass = await ClassModel.findById(classId).select("schoolId").lean();
  return !!klass && String(klass.schoolId) === user.schoolId;
}

// Generate one or more unique access codes for a class.
export const POST = withAuth(
  async (req, { user }) => {
    const body = await req.json().catch(() => ({}));
    const classId: string | undefined = body.classId || user.classId || undefined;
    const count = Math.min(Math.max(Number(body.count) || 1, 1), 50);
    if (!classId) return jsonError("classId requis.");
    if (!(await canAccessClass(user, classId))) {
      return jsonError("Permission insuffisante.", 403);
    }
    await connectToDatabase();
    const klass = await ClassModel.findById(classId).select("schoolId").lean();
    if (!klass) return jsonError("Classe introuvable.", 404);

    const created = [];
    for (let i = 0; i < count; i++) {
      // Retry on the (rare) chance of a duplicate code within the class.
      for (let attempt = 0; attempt < 5; attempt++) {
        try {
          const doc = await AccessCode.create({
            schoolId: klass.schoolId,
            classId,
            code: generateAccessCode(),
            createdBy: user.id,
          });
          created.push(doc);
          break;
        } catch (err) {
          if (attempt === 4) throw err;
        }
      }
    }
    return jsonOk({ codes: created }, 201);
  },
  { permission: "code:generate" }
);
