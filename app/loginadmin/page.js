import LoginForm from "@/components/LoginForm";

export const metadata = { title: "Login Admin", robots: { index: false, follow: false } };

export default function LoginAdmin() {
  return (
    <main className="auth-wrap auth-hero" style={{ "--hero-bg": `url(/img/hero-bg.jpg)` }}>
      <div className="auth-card">
        <img className="auth-logo" src="/img/logo-wayhuwi.gif" alt="Logo Desa Way Huwi" width={64} height={64} />
        <div>
          <h1 className="auth-title">Masuk ke Panel</h1>
          <p className="auth-sub" style={{ marginTop: 8 }}>
            UMKM Way Huwi - Dusun 6
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
