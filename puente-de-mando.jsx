import { useState, useEffect, useMemo } from "react";
import {
  Anchor, LayoutDashboard, KeyRound, Building2, Receipt, Plug, ShieldAlert,
  Plus, Pencil, Trash2, Eye, EyeOff, Download, Upload, X, ExternalLink,
  Save, AlertTriangle, CheckCircle2, Wallet
} from "lucide-react";

// ---------- Identidad visual (marca Marlaboral, puente de mando) ----------
const C = {
  navy: "#001438",
  navy2: "#04204f",
  panel: "#0a2a5e",
  line: "#1c3c6e",
  sky: "#0EA5E9",
  green: "#10b981",
  amber: "#f59e0b",
  red: "#ef4444",
  ink: "#e8eef7",
  mute: "#8aa3c7",
};

const STORAGE_KEY = "puente-de-mando-v2";
const WEB_OPTS = ["Marlaboral", "Artelo", "Ambas"];
const WEBS = ["Todo", "Marlaboral", "Artelo"];

// Color por web para las etiquetas
const webColor = (w) => (w === "Marlaboral" ? C.sky : w === "Artelo" ? C.green : C.mute);

// ---------- Definición de secciones y campos ----------
const SECTIONS = [
  {
    id: "claves",
    label: "Claves API",
    icon: KeyRound,
    singular: "clave",
    fields: [
      { k: "nombre", label: "Nombre", type: "text", req: true },
      { k: "web", label: "Web", type: "select", opts: WEB_OPTS },
      { k: "servicio", label: "Servicio", type: "text" },
      { k: "clave", label: "Clave / API Key", type: "secret" },
      { k: "panel", label: "URL del panel", type: "url" },
      { k: "notas", label: "Notas", type: "area" },
    ],
  },
  {
    id: "cuentas",
    label: "Cuentas y paneles",
    icon: Building2,
    singular: "cuenta",
    fields: [
      { k: "servicio", label: "Servicio", type: "text", req: true },
      { k: "web", label: "Web", type: "select", opts: WEB_OPTS },
      { k: "email", label: "Email / usuario", type: "text" },
      { k: "panel", label: "URL del panel", type: "url" },
      { k: "doble", label: "Doble factor (2FA)", type: "text" },
      { k: "notas", label: "Notas", type: "area" },
    ],
  },
  {
    id: "gastos",
    label: "Gastos",
    icon: Receipt,
    singular: "gasto",
    fields: [
      { k: "concepto", label: "Concepto", type: "text", req: true },
      { k: "web", label: "Web", type: "select", opts: WEB_OPTS },
      { k: "importe", label: "Importe (€)", type: "number" },
      { k: "ciclo", label: "Ciclo", type: "select", opts: ["Mensual", "Anual", "Pago único"] },
      { k: "renovacion", label: "Próxima renovación", type: "date" },
      { k: "notas", label: "Notas", type: "area" },
    ],
  },
  {
    id: "plugins",
    label: "Plugins",
    icon: Plug,
    singular: "plugin",
    fields: [
      { k: "nombre", label: "Plugin", type: "text", req: true },
      { k: "web", label: "Web", type: "select", opts: WEB_OPTS },
      { k: "licencia", label: "Licencia", type: "select", opts: ["Lifetime", "Anual", "Mensual", "Gratis"] },
      { k: "coste", label: "Coste (€)", type: "number" },
      { k: "renovacion", label: "Renovación", type: "date" },
      { k: "notas", label: "Notas", type: "area" },
    ],
  },
  {
    id: "tokens",
    label: "Tokens",
    icon: ShieldAlert,
    singular: "token",
    fields: [
      { k: "nombre", label: "Nombre", type: "text", req: true },
      { k: "web", label: "Web", type: "select", opts: WEB_OPTS },
      { k: "servicio", label: "Servicio", type: "text" },
      { k: "permanente", label: "¿Permanente?", type: "select", opts: ["No", "Sí"] },
      { k: "caducidad", label: "Caduca el", type: "date" },
      { k: "instrucciones", label: "Pasos para renovar", type: "area" },
    ],
  },
];

