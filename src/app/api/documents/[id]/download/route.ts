import { connectToDatabase } from "@/lib/db";
import { DocumentModel } from "@/models/Document";
import { Student } from "@/models/Student";
import { withAuth, jsonError, jsonOk } from "@/lib/apiAuth";

// Records a download and returns the file URL. Available to any authenticated
// member of the document's class.
export const POST = withAuth(
  async (_req, { params, user }) => {
    await connectToDatabase();
    const doc = await DocumentModel.findById(params.id);
    if (!doc) return jsonError("Document introuvable.", 404);

    if (
      user.role !== "superadmin" &&
      user.schoolId !== String(doc.schoolId) &&
      user.classId !== String(doc.classId)
    ) {
      return jsonError("Permission insuffisante.", 403);
    }

    doc.downloads += 1;
    await doc.save();

    if (user.role === "student") {
      await Student.updateOne(
        { _id: user.id, "downloads.documentId": doc._id },
        { $inc: { "downloads.$.count": 1 }, $set: { "downloads.$.downloadedAt": new Date() } }
      );
      await Student.updateOne(
        { _id: user.id, "downloads.documentId": { $ne: doc._id } },
        { $push: { downloads: { documentId: doc._id } } }
      );
    }

    return jsonOk({ fileUrl: doc.fileUrl, downloads: doc.downloads });
  },
  { permission: "document:download" }
);
