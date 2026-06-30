import { saveFile } from "@/lib/storage";
import { withAuth, jsonError, jsonOk } from "@/lib/apiAuth";

const ALLOWED = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx"];
const MAX_SIZE = 50 * 1024 * 1024; // 50 MB

// Uploads a file and returns its URL; used before creating a Document.
export const POST = withAuth(
  async (req) => {
    const form = await req.formData().catch(() => null);
    const file = form?.get("file");
    if (!(file instanceof File)) {
      return jsonError("Aucun fichier fourni.");
    }
    const lower = file.name.toLowerCase();
    if (!ALLOWED.some((ext) => lower.endsWith(ext))) {
      return jsonError("Type de fichier non autorisé.");
    }
    if (file.size > MAX_SIZE) {
      return jsonError("Le fichier dépasse 50 Mo.");
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const { url, size } = await saveFile(file.name, buffer);
    return jsonOk({ url, size, fileType: lower.split(".").pop() }, 201);
  },
  { permission: "document:upload" }
);