// ---------- Datos iniciales ----------
const SEED = {
  claves: [
    { id: "k1", nombre: "Anthropic API", web: "Ambas", servicio: "Anthropic", clave: "", panel: "https://console.anthropic.com/settings/keys", notas: "Clave estática, no caduca por tiempo." },
    { id: "k2", nombre: "OpenAI API", web: "Ambas", servicio: "OpenAI", clave: "", panel: "https://platform.openai.com/api-keys", notas: "Clave estática, no caduca por tiempo." },
    { id: "k3", nombre: "SerpApi", web: "Marlaboral", servicio: "SerpApi", clave: "", panel: "https://serpapi.com/manage-api-key", notas: "Importador de empleos. Plan Starter 1.000/mes." },
  ],
  cuentas: [
    { id: "c1", servicio: "Meta for Developers", web: "Marlaboral", email: "", panel: "https://developers.facebook.com/apps/", doble: "", notas: "App Marlaboral WhatsApp (bot)." },
    { id: "c2", servicio: "Hetzner", web: "Ambas", email: "", panel: "https://console.hetzner.cloud", doble: "", notas: "Servidor del n8n. REVISAR facturación." },
    { id: "c3", servicio: "Coolify", web: "Ambas", email: "", panel: "http://178.105.89.202:8000", doble: "", notas: "Despliegue de n8n." },
    { id: "c4", servicio: "Chatwoot", web: "Marlaboral", email: "info@marlaboral.es", panel: "https://app.chatwoot.com", doble: "", notas: "Account ID 172275." },
    { id: "c5", servicio: "Raiola Networks", web: "Marlaboral", email: "", panel: "https://panel.raiolanetworks.es", doble: "", notas: "Hosting de Marlaboral." },
    { id: "c6", servicio: "Dondominio", web: "Marlaboral", email: "", panel: "https://www.dondominio.com", doble: "", notas: "Dominio marlaboral.es." },
    { id: "c7", servicio: "Hostinger", web: "Artelo", email: "", panel: "https://hpanel.hostinger.com", doble: "", notas: "DNS / dominio artelo.es." },
  ],
  gastos: [
    { id: "g1", concepto: "Hosting Raiola", web: "Marlaboral", importe: "", ciclo: "Anual", renovacion: "", notas: "" },
    { id: "g2", concepto: "Servidor Hetzner", web: "Ambas", importe: "10", ciclo: "Mensual", renovacion: "", notas: "Importe por confirmar. Revisar si llegan facturas." },
    { id: "g3", concepto: "Hosting / dominio Hostinger", web: "Artelo", importe: "", ciclo: "Anual", renovacion: "", notas: "Por confirmar." },
  ],
  plugins: [],
  tokens: [
    {
      id: "t1",
      nombre: "Token Meta / WhatsApp",
      web: "Marlaboral",
      servicio: "Meta",
      permanente: "No",
      caducidad: "",
      instrucciones:
        "OBJETIVO: convertirlo en PERMANENTE (usuario del sistema) para que no caduque nunca.\n\n1. business.facebook.com > Configuracion del negocio.\n2. Usuarios > Usuarios del sistema > Agregar. Nombre, rol Administrador. Crear.\n3. Agregar activos > Apps > selecciona la app Marlaboral WhatsApp > control total. Asigna tambien la cuenta de WhatsApp.\n4. Generar token > elige la app > Caducidad: Nunca.\n5. Permisos: whatsapp_business_messaging, whatsapp_business_management.\n6. Generar token. SE MUESTRA UNA SOLA VEZ: copialo y guardalo aqui.\n7. Pega el token donde lo use el bot (Chatwoot / n8n).",
    },
  ],
};

// Accesos rápidos a saldo / consumo
const SALDO_LINKS = [
  { label: "Saldo Anthropic", url: "https://console.anthropic.com/settings/billing" },
  { label: "Consumo OpenAI", url: "https://platform.openai.com/usage" },
  { label: "Uso SerpApi", url: "https://serpapi.com/dashboard" },
];

