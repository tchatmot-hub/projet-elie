import { connectToDatabase } from "@/lib/db";
import { School } from "@/models/School";
import { ClassModel } from "@/models/Class";
import { Delegate } from "@/models/Delegate";
import { Student } from "@/models/Student";
import { DocumentModel } from "@/models/Document";
import { withAuth, jsonOk } from "@/lib/apiAuth";

// Global statistics (superadmin only).
export const GET = withAuth(
  async () => {
    await connectToDatabase();
    const [schools, classes, delegates, students, documents] = await Promise.all([
      School.countDocuments(),
      ClassModel.countDocuments(),
      Delegate.countDocuments({ role: "delegate" }),
      Student.countDocuments(),
      DocumentModel.countDocuments(),
    ]);
    return jsonOk({ stats: { schools, classes, delegates, students, documents } });
  },
  { permission: "stats:system" }
);
