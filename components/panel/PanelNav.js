import { HugeiconsIcon } from "@hugeicons/react";
import { Store01Icon, Wallet01Icon, Logout03Icon, UserAccountIcon } from "@hugeicons/core-free-icons";

const IKON = {
  kelola: Store01Icon,
  iuran: Wallet01Icon,
  akun: UserAccountIcon,
  saya: Store01Icon,
  "iuran-saya": Wallet01Icon,
};

const TAB_ADMIN = [
  ["kelola", "Data UMKM"],
  ["iuran", "Iuran Bulanan"],
  ["akun", "Akun UMKM"],
];

const TAB_UMKM = [
  ["saya", "UMKM Saya"],
  ["iuran-saya", "Iuran Saya"],
];

const LABEL_ROLE = { admin: "Admin", umkm: "UMKM" };

function Tabs({ tab, setTab, daftar }) {
  return daftar.map(([id, label]) => (
    <button
      key={id}
      type="button"
      className={"ptab" + (tab === id ? " aktif" : "")}
      aria-current={tab === id ? "page" : undefined}
      onClick={() => setTab(id)}
    >
      <HugeiconsIcon icon={IKON[id]} size={18} aria-hidden="true" />
      {label}
    </button>
  ));
}

export default function PanelNav({ tab, setTab, user, role = "admin", onKeluar }) {
  const daftar = role === "admin" ? TAB_ADMIN : TAB_UMKM;

  return (
    <header className="pnav">
      <div className="pnavin">
        <div className="pbrand">
          <img src="/img/logo-wayhuwi.gif" alt="" width={36} height={36} className="pbrand-logo" />
          <div>
            <span className="pbrand-title">Panel UMKM Way Huwi</span>
            <span className="pbrand-sub">Dusun 6</span>
          </div>
        </div>
        <nav className="pnavtabs" aria-label="Menu panel">
          <Tabs tab={tab} setTab={setTab} daftar={daftar} />
        </nav>
        <div className="pnavr">
          <div className="puser" title={"Masuk sebagai " + user}>
            <span className="puser-ava" aria-hidden="true">{(user[0] || "?").toUpperCase()}</span>
            <span className="puser-name">{user}</span>
            <span className={"puser-role " + role}>{LABEL_ROLE[role] || role}</span>
          </div>
          <button type="button" className="pbtn-keluar" onClick={onKeluar}>
            <HugeiconsIcon icon={Logout03Icon} size={18} aria-hidden="true" />
            <span>Keluar</span>
          </button>
        </div>
      </div>
      <nav className="pmobtabs" aria-label="Menu panel">
        <Tabs tab={tab} setTab={setTab} daftar={daftar} />
      </nav>
    </header>
  );
}
