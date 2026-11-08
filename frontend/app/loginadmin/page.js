import LoginForm from "@/components/LoginForm";

export const metadata = { title: "Login Admin", robots: { index: false, follow: false } };

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function LoginAdmin() {
  return (
    <main className="auth-wrap auth-hero" style={{ "--hero-bg": `url(${BASE}/img/hero-bg.jpg)` }}>
      <div className="auth-card">
        <div>
          <span className="pub-eyebrow">Khusus Admin</span>
          <h1 className="auth-title">Masuk ke Panel</h1>
          <p className="auth-sub" style={{ marginTop: 8 }}>
            UMKM Way Huwi &mdash; Dusun 6
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
