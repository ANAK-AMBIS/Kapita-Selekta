import { NextResponse } from "next/server";
import { COOKIE, cookieOpts, cekKredensial, buatToken } from "@/lib/server/auth";

/* POST /api/auth/login - { username, password } → set cookie sesi */
export async function POST(req) {
  const { username, password } = (await req.json().catch(() => null)) || {};
  if (!cekKredensial(username, password)) {
    return NextResponse.json({ error: "Nama pengguna atau kata sandi salah." }, { status: 401 });
  }
  const user = String(username).trim().toLowerCase();
  const res = NextResponse.json({ user });
  res.cookies.set(COOKIE, buatToken(user), cookieOpts);
  return res;
}
