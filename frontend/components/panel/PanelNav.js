/* basePath GitHub Pages untuk aset di /public */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

const TABS = [
  ["kelola", "Kelola Data"],
  ["iuran", "Iuran Bulanan"],
];

function Tabs({ tab, setTab }) {
  return TABS.map(([id, label]) => (
    <button key={id} className={"ptab" + (tab === id ? " aktif" : "")} onClick={() => setTab(id)}>
      {label}
    </button>
  ));
}

export default function PanelNav({ tab, setTab, user, onKeluar }) {
  return (
    <header className="pnav" style={{ "--hero-bg": `url(${BASE}/img/hero-bg.jpg)` }}>
      <div className="pnavin">
        <div>
          <span className="pbrand-title">UMKM Way Huwi</span>
          <span className="pbrand-sub">Dusun 6</span>
        </div>
        <nav className="pnavtabs">
          <Tabs tab={tab} setTab={setTab} />
        </nav>
        <div className="pnavr">
          <div className="puser">
            <span className="puser-ava">{user[0]}</span>
            <span className="puser-info">
              <span className="puser-name">{user}</span>
            </span>
          </div>
          <button className="pbtn-keluar" onClick={onKeluar}>Keluar</button>
        </div>
      </div>
      {/* Tab mobile */}
      <nav className="pmobtabs pmobs">
        <Tabs tab={tab} setTab={setTab} />
      </nav>
    </header>
  );
}
