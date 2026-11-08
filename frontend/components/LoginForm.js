"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SESS_KEY, ADMIN_USER, ADMIN_PASS } from "@/lib/umkm";

/* Form login admin → /panel (backend otentikasi menyusul) */
export default function LoginForm() {
  const [nama, setNama] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  /* sudah login → langsung ke panel */
  useEffect(() => {
    if (window.localStorage.getItem(SESS_KEY)) router.replace("/panel");
  }, [router]);

  function submit(e) {
    e.preventDefault();
    if (nama.trim().toLowerCase() !== ADMIN_USER || pass !== ADMIN_PASS) {
      setError("Nama pengguna atau kata sandi salah.");
      return;
    }
    window.localStorage.setItem(SESS_KEY, ADMIN_USER);
    router.push("/panel");
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      <div className="field">
        <label htmlFor="nama">Nama Pengguna</label>
        <input
          className="input" id="nama" type="text"
          placeholder="Contoh: pemdes" autoComplete="username"
          value={nama} onChange={(e) => setNama(e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="password">Kata Sandi</label>
        <input
          className="input" id="password" type="password"
          placeholder="••••••••" autoComplete="current-password"
          value={pass} onChange={(e) => setPass(e.target.value)}
        />
      </div>

      {error && <div className="auth-error">{error}</div>}

      <div className="auth-actions">
        <button className="btn btn-primary btn-lg btn-wide" type="submit">Masuk &rarr;</button>
      </div>
    </form>
  );
}
