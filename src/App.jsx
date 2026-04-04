import React from "react";
import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";

/* ─────────────────────────────────────────────
   THEME CONTEXT
───────────────────────────────────────────── */
const ThemeContext = createContext();

const THEMES = {
  dark: {
    bg: "#07071a",
    bg2: "#0d0d2b",
    bg3: "#111130",
    card: "rgba(255,255,255,0.04)",
    cardHover: "rgba(255,255,255,0.07)",
    border: "rgba(255,255,255,0.08)",
    borderGlow: "rgba(0,201,255,0.3)",
    cyan: "#00c9ff",
    orange: "#ff6b35",
    green: "#00e676",
    yellow: "#ffd60a",
    red: "#ff3b47",
    purple: "#9d4edd",
    textPrimary: "#e2e8f8",
    textSecondary: "rgba(226,232,248,0.6)",
    textMuted: "rgba(226,232,248,0.35)",
  },
  light: {
    bg: "#fafafa",
    bg2: "#f5f5f7",
    bg3: "#efefef",
    card: "rgba(0,0,0,0.04)",
    cardHover: "rgba(0,0,0,0.06)",
    border: "rgba(0,0,0,0.08)",
    borderGlow: "rgba(0,201,255,0.2)",
    cyan: "#0099cc",
    orange: "#ff6b35",
    green: "#00b050",
    yellow: "#ffb400",
    red: "#ff3b47",
    purple: "#7d2aea",
    textPrimary: "#1a1a1a",
    textSecondary: "rgba(0,0,0,0.6)",
    textMuted: "rgba(0,0,0,0.45)",
  }
};

const useTheme = () => useContext(ThemeContext);

