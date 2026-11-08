"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

/* Form login admin → POST /api/auth/login → /panel */
export default function LoginForm() {
  const [nama, setNama] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  /* sudah login → langsung ke panel */
  useEffect(() => {
    api("/auth/me").then(() => router.replace("/panel")).catch(() => {});
  }, [router]);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api("/auth/login", { method: "POST", body: { username: nama, password: pass } });
      router.push("/panel");
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
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
        <button className="btn btn-primary btn-lg btn-wide" type="submit" disabled={loading}>{loading ? "Memeriksa..." : <>Masuk &rarr;</>}</button>
      </div>
    </form>
  );
}
