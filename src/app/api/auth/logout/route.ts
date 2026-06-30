import { jsonOk, TOKEN_COOKIE } from "@/lib/apiAuth";

export async function POST() {
  const res = jsonOk({ success: true });
  res.cookies.set(TOKEN_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
