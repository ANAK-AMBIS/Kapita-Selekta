"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const SESS_KEY = "umkmweb_sess";
const USER = "pemdes";
const PASS = "desa123";

/* Login → panel perangkat desa (backend otentikasi menyusul) */
export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  function submit(e) {
    e.preventDefault();
    if (email.trim().toLowerCase() !== USER || pass !== PASS) {
      setError("Nama akun atau kata sandi salah.");
      return;
    }
    window.localStorage.setItem(SESS_KEY, "1");
    router.push("/panel");
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      <div className="field">
        <label htmlFor="email">Nama Pengguna</label>
        <input
          className="input"
          id="email"
          type="text"
          placeholder="Nama akun desa"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="password">Kata Sandi</label>
        <input
          className="input"
          id="password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
        />
      </div>

      {error && <div className="auth-error">{error}</div>}

      <div className="auth-actions">
        <button className="btn btn-primary btn-lg btn-wide" type="submit">
          Masuk &rarr;
        </button>
      </div>
    </form>
  );
}
