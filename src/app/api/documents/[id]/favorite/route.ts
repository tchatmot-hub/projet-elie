import { connectToDatabase } from "@/lib/db";
import { Student } from "@/models/Student";
import { DocumentModel } from "@/models/Document";
import { withAuth, jsonError, jsonOk } from "@/lib/apiAuth";

// Toggles a document in the student's favorites.
export const POST = withAuth(async (_req, { params, user }) => {
  if (user.role !== "student") {
    return jsonError("Réservé aux étudiants.", 403);
  }
  await connectToDatabase();
  const doc = await DocumentModel.findById(params.id).select("classId").lean();
  if (!doc) return jsonError("Document introuvable.", 404);
  if (String(doc.classId) !== user.classId) {
    return jsonError("Permission insuffisante.", 403);
  }

  const student = await Student.findById(user.id).select("favorites");
  if (!student) return jsonError("Étudiant introuvable.", 404);

  const exists = student.favorites.some((f) => String(f) === params.id);
  if (exists) {
    student.favorites = student.favorites.filter((f) => String(f) !== params.id);
  } else {
    student.favorites.push(doc._id);
  }
  await student.save();
  return jsonOk({ favorited: !exists, favorites: student.favorites });
});