/* ─────────────────────────────────────────────
   GLOBAL STYLES
───────────────────────────────────────────── */
const GlobalStyle = ({ theme }) => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    body,#root{background:${theme.bg};color:${theme.textPrimary};font-family:'Plus Jakarta Sans',sans-serif;min-height:100vh;overflow-x:hidden;transition:background-color 0.3s ease, color 0.3s ease}
    ::-webkit-scrollbar{width:4px}
    ::-webkit-scrollbar-track{background:rgba(255,255,255,${theme === THEMES.dark ? '0.03' : '0.06'})}
    ::-webkit-scrollbar-thumb{background:${theme.cyan};border-radius:2px;opacity:0.3}
    input,select,textarea{outline:none;font-family:'Plus Jakarta Sans',sans-serif;transition:border-color 0.2s, background-color 0.2s}
    button{cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif}
    .glow-cyan{text-shadow:0 0 20px ${theme.cyan}60}
    .glow-orange{text-shadow:0 0 20px ${theme.orange}60}
    @keyframes pulse-ring{0%{transform:scale(0.8);opacity:1}100%{transform:scale(1.6);opacity:0}}
    @keyframes scroll-x { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
    @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
    @keyframes spin-slow{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
    .shimmer-text{background:linear-gradient(90deg,${theme.cyan},#fff,${theme.cyan});background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer 3s linear infinite}
    .gradient-border{position:relative}
    .gradient-border::before{content:'';position:absolute;inset:-1px;border-radius:inherit;background:linear-gradient(135deg,${theme.cyan}40,${theme.orange}20,${theme.cyan}10);z-index:-1}
  `}</style>
);

const glass = (theme) => (extra = {}) => ({
  background: theme === THEMES.dark ? "rgba(13,13,43,0.7)" : "rgba(255,255,255,0.7)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: `1px solid ${theme.border}`,
  borderRadius: 16,
  transition: "all 0.3s ease",
  ...extra,
});

/* ─────────────────────────────────────────────
   MOCK DATA & CONSTANTS
───────────────────────────────────────────── */
const ZONES = [
  { name: "Hyderabad Central", risk: 62, claims: 21, workers: 89, premium: "₹35", isSafe: false },
  { name: "Secunderabad", risk: 78, claims: 28, workers: 102, premium: "₹50", isSafe: false },
  { name: "Begumpet", risk: 45, claims: 12, workers: 150, premium: "₹30", isSafe: true },
  { name: "Bannerghatta", risk: 28, claims: 8, workers: 156, premium: "₹33", isSafe: true },
  { name: "Whitefield", risk: 22, claims: 5, workers: 210, premium: "₹18", isSafe: true },
];

const WEEKLY_DATA = [
  { week: "W1", claims: 12, payouts: 4200, fraud: 1 },
  { week: "W2", claims: 19, payouts: 6650, fraud: 3 },
  { week: "W3", claims: 8, payouts: 2800, fraud: 0 },
  { week: "W4", claims: 24, payouts: 8400, fraud: 5 },
  { week: "W5", claims: 31, payouts: 10850, fraud: 4 },
  { week: "W6", claims: 18, payouts: 6300, fraud: 2 },
  { week: "W7", claims: 27, payouts: 9450, fraud: 7 },
  { week: "W8", claims: 35, payouts: 12250, fraud: 3 },
];

/* ─────────────────────────────────────────────
   CORE UTILITY COMPONENTS
───────────────────────────────────────────── */
const Badge = ({ children, color = null, bg, theme = THEMES.dark }) => {
  const C = theme;
  const col = color || C.cyan;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
      color: col, background: bg || `${col}18`, border: `1px solid ${col}30`,
      textTransform: "uppercase", letterSpacing: "0.05em",
    }}>{children}</span>
  );
};

const Dot = ({ color, pulse }) => (
  <span style={{ position: "relative", display: "inline-block", width: 8, height: 8 }}>
    {pulse && <span style={{
      position: "absolute", inset: -2, borderRadius: "50%",
      background: color, animation: "pulse-ring 1.5s ease-out infinite",
    }} />}
    <span style={{ display: "block", width: 8, height: 8, borderRadius: "50%", background: color }} />
  </span>
);

const StatCard = ({ label, value, sub, icon, color = null, change, theme = THEMES.dark }) => {
  const C = theme;
  const colors = color || C.cyan;
  return (
    <motion.div
      whileHover={{ y: -3, borderColor: `${colors}50` }}
      style={{ ...glass(theme)({ padding: "20px 24px", cursor: "default" }), borderColor: `${colors}20`, transition: "border-color 0.3s" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <span style={{ fontSize: 12, color: C.textMuted, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
        <span style={{ fontSize: 20 }}>{icon}</span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "Outfit", color: C.textPrimary, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: C.textSecondary, marginTop: 6 }}>{sub}</div>}
      {change !== undefined && (
        <div style={{ fontSize: 12, color: change >= 0 ? C.green : C.red, marginTop: 6, fontWeight: 600 }}>
          {change >= 0 ? "↑" : "↓"} {Math.abs(change)}% vs last week
        </div>
      )}
    </motion.div>
  );
};

const ProgressBar = ({ value, max = 100, color = null, height = 6, theme = THEMES.dark }) => {
  const C = theme;
  const col = color || C.cyan;
  return (
    <div style={{ background: C.cardHover, borderRadius: 99, height, overflow: "hidden" }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${(value / max) * 100}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        style={{ height: "100%", background: `linear-gradient(90deg, ${col}, ${col}aa)`, borderRadius: 99 }}
      />
    </div>
  );
};

/* ─────────────────────────────────────────────
   PHASE 2 SPECIAL COMPONENTS
───────────────────────────────────────────── */
const LiveTicker = ({ theme = THEMES.dark }) => {
  const C = theme;
  const items = [...ZONES, ...ZONES].map((z, i) => (
    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 24px" }}>
      <Dot color={z.risk > 60 ? C.red : C.green} pulse={z.risk > 60} />
      <span style={{ fontSize: 11, fontWeight: 700, color: C.textPrimary }}>{z.name.toUpperCase()}</span>
      <span style={{ fontSize: 11, color: C.textSecondary }}>AQI: {Math.floor(Math.random() * 50 + 20)}</span>
      <span style={{ fontSize: 11, color: C.cyan }}>PREMIUM: {z.premium}</span>
    </div>
  ));
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 32, background: C.bg2, borderBottom: `1px solid ${C.border}`, zIndex: 10000, display: "flex", alignItems: "center", overflow: "hidden" }}>
      <div style={{ display: "flex", animation: "scroll-x 40s linear infinite", paddingLeft: "100%" }}>{items}</div>
    </div>
  );
};

const KYCModal = ({ onVerify, theme = THEMES.dark }) => {
  const C = theme;
  const [step, setStep] = useState(0);
  const runVerification = async () => {
    setStep(1); await new Promise(r => setTimeout(r, 1500));
    setStep(2); await new Promise(r => setTimeout(r, 2000));
    setStep(3); await new Promise(r => setTimeout(r, 1000));
    onVerify();
  };
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} style={{ ...glass(theme)({ padding: 32, maxWidth: 400, textAlign: "center" }) }}>
        {step === 0 ? (
          <>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🪪</div>
            <h2 style={{ fontFamily: "Outfit", fontSize: 22, fontWeight: 800, color: C.textPrimary, marginBottom: 8 }}>Verify Identity</h2>
            <p style={{ fontSize: 14, color: C.textSecondary, marginBottom: 24 }}>Activate AI insurance benefits by verifying your partner ID.</p>
            <motion.button onClick={runVerification} style={{ width: "100%", padding: 14, borderRadius: 12, border: "none", background: C.cyan, color: C.bg, fontWeight: 700 }}>Start AI Verification</motion.button>
          </>
        ) : step === 1 ? (
          <h2 style={{ fontSize: 20, color: C.textPrimary }}>📤 Uploading...</h2>
        ) : step === 2 ? (
          <h2 style={{ fontSize: 20, color: C.textPrimary }}>⚡ Analyzing Bio-Data...</h2>
        ) : (
          <h2 style={{ fontSize: 20, color: C.green }}>✅ Verified!</h2>
        )}
      </motion.div>
    </motion.div>
  );
};

const AIPricingModal = ({ tier, user, theme = THEMES.dark, onClose }) => {
  const C = theme;
  const data = [{ name: 'Climate', value: 45, color: C.cyan }, { name: 'Zone', value: 25, color: C.purple }, { name: 'History', value: 30, color: C.orange }];
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)", zIndex: 11000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} style={{ ...glass(theme)({ padding: 32, maxWidth: 500, width: "100%" }) }}>
        <h2 style={{ fontFamily: "Outfit", fontSize: 22, fontWeight: 800, color: C.textPrimary, marginBottom: 24 }}>AI Pricing Insight</h2>
        <div style={{ height: 260, marginBottom: 24 }}>
          <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data} innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">{data.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>
        </div>
        <p style={{ fontSize: 13, color: C.textSecondary, marginBottom: 24 }}>Premium for {user.zone} is optimized based on environmental risk patterns.</p>
        <button onClick={onClose} style={{ width: "100%", padding: 14, background: C.cyan, color: C.bg, borderRadius: 12, border: "none", fontWeight: 700 }}>Understood</button>
      </motion.div>
    </motion.div>
  );
};

const CommandCenter = ({ theme = THEMES.dark, addToast }) => {
  const C = theme;
  const [activeEmergency, setActiveEmergency] = useState(null);
  return (
    <div style={{ ...glass(theme)({ padding: 24 }) }}>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: C.textPrimary, marginBottom: 24 }}>Emergency Command Center</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {ZONES.map(z => (
          <div key={z.name} style={{ ...glass(theme)({ padding: 16 }) }}>
             <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontWeight: 700 }}>{z.name}</span>
                <Dot color={activeEmergency === z.name ? C.red : C.green} pulse={activeEmergency === z.name} />
             </div>
             <button onClick={() => { setActiveEmergency(z.name); addToast({ type: "error", title: "Emergency Triggered", msg: `${z.name} protocol active` }); }} 
               style={{ width: "100%", padding: 10, background: C.red, color: "#fff", borderRadius: 8, border: "none" }}>TRIGGER OVERRIDE</button>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   BUSINESS LOGIC COMPONENTS
───────────────────────────────────────────── */
const ThemeToggle = ({ theme, setTheme, C }) => (
  <motion.button onClick={() => setTheme(theme === THEMES.dark ? THEMES.light : THEMES.dark)} style={{ width: 40, height: 40, borderRadius: 12, border: `1px solid ${C.border}`, background: C.card, color: C.cyan }}>{theme === THEMES.dark ? "🌙" : "☀️"}</motion.button>
);

const Background = ({ theme }) => {
    const colors = theme === THEMES.dark ? { c1: "rgba(0,201,255,0.07)", c2: "rgba(255,107,53,0.06)" } : { c1: "rgba(0,153,204,0.05)", c2: "rgba(255,107,53,0.04)" };
    return (
        <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
            <div style={{ position: "absolute", top: -100, left: -100, width: 600, height: 600, borderRadius: "50%", background: `radial-gradient(circle, ${colors.c1} 0%, transparent 70%)` }} />
            <div style={{ position: "absolute", bottom: -100, right: -100, width: 600, height: 600, borderRadius: "50%", background: `radial-gradient(circle, ${colors.c2} 0%, transparent 70%)` }} />
        </div>
    );
};

const AuthPage = ({ onLogin, addToast, theme, setTheme }) => {
    const C = theme;
    const [mode, setMode] = useState("login");
    const [form, setForm] = useState({ name: "", email: "", password: "", zone: "" });
    const [loading, setLoading] = useState(false);
    const handle = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/auth/${mode}`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            });
            const data = await res.json();
            if (data.success) {
                localStorage.setItem('token', data.data.token);
                onLogin({ ...data.data.user, avatar: data.data.user.name[0], id: data.data.user._id });
            } else { addToast({ type: "error", title: "Error", msg: data.message }); }
        } catch (e) { addToast({ type: "error", title: "Network Error" }); }
        setLoading(false);
    };
    return (
        <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <div style={{ ...glass(theme)({ padding: 32, width: 400 }) }}>
                <h1 style={{ textAlign: "center", marginBottom: 24, fontSize: 24, fontWeight: 800 }}>GigShield</h1>
                <div style={{ display: "flex", background: C.cardHover, borderRadius: 8, padding: 4, marginBottom: 24 }}>
                    <button onClick={() => setMode("login")} style={{ flex: 1, padding: 8, background: mode === "login" ? C.cyan : "transparent", color: mode === "login" ? C.bg : C.textSecondary, borderRadius: 6, border: "none" }}>Login</button>
                    <button onClick={() => setMode("register")} style={{ flex: 1, padding: 8, background: mode === "register" ? C.cyan : "transparent", color: mode === "register" ? C.bg : C.textSecondary, borderRadius: 6, border: "none" }}>Register</button>
                </div>
                {mode === "register" && <input placeholder="Name" onChange={e => setForm({...form, name: e.target.value})} style={{ width: "100%", padding: 12, marginBottom: 12, background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, color: C.textPrimary }} />}
                <input placeholder="Email" onChange={e => setForm({...form, email: e.target.value})} style={{ width: "100%", padding: 12, marginBottom: 12, background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, color: C.textPrimary }} />
                {mode === "register" && (
                    <select 
                        value={form.zone} 
                        onChange={e => setForm({...form, zone: e.target.value})}
                        style={{ width: "100%", padding: 12, marginBottom: 12, background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, color: C.textPrimary }}
                    >
                        <option value="" disabled>Select Operational Zone</option>
                        {ZONES.map(z => <option key={z.name} value={z.name}>{z.name}</option>)}
                    </select>
                )}
                <input type="password" placeholder="Password" onChange={e => setForm({...form, password: e.target.value})} style={{ width: "100%", padding: 12, marginBottom: 24, background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, color: C.textPrimary }} />
                <button onClick={handle} style={{ width: "100%", padding: 14, background: C.cyan, color: C.bg, borderRadius: 8, border: "none", fontWeight: 700 }}>{loading ? "..." : mode.toUpperCase()}</button>
            </div>
        </div>
    );
};