// ---------- Utilidades ----------
const uid = () => Math.random().toString(36).slice(2, 10);

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d)) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((d - today) / 86400000);
}
function fmtDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d)) return "—";
  return d.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
}
function urgencyColor(days) {
  if (days === null) return C.mute;
  if (days < 0) return C.red;
  if (days <= 14) return C.red;
  if (days <= 30) return C.amber;
  return C.green;
}
function matchWeb(rec, web) {
  if (web === "Todo") return true;
  if (!rec.web) return true;
  return rec.web === web || rec.web === "Ambas";
}

// ---------- App ----------
export default function App() {
  const [data, setData] = useState(SEED);
  const [web, setWeb] = useState("Todo");
  const [tab, setTab] = useState("resumen");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [importOpen, setImportOpen] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get(STORAGE_KEY);
        if (r && r.value) setData(JSON.parse(r.value));
      } catch (e) {}
      setLoading(false);
    })();
  }, []);

  const persist = async (next) => {
    setData(next);
    try {
      await window.storage.set(STORAGE_KEY, JSON.stringify(next), false);
    } catch (e) {
      flash("No se pudo guardar. Haz una copia de seguridad.");
    }
  };
  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2600); };

  const saveRecord = (sectionId, record) => {
    const list = data[sectionId] || [];
    let next;
    if (record.id && list.some((x) => x.id === record.id)) {
      next = { ...data, [sectionId]: list.map((x) => (x.id === record.id ? record : x)) };
    } else {
      next = { ...data, [sectionId]: [...list, { ...record, id: uid() }] };
    }
    persist(next);
    setEditing(null);
    flash("Guardado");
  };
  const deleteRecord = (sectionId, id) => {
    persist({ ...data, [sectionId]: (data[sectionId] || []).filter((x) => x.id !== id) });
    flash("Eliminado");
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `puente-de-mando-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    flash("Copia descargada");
  };

  const stats = useMemo(() => {
    const fg = (data.gastos || []).filter((x) => matchWeb(x, web));
    const fp = (data.plugins || []).filter((x) => matchWeb(x, web));
    const ft = (data.tokens || []).filter((x) => matchWeb(x, web));

    const monthly = (arr, importeKey, cicloKey) =>
      arr.reduce((sum, x) => {
        const v = parseFloat(x[importeKey]) || 0;
        const ciclo = (x[cicloKey] || "").toLowerCase();
        if (ciclo === "mensual") return sum + v;
        if (ciclo === "anual") return sum + v / 12;
        return sum;
      }, 0);
    const gastoMes = monthly(fg, "importe", "ciclo") + monthly(fp, "coste", "licencia");

    const renovaciones = [];
    fg.forEach((g) => g.renovacion && renovaciones.push({ tipo: "Gasto", nombre: g.concepto, fecha: g.renovacion, web: g.web }));
    fp.forEach((p) => p.renovacion && renovaciones.push({ tipo: "Plugin", nombre: p.nombre, fecha: p.renovacion, web: p.web }));
    ft.forEach((t) => t.permanente !== "Sí" && t.caducidad && renovaciones.push({ tipo: "Token", nombre: t.nombre, fecha: t.caducidad, web: t.web }));
    renovaciones.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

    const tokensRiesgo = ft.filter((t) => {
      if (t.permanente === "Sí") return false;
      const d = daysUntil(t.caducidad);
      return d !== null && d <= 30;
    });
    return { gastoMes, gastoAnio: gastoMes * 12, renovaciones, tokensRiesgo };
  }, [data, web]);

  if (loading) {
    return (
      <div style={{ background: C.navy, color: C.ink, minHeight: "100vh" }} className="flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm" style={{ color: C.mute }}><Anchor size={18} /> Cargando puente de mando…</div>
      </div>
    );
  }

  const section = SECTIONS.find((s) => s.id === tab);
  const visibleRecords = section ? (data[tab] || []).filter((r) => matchWeb(r, web)) : [];

  return (
    <div style={{ background: C.navy, color: C.ink, minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <header style={{ borderBottom: `1px solid ${C.line}`, background: C.navy2 }} className="px-5 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div style={{ background: C.sky }} className="rounded-lg p-2 flex items-center justify-center"><Anchor size={20} color={C.navy} /></div>
            <div>
              <div className="text-lg font-bold tracking-tight leading-none">Puente de Mando</div>
              <div style={{ color: C.mute }} className="text-xs mt-1">Claves, cuentas, gastos y renovaciones</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportData} style={{ borderColor: C.line, color: C.ink }} className="flex items-center gap-2 text-xs border rounded-lg px-3 py-2 hover:opacity-80"><Download size={14} /> Copia</button>
            <button onClick={() => setImportOpen(true)} style={{ borderColor: C.line, color: C.ink }} className="flex items-center gap-2 text-xs border rounded-lg px-3 py-2 hover:opacity-80"><Upload size={14} /> Restaurar</button>
          </div>
        </div>
      </header>

      {/* Selector de web */}
      <div className="max-w-6xl mx-auto px-5 pt-4">
        <div className="flex items-center gap-2">
          <span style={{ color: C.mute }} className="text-xs mr-1">Viendo:</span>
          {WEBS.map((w) => (
            <button key={w} onClick={() => setWeb(w)}
              style={{
                background: web === w ? (w === "Todo" ? C.ink : webColor(w)) : C.navy2,
                color: web === w ? C.navy : C.ink,
                borderColor: web === w ? "transparent" : C.line,
              }}
              className="text-sm font-semibold border rounded-lg px-4 py-2 hover:opacity-90 transition">
              {w}
            </button>
          ))}
        </div>
      </div>

      {/* Navegación */}
      <nav className="max-w-6xl mx-auto px-5 pt-4">
        <div className="flex flex-wrap gap-2">
          <TabBtn active={tab === "resumen"} onClick={() => setTab("resumen")} icon={LayoutDashboard} label="Resumen" />
          {SECTIONS.map((s) => (
            <TabBtn key={s.id} active={tab === s.id} onClick={() => setTab(s.id)} icon={s.icon} label={s.label}
              count={(data[s.id] || []).filter((r) => matchWeb(r, web)).length} />
          ))}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-5 py-6">
        {tab === "resumen" ? (
          <Resumen stats={stats} web={web} go={setTab} />
        ) : (
          <SectionView section={section} records={visibleRecords}
            onAdd={() => setEditing({ section: tab, record: {} })}
            onEdit={(rec) => setEditing({ section: tab, record: rec })}
            onDelete={(id) => deleteRecord(tab, id)} />
        )}
      </main>

      <footer className="max-w-6xl mx-auto px-5 pb-10">
        <div style={{ background: C.navy2, borderColor: C.line, color: C.mute }} className="border rounded-lg px-4 py-3 text-xs leading-relaxed">
          Tus datos se guardan de forma privada y solo tú los ves. Para llevarlos del ordenador al móvil (o al revés) usa "Copia" en un sitio y "Restaurar" en el otro.
        </div>
      </footer>

      {editing && (
        <Editor section={SECTIONS.find((s) => s.id === editing.section)} record={editing.record}
          defaultWeb={web === "Todo" ? "Ambas" : web}
          onCancel={() => setEditing(null)} onSave={(rec) => saveRecord(editing.section, rec)} />
      )}
      {importOpen && (
        <ImportModal onClose={() => setImportOpen(false)}
          onImport={(obj) => { persist(obj); setImportOpen(false); flash("Datos restaurados"); }} />
      )}
      {toast && (
        <div style={{ background: C.green, color: C.navy }} className="fixed bottom-5 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-lg">
          <CheckCircle2 size={16} /> {toast}
        </div>
      )}
    </div>
  );
}

function TabBtn({ active, onClick, icon: Icon, label, count }) {
  return (
    <button onClick={onClick}
      style={{ background: active ? C.sky : C.navy2, color: active ? C.navy : C.ink, borderColor: active ? C.sky : C.line }}
      className="flex items-center gap-2 text-sm border rounded-lg px-3 py-2 font-medium hover:opacity-90 transition">
      <Icon size={15} />{label}
      {typeof count === "number" && (
        <span style={{ background: active ? C.navy : C.panel, color: active ? C.sky : C.mute }} className="text-xs rounded-full px-1.5 py-0.5 min-w-5 text-center">{count}</span>
      )}
    </button>
  );
}

function WebBadge({ w }) {
  if (!w) return null;
  return <span style={{ background: C.panel, color: webColor(w) }} className="text-xs rounded px-1.5 py-0.5 font-medium">{w}</span>;
}

function Card({ children, style }) {
  return <div style={{ background: C.navy2, borderColor: C.line, ...style }} className="border rounded-xl p-4">{children}</div>;
}

function Resumen({ stats, web, go }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card>
          <div style={{ color: C.mute }} className="text-xs uppercase tracking-wide">Gasto mensual {web !== "Todo" && `· ${web}`}</div>
          <div className="text-3xl font-bold mt-1" style={{ color: C.sky }}>{stats.gastoMes.toFixed(2)} €</div>
        </Card>
        <Card>
          <div style={{ color: C.mute }} className="text-xs uppercase tracking-wide">Gasto anual {web !== "Todo" && `· ${web}`}</div>
          <div className="text-3xl font-bold mt-1">{stats.gastoAnio.toFixed(0)} €</div>
        </Card>
        <Card style={{ borderColor: stats.tokensRiesgo.length ? C.red : C.line }}>
          <div style={{ color: C.mute }} className="text-xs uppercase tracking-wide">Tokens por caducar</div>
          <div className="text-3xl font-bold mt-1" style={{ color: stats.tokensRiesgo.length ? C.red : C.green }}>{stats.tokensRiesgo.length}</div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-3"><Wallet size={16} color={C.sky} /><span className="font-semibold text-sm">Saldo y consumo</span></div>
        <div className="flex flex-wrap gap-2">
          {SALDO_LINKS.map((l) => (
            <a key={l.url} href={l.url} target="_blank" rel="noreferrer"
              style={{ borderColor: C.line, color: C.ink }} className="flex items-center gap-1.5 text-sm border rounded-lg px-3 py-2 hover:opacity-80">
              {l.label} <ExternalLink size={13} color={C.sky} />
            </a>
          ))}
        </div>
      </Card>

      {stats.tokensRiesgo.length > 0 && (
        <Card style={{ borderColor: C.red }}>
          <div className="flex items-center gap-2 mb-3" style={{ color: C.red }}><AlertTriangle size={16} /><span className="font-semibold text-sm">Atención: tokens que caducan pronto</span></div>
          <div className="space-y-2">
            {stats.tokensRiesgo.map((t, i) => {
              const d = daysUntil(t.caducidad);
              return (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">{t.nombre} <WebBadge w={t.web} /></span>
                  <span style={{ color: urgencyColor(d) }} className="font-medium">{d < 0 ? `caducado hace ${-d} d` : `${d} días`}</span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <Card>
        <div className="flex items-center justify-between mb-3">
          <span className="font-semibold text-sm">Próximas renovaciones</span>
          <button onClick={() => go("gastos")} style={{ color: C.sky }} className="text-xs hover:underline">Ver gastos</button>
        </div>
        {stats.renovaciones.length === 0 ? (
          <div style={{ color: C.mute }} className="text-sm">Sin fechas de renovación todavía. Añádelas en Gastos, Plugins o Tokens.</div>
        ) : (
          <div className="space-y-2">
            {stats.renovaciones.slice(0, 8).map((r, i) => {
              const d = daysUntil(r.fecha);
              return (
                <div key={i} style={{ borderColor: C.line }} className="flex items-center justify-between text-sm border-b last:border-0 pb-2 last:pb-0">
                  <div className="flex items-center gap-2">
                    <span style={{ background: C.panel, color: C.mute }} className="text-xs rounded px-1.5 py-0.5">{r.tipo}</span>
                    <span>{r.nombre}</span>
                    <WebBadge w={r.web} />
                  </div>
                  <div className="text-right">
                    <div>{fmtDate(r.fecha)}</div>
                    <div className="text-xs" style={{ color: urgencyColor(d) }}>{d < 0 ? `hace ${-d} d` : `en ${d} d`}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

function SectionView({ section, records, onAdd, onEdit, onDelete }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2"><section.icon size={18} color={C.sky} /> {section.label}</h2>
        <button onClick={onAdd} style={{ background: C.sky, color: C.navy }} className="flex items-center gap-2 text-sm font-semibold rounded-lg px-3 py-2 hover:opacity-90"><Plus size={15} /> Añadir</button>
      </div>
      {records.length === 0 ? (
        <Card><div style={{ color: C.mute }} className="text-sm py-6 text-center">No hay nada aquí para esta vista. Pulsa "Añadir" para crear tu primer {section.singular}.</div></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {records.map((rec) => <RecordCard key={rec.id} section={section} rec={rec} onEdit={() => onEdit(rec)} onDelete={() => onDelete(rec.id)} />)}
        </div>
      )}
    </div>
  );
}

function RecordCard({ section, rec, onEdit, onDelete }) {
  const [show, setShow] = useState(false);
  const title = rec[section.fields[0].k] || "(sin nombre)";
  return (
    <Card>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap"><span className="font-semibold">{title}</span><WebBadge w={rec.web} /></div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={onEdit} style={{ color: C.mute }} className="p-1.5 rounded hover:opacity-70" title="Editar"><Pencil size={15} /></button>
          <button onClick={onDelete} style={{ color: C.red }} className="p-1.5 rounded hover:opacity-70" title="Eliminar"><Trash2 size={15} /></button>
        </div>
      </div>
      <div className="mt-2 space-y-1.5">
        {section.fields.slice(1).filter((f) => f.k !== "web").map((f) => {
          const val = rec[f.k];
          if (!val) return null;
          const isExpiry = f.k === "caducidad" || f.k === "renovacion";
          const d = isExpiry ? daysUntil(val) : null;
          return (
            <div key={f.k} className="text-sm flex gap-2">
              <span style={{ color: C.mute }} className="shrink-0 min-w-28">{f.label}</span>
              {f.type === "secret" ? (
                <span className="flex items-center gap-2 break-all">
                  <span style={{ fontFamily: "monospace" }}>{show ? val : "•".repeat(Math.min(val.length, 18))}</span>
                  <button onClick={() => setShow((s) => !s)} style={{ color: C.sky }} className="shrink-0">{show ? <EyeOff size={13} /> : <Eye size={13} />}</button>
                </span>
              ) : f.type === "url" ? (
                <a href={val} target="_blank" rel="noreferrer" style={{ color: C.sky }} className="flex items-center gap-1 break-all hover:underline">abrir panel <ExternalLink size={12} /></a>
              ) : f.type === "area" ? (
                <span style={{ whiteSpace: "pre-wrap" }} className="break-words">{val}</span>
              ) : isExpiry ? (
                <span style={{ color: urgencyColor(d) }}>{fmtDate(val)} {d !== null && <span className="text-xs">({d < 0 ? `hace ${-d} d` : `en ${d} d`})</span>}</span>
              ) : (
                <span className="break-words">{val}</span>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function Editor({ section, record, defaultWeb, onCancel, onSave }) {
  const [form, setForm] = useState(() => {
    const base = {};
    section.fields.forEach((f) => {
      if (f.k === "web") base.web = record.web ?? (defaultWeb || "Ambas");
      else base[f.k] = record[f.k] ?? (f.type === "select" ? f.opts[0] : "");
    });
    if (record.id) base.id = record.id;
    return base;
  });
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const reqMissing = section.fields.some((f) => f.req && !form[f.k]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ background: "rgba(0,5,20,0.7)" }}>
      <div style={{ background: C.navy2, borderColor: C.line }} className="border rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto">
        <div style={{ borderColor: C.line }} className="flex items-center justify-between px-5 py-4 border-b sticky top-0">
          <span className="font-semibold">{record.id ? "Editar" : "Nuevo"} {section.singular}</span>
          <button onClick={onCancel} style={{ color: C.mute }}><X size={18} /></button>
        </div>
        <div className="px-5 py-4 space-y-4" style={{ background: C.navy2 }}>
          {section.fields.map((f) => (
            <div key={f.k}>
              <label style={{ color: C.mute }} className="text-xs block mb-1.5">{f.label}{f.req && " *"}</label>
              {f.type === "area" ? (
                <textarea value={form[f.k]} onChange={(e) => set(f.k, e.target.value)} rows={f.k === "instrucciones" ? 8 : 3}
                  style={{ background: C.navy, borderColor: C.line, color: C.ink }} className="w-full border rounded-lg px-3 py-2 text-sm outline-none" />
              ) : f.type === "select" ? (
                <select value={form[f.k]} onChange={(e) => set(f.k, e.target.value)}
                  style={{ background: C.navy, borderColor: C.line, color: C.ink }} className="w-full border rounded-lg px-3 py-2 text-sm outline-none">
                  {f.opts.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"} value={form[f.k]} onChange={(e) => set(f.k, e.target.value)}
                  style={{ background: C.navy, borderColor: C.line, color: C.ink }} className="w-full border rounded-lg px-3 py-2 text-sm outline-none" />
              )}
            </div>
          ))}
        </div>
        <div style={{ borderColor: C.line }} className="flex items-center justify-end gap-2 px-5 py-4 border-t">
          <button onClick={onCancel} style={{ borderColor: C.line, color: C.ink }} className="text-sm border rounded-lg px-4 py-2">Cancelar</button>
          <button onClick={() => onSave(form)} disabled={reqMissing}
            style={{ background: reqMissing ? C.panel : C.green, color: reqMissing ? C.mute : C.navy }}
            className="flex items-center gap-2 text-sm font-semibold rounded-lg px-4 py-2"><Save size={15} /> Guardar</button>
        </div>
      </div>
    </div>
  );
}

function ImportModal({ onClose, onImport }) {
  const [text, setText] = useState("");
  const [err, setErr] = useState("");
  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setText(String(reader.result));
    reader.readAsText(file);
  };
  const apply = () => {
    try {
      const obj = JSON.parse(text);
      if (typeof obj !== "object") throw new Error();
      onImport(obj);
    } catch { setErr("El archivo no es válido. Usa una copia descargada desde esta app."); }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,5,20,0.7)" }}>
      <div style={{ background: C.navy2, borderColor: C.line }} className="border rounded-2xl w-full max-w-lg">
        <div style={{ borderColor: C.line }} className="flex items-center justify-between px-5 py-4 border-b">
          <span className="font-semibold">Restaurar copia</span>
          <button onClick={onClose} style={{ color: C.mute }}><X size={18} /></button>
        </div>
        <div className="px-5 py-4 space-y-3">
          <p style={{ color: C.mute }} className="text-xs">Sube el archivo .json de una copia anterior, o pega su contenido. Esto reemplaza todos los datos actuales.</p>
          <input type="file" accept="application/json" onChange={handleFile} style={{ color: C.mute }} className="text-xs" />
          <textarea value={text} onChange={(e) => { setText(e.target.value); setErr(""); }} rows={6} placeholder="…o pega aquí el contenido del archivo"
            style={{ background: C.navy, borderColor: C.line, color: C.ink }} className="w-full border rounded-lg px-3 py-2 text-sm outline-none" />
          {err && <div style={{ color: C.red }} className="text-xs">{err}</div>}
        </div>
        <div style={{ borderColor: C.line }} className="flex items-center justify-end gap-2 px-5 py-4 border-t">
          <button onClick={onClose} style={{ borderColor: C.line, color: C.ink }} className="text-sm border rounded-lg px-4 py-2">Cancelar</button>
          <button onClick={apply} disabled={!text} style={{ background: text ? C.amber : C.panel, color: text ? C.navy : C.mute }} className="text-sm font-semibold rounded-lg px-4 py-2">Restaurar</button>
        </div>
      </div>
    </div>
  );
}
