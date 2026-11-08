import { NextResponse } from "next/server";
import { getUser } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

/* GET /api/auth/me - { user } bila login, 401 bila belum */
export async function GET() {
  const user = await getUser();
  return user ? NextResponse.json({ user }) : NextResponse.json({ user: null }, { status: 401 });
}
