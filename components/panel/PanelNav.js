import { HugeiconsIcon } from "@hugeicons/react";
import { Store01Icon, Wallet01Icon, Logout03Icon } from "@hugeicons/core-free-icons";

const TABS = [
  ["kelola", "Data UMKM", Store01Icon],
  ["iuran", "Iuran Bulanan", Wallet01Icon],
];

function Tabs({ tab, setTab }) {
  return TABS.map(([id, label, icon]) => (
    <button
      key={id}
      type="button"
      className={"ptab" + (tab === id ? " aktif" : "")}
      aria-current={tab === id ? "page" : undefined}
      onClick={() => setTab(id)}
    >
      <HugeiconsIcon icon={icon} size={18} aria-hidden="true" />
      {label}
    </button>
  ));
}

export default function PanelNav({ tab, setTab, user, onKeluar }) {
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
          <Tabs tab={tab} setTab={setTab} />
        </nav>
        <div className="pnavr">
          <div className="puser" title={"Masuk sebagai " + user}>
            <span className="puser-ava" aria-hidden="true">{(user[0] || "?").toUpperCase()}</span>
            <span className="puser-name">{user}</span>
          </div>
          <button type="button" className="pbtn-keluar" onClick={onKeluar}>
            <HugeiconsIcon icon={Logout03Icon} size={18} aria-hidden="true" />
            <span>Keluar</span>
          </button>
        </div>
      </div>
      <nav className="pmobtabs" aria-label="Menu panel">
        <Tabs tab={tab} setTab={setTab} />
      </nav>
    </header>
  );
}
