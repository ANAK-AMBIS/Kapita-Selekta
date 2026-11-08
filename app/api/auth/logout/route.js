import { NextResponse } from "next/server";
import { COOKIE, cookieOpts } from "@/lib/server/auth";

/* POST /api/auth/logout - hapus cookie sesi */
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, "", { ...cookieOpts, maxAge: 0 });
  return res;
}