const ClaimsTable = ({ claims, theme }) => {
    const C = theme;
    return (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr style={{ borderBottom: `1px solid ${C.border}` }}>{["Trigger", "Zone", "Amount", "Status"].map(h => <th key={h} style={{ padding: 12, textAlign:"left", fontSize: 11, color: C.textMuted }}>{h}</th>)}</tr></thead>
            <tbody>{claims.map(c => <tr key={c.id} style={{ borderBottom: `1px solid ${C.border}` }}><td style={{ padding: 12 }}>{c.trigger}</td><td style={{ padding: 12 }}>{c.zone}</td><td style={{ padding: 12, fontWeight: 700 }}>₹{c.amount}</td><td style={{ padding: 12 }}><Badge color={c.status === "paid" ? C.green : C.yellow}>{c.status}</Badge></td></tr>)}</tbody>
        </table>
    );
};

const PolicySection = ({ user, policy, onCreatePolicy, theme }) => {
    const C = theme;
    const [showAIInsight, setShowAIInsight] = useState(null);
    const tiers = [{ level: "Basic", premium: 18, zones: "Safe" }, { level: "Standard", premium: 35, zones: "Medium" }, { level: "Premium", premium: 50, zones: "High" }];
    return (
        <div style={{ ...glass(theme)({ padding: 24 }) }}>
            {showAIInsight && <AIPricingModal theme={theme} user={user} tier={showAIInsight} onClose={() => setShowAIInsight(null)} />}
            <h3 style={{ marginBottom: 16 }}>Income Protection</h3>
            {policy ? (
                <div style={{ background: `${C.cyan}10`, padding: 16, borderRadius: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}><span>Active Coverage</span><Badge color={C.green}>ACTIVE</Badge></div>
                    <button onClick={() => setShowAIInsight({ premium: policy.premium })} style={{ background: "none", border: "none", color: C.cyan, fontSize: 11, textDecoration: "underline", marginTop: 8 }}>Why this price?</button>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                    {tiers.map(t => (
                        <div key={t.level} style={{ padding: 16, background: C.cardHover, borderRadius: 12 }}>
                            <div style={{ fontWeight: 700 }}>₹{t.premium}</div>
                            <div style={{ fontSize: 11, color: C.textMuted }}>{t.level}</div>
                            <button onClick={() => onCreatePolicy(t)} style={{ width: "100%", marginTop: 12, padding: 6, background: C.cyan, border: "none", borderRadius: 6, fontSize: 11 }}>Activate</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const DisruptionMonitor = ({ userZone, onClaim, addToast, theme }) => {
    const C = theme;
    return (
        <div style={{ ...glass(theme)({ padding: 24 }) }}>
            <h3 style={{ marginBottom: 16 }}>Disruption Monitor</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[{ type: "rain", l: "Heavy Rain" }, { type: "aqi", l: "AQI Spike" }].map(t => (
                    <button key={t.type} onClick={() => onClaim(t)} style={{ padding: 12, background: C.cardHover, color: C.textPrimary, border: `1px solid ${C.border}`, borderRadius: 8 }}>{t.l}</button>
                ))}
            </div>
        </div>
    );
};

const WorkerDashboard = ({ user, claims, policy, onClaim, onCreatePolicy, onLogout, theme, setTheme }) => {
    const C = theme;
    const [tab, setTab] = useState("overview");
    return (
        <div style={{ minHeight: "100vh", position: "relative", zIndex: 1, paddingTop: 32 }}>
            <nav style={{ padding: "0 32px", display: "flex", height: 64, alignItems: "center", borderBottom: `1px solid ${C.border}`, background: C.bg2 }}>
                <span style={{ fontWeight: 800, marginRight: "auto" }}>GigShield</span>
                <div style={{ display: "flex", gap: 12, marginRight: 24 }}>
                    {["overview", "monitor", "claims"].map(t => <button key={t} onClick={() => setTab(t)} style={{ background: "none", border: "none", color: tab === t ? C.cyan : C.textSecondary }}>{t.toUpperCase()}</button>)}
                </div>
                <ThemeToggle theme={theme} setTheme={setTheme} C={C} />
                <button onClick={onLogout} style={{ marginLeft: 12 }}>Out</button>
            </nav>
            <div style={{ padding: 32, maxWidth: 1000, margin: "0 auto" }}>
                {tab === "overview" && <PolicySection user={user} policy={policy} onCreatePolicy={onCreatePolicy} theme={theme} />}
                {tab === "monitor" && <DisruptionMonitor userZone={user.zone} onClaim={onClaim} theme={theme} />}
                {tab === "claims" && <ClaimsTable claims={claims} theme={theme} />}
            </div>
        </div>
    );
};

const AdminDashboard = ({ onLogout, addToast, theme, setTheme }) => {
    const C = theme;
    const [workers, setWorkers] = useState([]);
    const [tab, setTab] = useState("overview");
    useEffect(() => {
        const fetchW = async () => {
            const res = await fetch(`/api/auth/workers`, { headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` } });
            const data = await res.json(); if (data.success) setWorkers(data.data);
        }; fetchW();
    }, []);
    return (
        <div style={{ minHeight: "100vh", position: "relative", zIndex: 1, paddingTop: 32 }}>
            <nav style={{ padding: "0 32px", display: "flex", height: 64, alignItems: "center", borderBottom: `1px solid ${C.border}`, background: C.bg2 }}>
                <span style={{ fontWeight: 800, marginRight: "auto" }}>Admin Shield</span>
                <div style={{ display: "flex", gap: 12 }}>
                    {["overview", "workers", "command"].map(t => <button key={t} onClick={() => setTab(t)} style={{ background: "none", border: "none", color: tab === t ? C.orange : C.textSecondary }}>{t.toUpperCase()}</button>)}
                </div>
                <button onClick={onLogout}>Out</button>
            </nav>
            <div style={{ padding: 32 }}>
                {tab === "workers" && (
                    <table style={{ width: "100%" }}>
                        <thead><tr><th>Name</th><th>Zone</th><th>Email</th></tr></thead>
                        <tbody>{workers.map(w => <tr key={w._id}><td>{w.name}</td><td>{w.zone}</td><td>{w.email}</td></tr>)}</tbody>
                    </table>
                )}
                {tab === "command" && <CommandCenter theme={theme} addToast={addToast} />}
            </div>
        </div>
    );
};

const Toast = ({ toasts, removeToast, theme }) => {
    const C = theme;
    return (
        <div style={{ position: "fixed", top: 40, right: 20, zIndex: 20000 }}>
            {toasts.map(t => (
                <div key={t.id} style={{ padding: 12, background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 8, marginBottom: 8 }}>
                    <div style={{ fontWeight: 700 }}>{t.title}</div>
                    <div style={{ fontSize: 11 }}>{t.msg}</div>
                </div>
            ))}
        </div>
    );
};

/* ─────────────────────────────────────────────
   ROOT APP
───────────────────────────────────────────── */
export default function App() {
  const [theme, setTheme] = useState(THEMES.dark);
  const [user, setUser] = useState(null);
  const [isKycVerified, setIsKycVerified] = useState(false);
  const [showKycModal, setShowKycModal] = useState(false);
  const [policy, setPolicy] = useState(null);
  const [claims, setClaims] = useState([]);
  const [toasts, setToasts] = useState([]);

  const addToast = (t) => { const id = Date.now(); setToasts(p => [...p, {...t, id}]); setTimeout(() => setToasts(p => p.filter(x => x.id !== id)), 3000); };

  const loadData = async (u) => {
    const token = localStorage.getItem('token');
    const pRes = await fetch(`/api/policy/active`, { headers: { "Authorization": `Bearer ${token}` } });
    const pData = await pRes.json(); if (pData.success) setPolicy(pData.data);
    const cRes = await fetch(`/api/claim/user`, { headers: { "Authorization": `Bearer ${token}` } });
    const cData = await cRes.json(); if (cData.success) setClaims(cData.data.map(c => ({ id: c._id, trigger: c.triggerType, zone: c.zone, amount: c.amount, status: c.status })));
  };

  const handleLogin = (u) => { 
      setUser(u); loadData(u); 
      if (u.role === 'worker' && !isKycVerified) setTimeout(() => setShowKycModal(true), 1500);
  };

  const handleClaim = async (trig) => {
      const res = await fetch(`/api/claim/auto`, {
          method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem('token')}` },
          body: JSON.stringify({ triggerType: trig.type === 'rain' ? 'rainfall' : trig.type, zone: user.zone, triggerValue: 60, gpsData: { lat: 0, lng: 0 } })
      });
      const data = await res.json();
      if (data.success) {
          addToast({ type: "success", title: "Claim Auto-Processed", msg: "AI verified genuine disruption." });
          loadData(user);
      }
  };

  const handleCreatePolicy = async (t) => {
      const res = await fetch(`/api/policy/create`, {
          method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem('token')}` },
          body: JSON.stringify({ level: t.level.toLowerCase(), zone: user.zone })
      });
      const data = await res.json();
      if (data.success) { setPolicy(data.data.policy); addToast({ type: "success", title: "Policy Active" }); }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <GlobalStyle theme={theme} />
      <Background theme={theme} />
      <LiveTicker theme={theme} />
      <Toast toasts={toasts} theme={theme} />
      {showKycModal && <KYCModal theme={theme} onVerify={() => { setIsKycVerified(true); setShowKycModal(false); addToast({ type: "success", title: "KYC Verified" }); }} />}
      {!user ? (
          <AuthPage onLogin={handleLogin} addToast={addToast} theme={theme} setTheme={setTheme} />
      ) : user.role === "admin" ? (
          <AdminDashboard onLogout={() => setUser(null)} addToast={addToast} theme={theme} setTheme={setTheme} />
      ) : (
          <WorkerDashboard user={user} claims={claims} policy={policy} onClaim={handleClaim} onCreatePolicy={handleCreatePolicy} onLogout={() => setUser(null)} theme={theme} setTheme={setTheme} />
      )}
    </ThemeContext.Provider>
  );
}
