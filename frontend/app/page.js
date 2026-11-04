import LoginForm from "@/components/LoginForm";

export const metadata = { title: "Login Perangkat Desa" };

export default function Beranda() {
  return (
    <main className="auth-wrap">
      <div className="auth-card">
        <div>
          <h1 className="auth-title">UMKM Way Huwi</h1>
          <p className="auth-sub" style={{ marginTop: 8 }}>
            Kelola data &amp; iuran UMKM Dusun 6 &mdash; Desa Way Huwi
          </p>
        </div>

        <LoginForm />

        <p className="auth-note">
          Halaman ini khusus perangkat desa. Akun demo: <b>pemdes</b> / <b>desa123</b>
        </p>
      </div>
    </main>
  );
}
