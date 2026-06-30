import { connectToDatabase } from "@/lib/db";
import { School } from "@/models/School";
import { jsonOk } from "@/lib/apiAuth";

export const dynamic = "force-dynamic";

// Public list of active schools used by the home page school selector.
export async function GET() {
  await connectToDatabase();
  const schools = await School.find({ isActive: true })
    .select("name code domain logo primaryColor secondaryColor")
    .sort({ name: 1 })
    .lean();
  return jsonOk({ schools });
}
