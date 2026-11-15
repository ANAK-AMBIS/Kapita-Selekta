import { NextResponse } from "next/server";
import { query } from "@/lib/server/db";
import { wajibAdmin, usernameAdmin } from "@/lib/server/auth";
import { idValid } from "@/lib/server/umkm";
import { cariAkunId, galatUnik, validasiPassword, validasiUsername } from "@/lib/server/akun";
import { hashPassword } from "@/lib/server/password";

export const dynamic = "force-dynamic";

const tidakAda = () => NextResponse.json({ error: "Akun tidak ditemukan." }, { status: 404 });

/* PUT /api/akun/:id - reset sandi / ganti nama pengguna / aktif-nonaktifkan (admin)
   Body boleh berisi salah satu atau beberapa: { username, password, aktif } */
export async function PUT(req, { params }) {
  const tolak = await wajibAdmin();
  if (tolak) return tolak;

  const id = idValid((await params).id);
  if (!id) return tidakAda();
  const lama = await cariAkunId(id);
  if (!lama) return tidakAda();

  const b = (await req.json().catch(() => null)) || {};
  const set = [];
  const nilai = [];

  if (b.username !== undefined) {
    const cek = validasiUsername(b.username);
    if (cek.error) return NextResponse.json({ error: cek.error }, { status: 400 });
    if (usernameAdmin(cek.value)) {
      return NextResponse.json({ error: "Nama pengguna itu dipakai admin. Pilih nama lain." }, { status: 400 });
    }
    nilai.push(cek.value);
    set.push("username = $" + nilai.length);
  }

  if (b.password !== undefined) {
    const cek = validasiPassword(b.password);
    if (cek.error) return NextResponse.json({ error: cek.error }, { status: 400 });
    nilai.push(hashPassword(cek.value));
    set.push("pass_hash = $" + nilai.length);
    set.push("sesi_ver = sesi_ver + 1"); /* sesi lama langsung tidak berlaku */
  }

  if (b.aktif !== undefined) {
    if (typeof b.aktif !== "boolean") {
      return NextResponse.json({ error: "Nilai status akun tidak valid." }, { status: 400 });
    }
    nilai.push(b.aktif);
    set.push("aktif = $" + nilai.length);
  }

  if (!set.length) return NextResponse.json({ error: "Tidak ada perubahan yang dikirim." }, { status: 400 });

  nilai.push(id);
  try {
    await query(`UPDATE akun SET ${set.join(", ")} WHERE id = $${nilai.length}`, nilai);
  } catch (e) {
    if (galatUnik(e)) {
      return NextResponse.json({ error: "Nama pengguna sudah dipakai akun lain." }, { status: 409 });
    }
    throw e;
  }

  return NextResponse.json(await cariAkunId(id));
}

/* DELETE /api/akun/:id - hapus akun; data UMKM tetap ada (admin) */
export async function DELETE(_req, { params }) {
  const tolak = await wajibAdmin();
  if (tolak) return tolak;
  const id = idValid((await params).id);
  if (!id) return tidakAda();
  const rows = await query("DELETE FROM akun WHERE id = $1 RETURNING id", [id]);
  return rows.length ? NextResponse.json({ ok: true }) : tidakAda();
}
