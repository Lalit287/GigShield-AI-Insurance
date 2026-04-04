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
    @keyframes ticker{0%{transform:translateY(0)}100%{transform:translateY(-50%)}}
    @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
    @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
    @keyframes spin-slow{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
    @keyframes gradient-shift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
    @keyframes number-pop{0%{transform:scale(1)}50%{transform:scale(1.15)}100%{transform:scale(1)}}
    @keyframes skeleton-loading{0%{background-position:-1000px 0}100%{background-position:1000px 0}}
    .shimmer-text{background:linear-gradient(90deg,${theme.cyan},#fff,${theme.cyan});background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer 3s linear infinite}
    .gradient-border{position:relative}
    .gradient-border::before{content:'';position:absolute;inset:-1px;border-radius:inherit;background:linear-gradient(135deg,${theme.cyan}40,${theme.orange}20,${theme.cyan}10);z-index:-1}
    .skeleton-loading{background:linear-gradient(90deg, ${theme.bg3} 0%, ${theme.cardHover} 50%, ${theme.bg3} 100%);background-size:1000px 100%;animation:skeleton-loading 2s infinite}
  `}</style>
);

/* ─────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────── */
// C will be dynamically assigned based on theme

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
   THEME TOGGLE COMPONENT
───────────────────────────────────────────── */
const ThemeToggle = ({ theme, setTheme, C }) => {
  const isDark = theme === THEMES.dark;
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => {
        const newTheme = isDark ? THEMES.light : THEMES.dark;
        setTheme(newTheme);
        localStorage.setItem("gigshield-theme", isDark ? "light" : "dark");
      }}
      style={{
        width: 40,
        height: 40,
        borderRadius: 12,
        border: `1px solid ${C.border}`,
        background: C.card,
        color: C.cyan,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 18,
        transition: "all 0.3s",
      }}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {isDark ? "🌙" : "☀️"}
    </motion.button>
  );
};

/* ─────────────────────────────────────────────
   MOCK DATA STORE
───────────────────────────────────────────── */
const USERS = [
  { id: "u1", name: "Rahul Sharma", email: "rahul@demo.com", password: "demo123", role: "worker", zone: "Hyderabad Central", riskLevel: "medium", avatar: "RS" },
  { id: "u2", name: "Priya Patel", email: "priya@demo.com", password: "demo123", role: "worker", zone: "Kukatpally", riskLevel: "high", avatar: "PP" },
  { id: "admin", name: "Admin User", email: "admin@gigshield.ai", password: "admin123", role: "admin", avatar: "AD" },
];

const INITIAL_CLAIMS = [
  { id: "c1", userId: "u1", trigger: "Rainfall > 52mm", triggerType: "rain", amount: 280, status: "paid", fraudScore: 8, date: "2024-01-15", zone: "Hyderabad Central", payoutTime: "2.3s" },
  { id: "c2", userId: "u1", trigger: "AQI > 310", triggerType: "aqi", amount: 210, status: "paid", fraudScore: 12, date: "2024-01-22", zone: "Hyderabad Central", payoutTime: "1.8s" },
  { id: "c3", userId: "u1", trigger: "Temperature > 43°C", triggerType: "temp", amount: 175, status: "paid", fraudScore: 5, date: "2024-02-03", zone: "Hyderabad Central", payoutTime: "3.1s" },
  { id: "c4", userId: "u2", trigger: "Rainfall > 68mm", triggerType: "rain", amount: 350, status: "paid", fraudScore: 22, date: "2024-02-10", zone: "Kukatpally", payoutTime: "4.2s" },
  { id: "c5", userId: "u2", trigger: "AQI > 340", triggerType: "aqi", amount: 280, status: "reviewing", fraudScore: 61, date: "2024-02-18", zone: "Kukatpally", payoutTime: "-" },
  { id: "c6", userId: "u1", trigger: "Curfew Alert", triggerType: "curfew", amount: 420, status: "paid", fraudScore: 3, date: "2024-02-25", zone: "Hyderabad Central", payoutTime: "1.1s" },
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

const ZONES = [
  { name: "Kukatpally", risk: 87, claims: 34, workers: 128, premium: "₹50", isSafe: false },
  { name: "Whitefield", risk: 22, claims: 5, workers: 210, premium: "₹18", isSafe: true, aiNote: "Safe Zone Discount Applied (₹2)" },
  { name: "Bannerghatta", risk: 28, claims: 8, workers: 156, premium: "₹33", isSafe: true, aiNote: "Safe Zone Discount Applied (₹2)" },
  { name: "Hitech City", risk: 62, claims: 21, workers: 89, premium: "₹35", isSafe: false },
  { name: "Secunderabad", risk: 78, claims: 28, workers: 102, premium: "₹50", isSafe: false },
  { name: "Outerring", risk: 25, claims: 4, workers: 320, premium: "₹33", isSafe: true, aiNote: "Safe Zone Discount Applied (₹2)" },
];

/* ─────────────────────────────────────────────
   UTILITY COMPONENTS
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

const Toast = ({ toasts, removeToast, theme = THEMES.dark }) => {
  const C = theme;
  return (
    <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8 }}>
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div key={t.id}
            initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 100, opacity: 0 }}
            style={{
              ...glass(theme)({ padding: "14px 20px", minWidth: 280, borderRadius: 12 }),
              borderLeft: `3px solid ${t.type === "success" ? C.green : t.type === "error" ? C.red : C.cyan}`,
              display: "flex", alignItems: "center", gap: 12,
            }}
          >
            <span style={{ fontSize: 18 }}>{t.type === "success" ? "✅" : t.type === "error" ? "⚠️" : "ℹ️"}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>{t.title}</div>
              {t.msg && <div style={{ fontSize: 12, color: C.textSecondary, marginTop: 2 }}>{t.msg}</div>}
            </div>
            <button onClick={() => removeToast(t.id)} style={{ background: "none", border: "none", color: C.textMuted, marginLeft: "auto", fontSize: 16 }}>×</button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

/* ─────────────────────────────────────────────
   BACKGROUND
───────────────────────────────────────────── */
const Background = ({ theme = THEMES.dark }) => {
  const colors = theme === THEMES.dark 
    ? {
        cyan: "rgba(0,201,255,0.07)",
        orange: "rgba(255,107,53,0.06)",
        purple: "rgba(157,78,221,0.05)",
        grid: "rgba(0,201,255,1)"
      }
    : {
        cyan: "rgba(0,153,204,0.05)",
        orange: "rgba(255,107,53,0.04)",
        purple: "rgba(125,42,234,0.03)",
        grid: "rgba(0,153,204,0.3)"
      };

  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", zIndex: 0, pointerEvents: "none" }}>
      <div style={{ position: "absolute", top: "-20%", left: "-10%", width: 700, height: 700, borderRadius: "50%", background: `radial-gradient(circle, ${colors.cyan} 0%, transparent 70%)` }} />
      <div style={{ position: "absolute", bottom: "-10%", right: "-5%", width: 600, height: 600, borderRadius: "50%", background: `radial-gradient(circle, ${colors.orange} 0%, transparent 70%)` }} />
      <div style={{ position: "absolute", top: "40%", left: "30%", width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle, ${colors.purple} 0%, transparent 70%)` }} />
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.03 }}>
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke={colors.grid} strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );
};

/* ─────────────────────────────────────────────
   AUTH PAGE
───────────────────────────────────────────── */
const AuthPage = ({ onLogin, addToast, theme = THEMES.dark, setTheme }) => {
  const C = theme;
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", zone: "Hyderabad Central" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handle = async () => {
    setErr(""); setLoading(true);
    
    try {
      const endpoint = mode === "login" ? "http://localhost:5000/api/auth/login" : "http://localhost:5000/api/auth/register";
      const payload = mode === "login" 
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password, zone: form.zone || "Hyderabad Central", role: "worker" };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (!data.success) {
        setErr(data.message || "Authentication failed");
        setLoading(false);
        return;
      }
      
      const userObj = data.data.user;
      
      // Calculate frontend properties
      const u = {
        id: userObj._id,
        name: userObj.name,
        email: userObj.email,
        role: userObj.role,
        zone: userObj.zone || "Hyderabad Central",
        riskLevel: "medium",
        avatar: userObj.name ? userObj.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "U",
        token: data.data.token
      };
      
      localStorage.setItem('token', u.token);

      if (mode === "login") {
        addToast({ type: "success", title: `Welcome back, ${u.name.split(" ")[0]}!`, msg: "Session started securely" });
      } else {
        addToast({ type: "success", title: "Account created!", msg: "Welcome to GigShield" });
      }
      onLogin(u);
    } catch (error) {
      console.error(error);
      setErr("Failed to connect to the server");
    }

    setLoading(false);
  };

  const Field = ({ label, type = "text", key2, placeholder, opts }) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 12, color: C.textSecondary, marginBottom: 6, fontWeight: 500 }}>{label}</label>
      {opts ? (
        <select value={form[key2]} onChange={e => setForm(p => ({ ...p, [key2]: e.target.value }))}
          style={{ width: "100%", padding: "12px 16px", background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, color: C.textPrimary, fontSize: 14 }}>
          {opts.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} value={form[key2]} onChange={e => setForm(p => ({ ...p, [key2]: e.target.value }))}
          placeholder={placeholder}
          style={{ width: "100%", padding: "12px 16px", background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, color: C.textPrimary, fontSize: 14, transition: "border-color 0.2s" }}
          onFocus={e => e.target.style.borderColor = C.cyan}
          onBlur={e => e.target.style.borderColor = C.border}
        />
      )}
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, position: "relative", zIndex: 1 }}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} style={{ width: "100%", maxWidth: 420 }}>
        {/* Theme Toggle */}
        <div style={{ position: "absolute", top: 24, right: 24 }}>
          <ThemeToggle theme={theme} setTheme={setTheme} C={C} />
        </div>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <motion.div animate={{ animation: "float 3s ease-in-out infinite" }}
            style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 64, height: 64, borderRadius: 18, background: "linear-gradient(135deg, rgba(0,201,255,0.2), rgba(255,107,53,0.1))", border: `1px solid rgba(0,201,255,0.3)`, marginBottom: 16 }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M16 2L4 8v8c0 7.4 5.2 14.3 12 16 6.8-1.7 12-8.6 12-16V8L16 2z" fill="none" stroke={C.cyan} strokeWidth="1.5" />
              <path d="M16 2L4 8v8c0 7.4 5.2 14.3 12 16" fill="none" stroke={C.orange} strokeWidth="1.5" />
              <circle cx="16" cy="14" r="3" fill={C.cyan} />
              <path d="M12 19l2 2 4-4" stroke={C.cyan} strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </motion.div>
          <h1 style={{ fontFamily: "Outfit", fontSize: 28, fontWeight: 800, color: C.textPrimary, letterSpacing: "-0.03em" }}>
            Gig<span style={{ color: C.cyan }}>Shield</span>
          </h1>
          <p style={{ fontSize: 13, color: C.textMuted, marginTop: 4 }}>AI-Powered Parametric Income Insurance</p>
        </div>

        {/* Card */}
        <div style={{ ...glass(theme)({ padding: "32px" }), }} className="gradient-border">
          <div style={{ display: "flex", background: C.cardHover, borderRadius: 10, padding: 4, marginBottom: 28 }}>
            {["login", "register"].map(m => (
              <button key={m} onClick={() => setMode(m)} style={{
                flex: 1, padding: "8px", borderRadius: 8, border: "none", fontSize: 13, fontWeight: 600, transition: "all 0.2s",
                background: mode === m ? C.cyan : "transparent", color: mode === m ? C.bg : C.textSecondary,
              }}>{m === "login" ? "Sign In" : "Create Account"}</button>
            ))}
          </div>

          {mode === "register" && <Field label="Full Name" key2="name" placeholder="Rahul Sharma" />}
          <Field label="Email Address" type="email" key2="email" placeholder="you@example.com" />
          <Field label="Password" type="password" key2="password" placeholder="••••••••" />
          {mode === "register" && <Field label="Delivery Zone" key2="zone" opts={ZONES.map(z => z.name)} />}

          {err && <div style={{ background: `${C.red}15`, border: `1px solid ${C.red}30`, borderRadius: 8, padding: "10px 14px", fontSize: 13, color: C.red, marginBottom: 16 }}>{err}</div>}

          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handle} disabled={loading}
            style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", fontSize: 15, fontWeight: 700, fontFamily: "Outfit", letterSpacing: "0.02em", cursor: "pointer", background: loading ? `${C.cyan}30` : `linear-gradient(135deg, ${C.cyan}, #0099cc)`, color: C.bg, transition: "all 0.3s" }}>
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <span style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid", borderColor: C.bg, borderTopColor: "transparent", display: "inline-block", animation: "spin-slow 0.7s linear infinite" }} />
                Authenticating...
              </span>
            ) : mode === "login" ? "Sign In →" : "Create Account →"}
          </motion.button>

          <div style={{ marginTop: 20, padding: "14px", background: `${C.cyan}10`, borderRadius: 10, border: `1px solid ${C.cyan}20` }}>
            <p style={{ fontSize: 11, color: C.textMuted, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>Demo Credentials</p>
            {[{ label: "Worker", email: "rahul@demo.com", pass: "demo123" }, { label: "Admin", email: "admin@gigshield.ai", pass: "admin123" }].map(d => (
              <button key={d.label} onClick={() => setForm({ email: d.email, password: d.pass, name: "", zone: "Hyderabad Central" })}
                style={{ display: "block", width: "100%", textAlign: "left", padding: "6px 8px", background: "none", border: "none", color: C.cyan, fontSize: 12, cursor: "pointer", borderRadius: 6, marginBottom: 2 }}>
                {d.label}: {d.email} / {d.pass}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   RISK SCORE GAUGE
───────────────────────────────────────────── */
const RiskGauge = ({ score, theme = THEMES.dark }) => {
  const C = theme;
  const color = score < 30 ? C.green : score < 60 ? C.yellow : score < 80 ? C.orange : C.red;
  const label = score < 30 ? "Low Risk" : score < 60 ? "Medium Risk" : score < 80 ? "High Risk" : "Critical";
  const angle = (score / 100) * 180 - 90;

  return (
    <div style={{ textAlign: "center" }}>
      <svg viewBox="0 0 200 120" width="200" height="120">
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={C.green} />
            <stop offset="40%" stopColor={C.yellow} />
            <stop offset="70%" stopColor={C.orange} />
            <stop offset="100%" stopColor={C.red} />
          </linearGradient>
        </defs>
        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke={C.border} strokeWidth="12" strokeLinecap="round" />
        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="url(#gaugeGrad)" strokeWidth="12" strokeLinecap="round" strokeDasharray={`${score * 2.51} 251`} />
        <g transform={`translate(100, 100) rotate(${angle})`}>
          <line x1="0" y1="0" x2="0" y2="-60" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="0" cy="0" r="5" fill={color} />
        </g>
        <text x="100" y="90" textAnchor="middle" fill={color} fontSize="24" fontWeight="800" fontFamily="Outfit">{score}</text>
      </svg>
      <div style={{ fontSize: 13, fontWeight: 700, color, marginTop: -8 }}>{label}</div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   DISRUPTION MONITOR
───────────────────────────────────────────── */
const DisruptionMonitor = ({ onClaim, addToast, userZone, theme = THEMES.dark }) => {
  const C = theme;
  const [env, setEnv] = useState({ rainfall: 22, aqi: 145, temp: 36, wind: 18, humidity: 62 });
  const [simulating, setSimulating] = useState(false);
  const [triggered, setTriggered] = useState(null);

  const thresholds = { rainfall: 50, aqi: 300, temp: 42, wind: 40, humidity: 85 };

  const runSimulation = async (type) => {
    setSimulating(true);
    setTriggered(null);
    addToast({ type: "info", title: "Monitoring active", msg: "Scanning real-time disruption signals..." });

    await new Promise(r => setTimeout(r, 1200));

    const peaks = {
      rain: { rainfall: 67, aqi: 180, temp: 37, wind: 25, humidity: 82 },
      aqi: { rainfall: 28, aqi: 356, temp: 38, wind: 12, humidity: 45 },
      temp: { rainfall: 15, aqi: 220, temp: 44, wind: 8, humidity: 30 },
      flood: { rainfall: 89, aqi: 280, temp: 36, wind: 52, humidity: 92 },
      health: { rainfall: 10, aqi: 320, temp: 39, wind: 15, humidity: 95 },
    };
    const peak = peaks[type];
    setEnv(peak);

    await new Promise(r => setTimeout(r, 600));

    const triggerMap = {
      rain: { type: "rain", label: `Rainfall ${peak.rainfall}mm (threshold: 50mm)`, amount: 280 },
      aqi: { type: "aqi", label: `AQI ${peak.aqi} (threshold: 300)`, amount: 210 },
      temp: { type: "temp", label: `Temperature ${peak.temp}°C (threshold: 42°C)`, amount: 175 },
      flood: { type: "flood", label: `Flood Alert + Rainfall ${peak.rainfall}mm`, amount: 350 },
      health: { type: "health", label: `Extreme Humidity ${peak.humidity}% (Health Risk)`, amount: 120 },
    };

    const trig = triggerMap[type];
    setTriggered(trig);
    addToast({ type: "error", title: "⚡ Parametric Trigger Activated!", msg: trig.label });

    await new Promise(r => setTimeout(r, 800));
    onClaim(trig);
    setSimulating(false);
  };

  const Meter = ({ label, value, max, unit, threshold, icon }) => {
    const pct = Math.min((value / max) * 100, 100);
    const breach = value > threshold;
    const color = breach ? C.red : value > threshold * 0.7 ? C.orange : C.green;
    return (
      <div style={{ ...glass(theme)({ padding: "16px 18px", borderColor: breach ? `${C.red}30` : C.border }), transition: "border-color 0.4s" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontSize: 13, color: C.textSecondary }}>{icon} {label}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {breach && <Badge color={C.red} theme={theme}>BREACH</Badge>}
            <span style={{ fontSize: 18, fontWeight: 700, fontFamily: "Outfit", color }}>{value}{unit}</span>
          </div>
        </div>
        <ProgressBar value={value} max={max} color={color} height={6} theme={theme} />
        <div style={{ fontSize: 11, color: C.textMuted, marginTop: 6 }}>Threshold: {threshold}{unit}</div>
      </div>
    );
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h3 style={{ fontFamily: "Outfit", fontSize: 18, fontWeight: 700, color: C.textPrimary }}>Live Disruption Monitor</h3>
          <p style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{userZone} • Updated just now</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Dot color={C.green} pulse />
          <span style={{ fontSize: 12, color: C.green, fontWeight: 600 }}>LIVE</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
        <Meter label="Rainfall" value={env.rainfall} max={120} unit="mm" threshold={50} icon="🌧" />
        <Meter label="AQI" value={env.aqi} max={500} unit="" threshold={300} icon="💨" />
        <Meter label="Temperature" value={env.temp} max={55} unit="°C" threshold={42} icon="🌡" />
        <Meter label="Wind Speed" value={env.wind} max={100} unit="km/h" threshold={40} icon="🌬" />
        <Meter label="Humidity" value={env.humidity} max={100} unit="%" threshold={85} icon="💧" />
      </div>

      <div style={{ ...glass(theme)({ padding: "20px", borderColor: `${C.orange}20` }) }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: C.orange, marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          ⚡ Trigger Simulation Console
        </p>
        <p style={{ fontSize: 12, color: C.textMuted, marginBottom: 14 }}>Simulate real disruption events to test auto-claim triggering</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[
            { key: "rain", label: "Heavy Rainfall", icon: "🌧", color: C.cyan },
            { key: "aqi", label: "AQI Spike", icon: "🏭", color: C.purple },
            { key: "temp", label: "Heat Wave", icon: "🌡", color: C.orange },
            { key: "flood", label: "Flood Alert", icon: "🌊", color: C.red },
            { key: "health", label: "Humidity Alert", icon: "💧", color: C.green },
          ].map(s => (
            <motion.button key={s.key} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => !simulating && runSimulation(s.key)} disabled={simulating}
              style={{ padding: "12px", borderRadius: 10, border: `1px solid ${s.color}40`, background: `${s.color}10`, color: s.color, fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, opacity: simulating ? 0.5 : 1, transition: "all 0.2s" }}>
              {s.icon} {s.label}
            </motion.button>
          ))}
        </div>
        {simulating && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 14, padding: "12px", background: `${C.cyan}10`, borderRadius: 10, border: `1px solid ${C.cyan}20`, textAlign: "center" }}>
            <span style={{ fontSize: 12, color: C.cyan }}>
              <span style={{ display: "inline-block", animation: "spin-slow 0.7s linear infinite", marginRight: 8 }}>⚙</span>
              Analyzing sensor data & cross-validating signals...
            </span>
          </motion.div>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   PAYOUT ANIMATION SCREEN
───────────────────────────────────────────── */
const PayoutScreen = ({ claim, onDone, theme = THEMES.dark }) => {
  const C = theme;
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 600),
      setTimeout(() => setStage(2), 1400),
      setTimeout(() => setStage(3), 2200),
      setTimeout(() => setStage(4), 3200),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const steps = [
    { label: "AI Trigger Validated", done: stage >= 1, color: C.cyan },
    { label: "Fraud Check: Low Risk", done: stage >= 2, color: C.green },
    { label: "Financial Gateway: Payout Sent", done: stage >= 3, color: C.purple },
    { label: "SMS/WhatsApp Notified", done: stage >= 4, color: C.orange },
  ];

  const bgColor = theme === THEMES.dark ? "rgba(7,7,26,0.95)" : "rgba(250,250,250,0.95)";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      style={{ position: "fixed", inset: 0, background: bgColor, backdropFilter: "blur(30px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      <Background theme={theme} />
      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 440, padding: 24 }}>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }}
          style={{ ...glass(theme)({ padding: "40px 36px", textAlign: "center", borderColor: `${C.cyan}20` }) }}>

          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ delay: 3.5, duration: 0.5 }}
              style={{ fontSize: 48, lineHeight: 1, marginBottom: 12 }}>
              {stage < 4 ? "⚙️" : "✅"}
            </motion.div>
            <h2 style={{ fontFamily: "Outfit", fontSize: 22, fontWeight: 800, color: C.textPrimary, marginBottom: 6 }}>
              {stage < 4 ? "Processing Claim..." : "Payout Successful!"}
            </h2>
            <p style={{ fontSize: 13, color: C.textSecondary }}>{claim.label}</p>
          </div>

          {/* Steps */}
          <div style={{ marginBottom: 28, textAlign: "left" }}>
            {steps.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: stage >= i ? 1 : 0.2, x: 0 }} transition={{ delay: i * 0.1 }}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < steps.length - 1 ? `1px solid ${C.border}` : "none" }}>
                <motion.div animate={{ scale: s.done ? [1, 1.4, 1] : 1 }} transition={{ duration: 0.3 }}
                  style={{ width: 24, height: 24, borderRadius: "50%", background: s.done ? s.color : C.cardHover, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0, color: s.done ? C.bg : C.textMuted, fontWeight: 600, transition: "background 0.3s" }}>
                  {s.done ? "✓" : i + 1}
                </motion.div>
                <span style={{ fontSize: 13, fontWeight: s.done ? 600 : 400, color: s.done ? s.color : C.textMuted, transition: "color 0.3s" }}>{s.label}</span>
                {s.done && <span style={{ marginLeft: "auto", fontSize: 11, color: C.textMuted }}>✓</span>}
              </motion.div>
            ))}
          </div>

          {/* Amount */}
          <AnimatePresence>
            {stage >= 4 && (
              <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200 }}
                style={{ background: `linear-gradient(135deg, ${C.green}15, ${C.cyan}15)`, border: `1px solid ${C.green}30`, borderRadius: 14, padding: "24px", marginBottom: 24 }}>
                <p style={{ fontSize: 12, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Payout Credited</p>
                <div style={{ fontFamily: "Outfit", fontSize: 40, fontWeight: 800, color: C.green, lineHeight: 1 }}>₹{claim.amount}</div>
                <p style={{ fontSize: 12, color: C.textSecondary, marginTop: 6 }}>Instant transfer • UPI/Wallet</p>
              </motion.div>
            )}
          </AnimatePresence>

          {stage >= 4 && (
            <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={onDone}
              style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", fontSize: 15, fontWeight: 700, fontFamily: "Outfit", background: `linear-gradient(135deg, ${C.green}, ${C.green}cc)`, color: C.bg, cursor: "pointer" }}>
              Back to Dashboard
            </motion.button>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────
   FRAUD SCORE CARD
───────────────────────────────────────────── */
const FraudScoreCard = ({ score, theme = THEMES.dark }) => {
  const C = theme;
  const color = score < 20 ? C.green : score < 50 ? C.yellow : score < 75 ? C.orange : C.red;
  const label = score < 20 ? "Genuine" : score < 50 ? "Low Suspicion" : score < 75 ? "Review" : "High Risk";
  const signals = [
    { name: "GPS Movement Pattern", ok: score < 50, detail: score < 50 ? "Continuous movement detected" : "Inconsistent GPS signals" },
    { name: "Network Signal Health", ok: score < 60, detail: score < 60 ? "Normal signal degradation" : "Strong signal in weather alert zone" },
    { name: "Order Activity Logs", ok: score < 40, detail: score < 40 ? "Active delivery logs found" : "No delivery logs during claim" },
    { name: "Device Fingerprint", ok: score < 70, detail: score < 70 ? "Device verified" : "Mock-location app detected" },
    { name: "Zone Correlation", ok: true, detail: "Multiple workers affected in same zone" },
  ];

  return (
    <div style={{ ...glass(theme)({ padding: "20px 22px", borderColor: `${color}25` }) }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <p style={{ fontSize: 12, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Fraud Risk Score</p>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontFamily: "Outfit", fontSize: 36, fontWeight: 800, color }}>{score}</span>
            <span style={{ fontSize: 13, color: C.textMuted }}>/100</span>
          </div>
        </div>
        <Badge color={color} theme={theme}>{label}</Badge>
      </div>
      <ProgressBar value={score} color={color} theme={theme} />
      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
        {signals.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <span style={{ color: s.ok ? C.green : C.red, flexShrink: 0, fontSize: 13 }}>{s.ok ? "✓" : "✗"}</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.textPrimary }}>{s.name}</div>
              <div style={{ fontSize: 11, color: C.textMuted }}>{s.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   POLICY CARD
───────────────────────────────────────────── */
const PolicySection = ({ user, onCreatePolicy, policy, theme = THEMES.dark }) => {
  const C = theme;
  const tiers = [
    { level: "Low Risk", premium: 20, zones: "Stable Weather / Low Traffic", color: C.green, features: ["Basic rainfall cover", "Heat wave protection", "₹150-200 per claim"] },
    { level: "Medium Risk", premium: 35, zones: "Moderate Rain / Congestion", color: C.cyan, features: ["All Low Risk +", "AQI spike coverage", "₹200-280 per claim"], popular: true },
    { level: "High Risk", premium: 50, zones: "Flood / Severe Pollution Zone", color: C.orange, features: ["All Medium Risk +", "Flood alert cover", "Curfew protection", "₹280-420 per claim"] },
  ];

  if (policy) {
    const tier = tiers.find(t => t.premium === policy.premium) || tiers[1];
    const daysLeft = Math.floor((new Date(policy.endDate) - new Date()) / 86400000);
    return (
      <div>
        <div style={{ ...glass(theme)({ padding: "24px", borderColor: `${tier.color}30`, marginBottom: 20 }) }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div>
              <Badge color={tier.color} theme={theme}>Active Policy</Badge>
              <h3 style={{ fontFamily: "Outfit", fontSize: 20, fontWeight: 700, color: C.textPrimary, marginTop: 8 }}>{tier.level} Coverage</h3>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "Outfit", fontSize: 28, fontWeight: 800, color: tier.color }}>₹{tier.premium}</div>
              <div style={{ fontSize: 12, color: C.textMuted }}>/ week</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
            {[{ label: "Zone", val: user.zone || "Kukatpally" }, { label: "Status", val: "Active" }, { label: "Days Left", val: daysLeft }].map(i => (
              <div key={i.label} style={{ background: C.cardHover, borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 4 }}>{i.label}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: tier.color }}>{i.val}</div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
            <p style={{ fontSize: 12, color: C.textMuted, marginBottom: 10 }}>Coverage includes:</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {tier.features.map(f => <Badge key={f} color={tier.color} theme={theme}>{f}</Badge>)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 style={{ fontFamily: "Outfit", fontSize: 18, fontWeight: 700, color: C.textPrimary, marginBottom: 6 }}>Choose Your Coverage</h3>
      <p style={{ fontSize: 13, color: C.textMuted, marginBottom: 20 }}>Weekly micro-insurance starting at ₹18 (AI Safe-Zone Discount available)</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {tiers.map(tier => {
          const zoneInfo = ZONES.find(z => z.name === user.zone);
          const hasDiscount = zoneInfo?.isSafe;
          const finalPremium = hasDiscount ? tier.premium - 2 : tier.premium;

          return (
            <motion.div key={tier.level} whileHover={{ y: -4, borderColor: `${tier.color}50` }}
              style={{ ...glass(theme)({ padding: "20px 18px", cursor: "pointer", borderColor: tier.popular ? `${tier.color}40` : C.border }), position: "relative", transition: "border-color 0.3s" }}
              onClick={() => onCreatePolicy({ ...tier, premium: finalPremium })}>
              {tier.popular && <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", background: tier.color, color: C.bg, fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20, whiteSpace: "nowrap" }}>MOST POPULAR</div>}
              <div style={{ fontSize: 12, color: tier.color, fontWeight: 600, marginBottom: 8 }}>{tier.level}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <div style={{ fontFamily: "Outfit", fontSize: 30, fontWeight: 800, color: C.textPrimary, marginBottom: 2 }}>₹{finalPremium}</div>
                {hasDiscount && (
                  <span style={{ fontSize: 14, color: C.textMuted, textDecoration: "line-through" }}>₹{tier.premium}</span>
                )}
              </div>
              <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 4 }}>per week</div>
              {hasDiscount && (
                <div style={{ marginBottom: 14 }}>
                  <Badge color={C.green} theme={theme}>✨ AI Safe-Zone Discount Applied</Badge>
                </div>
              )}
              <div style={{ height: 1, background: C.border, marginBottom: 14 }} />
              <div style={{ fontSize: 11, color: C.textSecondary, marginBottom: 14 }}>{tier.zones}</div>
              {tier.features.map(f => (
                <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 6 }}>
                  <span style={{ color: tier.color, fontSize: 12, flexShrink: 0 }}>✓</span>
                  <span style={{ fontSize: 11, color: C.textSecondary }}>{f}</span>
                </div>
              ))}
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                style={{ width: "100%", marginTop: 16, padding: "10px", borderRadius: 10, border: `1px solid ${tier.color}40`, background: `${tier.color}18`, color: tier.color, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                Activate
              </motion.button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   CLAIMS TABLE
───────────────────────────────────────────── */
const ClaimsTable = ({ claims, theme = THEMES.dark }) => {
  const C = theme;
  const triggerIcons = { rain: "🌧", aqi: "💨", temp: "🌡", flood: "🌊", curfew: "🚨" };
  const statusColor = { paid: C.green, reviewing: C.yellow, rejected: C.red, pending: C.orange };

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${C.border}` }}>
            {["Trigger", "Date", "Zone", "Amount", "Mechanism", "Status"].map(h => (
              <th key={h} style={{ padding: "10px 14px", fontSize: 11, fontWeight: 600, color: C.textMuted, textAlign: "left", textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {claims.map((c, i) => (
            <motion.tr key={c.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              style={{ borderBottom: `1px solid ${C.border}`, transition: "background 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.background = C.cardHover}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <td style={{ padding: "12px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span>{triggerIcons[c.triggerType] || "⚡"}</span>
                  <span style={{ fontSize: 12, color: C.textPrimary }}>{c.trigger}</span>
                </div>
              </td>
              <td style={{ padding: "12px 14px", fontSize: 12, color: C.textSecondary }}>{c.date}</td>
              <td style={{ padding: "12px 14px", fontSize: 12, color: C.textSecondary }}>{c.zone}</td>
              <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 700, color: C.textPrimary, fontFamily: "Outfit" }}>₹{c.amount}</td>
              <td style={{ padding: "12px 14px" }}>
                <Badge color={c.payoutTime === "1.1s" || c.status === "paid" || c.id.startsWith("c_") ? C.green : C.cyan} theme={theme}>
                  {c.id.startsWith("c_") ? "🤖 ZERO-TOUCH" : "VERIFIED"}
                </Badge>
              </td>
              <td style={{ padding: "12px 14px" }}>
                <Badge color={statusColor[c.status] || C.textMuted} theme={theme}>{c.status}</Badge>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/* ─────────────────────────────────────────────
   WORKER DASHBOARD
───────────────────────────────────────────── */
const WorkerDashboard = ({ user, claims, policy, onClaim, addToast, onCreatePolicy, onLogout, theme = THEMES.dark, setTheme }) => {
  const C = theme;
  const [tab, setTab] = useState("overview");
  const [pendingPayout, setPendingPayout] = useState(null);
  const userClaims = claims.filter(c => c.userId === user.id || (user.id !== "u1" && user.id !== "u2"));
  const totalProtected = userClaims.filter(c => c.status === "paid").reduce((s, c) => s + c.amount, 0);
  const riskScore = user.riskLevel === "low" ? 28 : user.riskLevel === "medium" ? 54 : 82;

  const handleClaim = (trig) => {
    const newClaim = {
      id: `c_${Date.now()}`, userId: user.id, trigger: trig.label, triggerType: trig.type,
      amount: trig.amount, status: "processing", fraudScore: Math.floor(Math.random() * 20) + 3,
      date: new Date().toISOString().split("T")[0], zone: user.zone || "Hyderabad Central", payoutTime: "-"
    };
    onClaim(newClaim);
    setPendingPayout({ ...trig, amount: trig.amount });
  };

  const tabs = ["overview", "monitor", "claims", "analytics", "profile"];

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative", zIndex: 1 }}>
      {/* Navbar */}
      <nav style={{ ...glass(theme)({ borderRadius: 0, borderBottom: `1px solid ${C.border}`, borderLeft: "none", borderRight: "none", borderTop: "none", padding: "0 32px" }), display: "flex", alignItems: "center", height: 64 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginRight: "auto" }}>
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <path d="M16 2L4 8v8c0 7.4 5.2 14.3 12 16 6.8-1.7 12-8.6 12-16V8L16 2z" fill="none" stroke={C.cyan} strokeWidth="1.5" />
            <circle cx="16" cy="14" r="3" fill={C.cyan} />
            <path d="M12 19l2 2 4-4" stroke={C.cyan} strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span style={{ fontFamily: "Outfit", fontWeight: 800, fontSize: 18, color: C.textPrimary }}>Gig<span style={{ color: C.cyan }}>Shield</span></span>
        </div>
        <div style={{ display: "flex", gap: 4, marginRight: 24 }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: "6px 16px", borderRadius: 8, border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s", background: tab === t ? `${C.cyan}18` : "transparent", color: tab === t ? C.cyan : C.textSecondary, textTransform: "capitalize" }}>
              {t}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <ThemeToggle theme={theme} setTheme={setTheme} C={C} />
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg, ${C.cyan}40, ${C.purple}40)`, border: `1px solid ${C.cyan}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: C.cyan }}>{user.avatar}</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>{user.name.split(" ")[0]}</div>
            <div style={{ fontSize: 11, color: C.textMuted }}>{user.zone || "Worker"}</div>
          </div>
          <button onClick={onLogout} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", color: C.textMuted, fontSize: 12, cursor: "pointer", transition: "all 0.2s" }}>Sign out</button>
        </div>
      </nav>

      <div style={{ flex: 1, padding: "32px", maxWidth: 1200, margin: "0 auto", width: "100%" }}>
        <AnimatePresence mode="wait">
          {tab === "overview" && (
            <motion.div key="overview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
              <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontFamily: "Outfit", fontSize: 26, fontWeight: 800, color: C.textPrimary, letterSpacing: "-0.03em" }}>Good day, {user.name.split(" ")[0]} 👋</h1>
                <p style={{ fontSize: 14, color: C.textMuted, marginTop: 4 }}>Your income protection status • {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
                <StatCard label="Earnings Protected" value={`₹${totalProtected.toLocaleString()}`} icon="🛡" color={C.green} change={12} theme={theme} />
                <StatCard label="Total Claims" value={userClaims.length} icon="📋" color={C.cyan} change={8} theme={theme} />
                <StatCard label="Active Policy" value={policy ? `₹${policy.premium}/wk` : "None"} icon="📄" color={C.purple} theme={theme} />
                <StatCard label="Zone Risk" value={user.riskLevel === "high" ? "High" : "Medium"} icon="📍" color={user.riskLevel === "high" ? C.orange : C.yellow} theme={theme} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
                {/* Risk Score */}
                <div style={{ ...glass(theme)({ padding: "24px", borderColor: `${C.purple}20` }) }}>
                  <p style={{ fontSize: 12, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>Zone Risk Profile</p>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <RiskGauge score={riskScore} theme={theme} />
                  </div>
                  <div style={{ marginTop: 16 }}>
                    {[{ label: "Weather Risk", val: 72 }, { label: "Traffic Risk", val: 48 }, { label: "Pollution Risk", val: 61 }].map(r => (
                      <div key={r.label} style={{ marginBottom: 10 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 12, color: C.textSecondary }}>{r.label}</span>
                          <span style={{ fontSize: 12, color: C.textPrimary, fontWeight: 600 }}>{r.val}%</span>
                        </div>
                        <ProgressBar value={r.val} max={100} color={r.val > 70 ? C.red : r.val > 50 ? C.orange : C.yellow} height={6} theme={theme} />
                      </div>
                    ))}
                  </div>
                </div>
                {/* Policy */}
                <div style={{ ...glass(theme)({ padding: "24px" }), gridColumn: "span 2" }}>
                  <PolicySection user={user} policy={policy} onCreatePolicy={onCreatePolicy} theme={theme} />
                </div>
              </div>
            </motion.div>
          )}

          {tab === "monitor" && (
            <motion.div key="monitor" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontFamily: "Outfit", fontSize: 22, fontWeight: 700, color: C.textPrimary }}>Disruption Monitor</h2>
                <p style={{ fontSize: 13, color: C.textMuted, marginTop: 4 }}>Real-time parametric trigger detection for your zone</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 20 }}>
                <div style={{ ...glass(theme)({ padding: "24px" }) }}>
                  <DisruptionMonitor onClaim={handleClaim} addToast={addToast} userZone={user.zone || "Hyderabad Central"} theme={theme} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <FraudScoreCard score={userClaims[userClaims.length - 1]?.fraudScore || 8} theme={theme} />
                  <div style={{ ...glass(theme)({ padding: "20px" }) }}>
                    <p style={{ fontSize: 12, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Active Triggers Configured</p>
                    {[
                      { icon: "🌧", label: "Rainfall", threshold: "> 50mm", active: true },
                      { icon: "💨", label: "AQI", threshold: "> 300", active: true },
                      { icon: "🌡", label: "Temperature", threshold: "> 42°C", active: true },
                      { icon: "🚨", label: "Curfew Alert", threshold: "Any", active: false },
                    ].map(t => (
                      <div key={t.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
                        <span>{t.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, color: C.textPrimary }}>{t.label}</div>
                          <div style={{ fontSize: 11, color: C.textMuted }}>{t.threshold}</div>
                        </div>
                        <div style={{ width: 36, height: 20, borderRadius: 10, background: t.active ? `${C.green}30` : C.cardHover, border: `1px solid ${t.active ? C.green : C.border}`, display: "flex", alignItems: "center", justifyContent: t.active ? "flex-end" : "flex-start", padding: "0 3px", cursor: "pointer" }}>
                          <div style={{ width: 14, height: 14, borderRadius: "50%", background: t.active ? C.green : C.textMuted }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {tab === "claims" && (
            <motion.div key="claims" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <div>
                  <h2 style={{ fontFamily: "Outfit", fontSize: 22, fontWeight: 700, color: C.textPrimary }}>Claim History</h2>
                  <p style={{ fontSize: 13, color: C.textMuted, marginTop: 4 }}>{userClaims.length} total claims • ₹{totalProtected.toLocaleString()} recovered</p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {["All", "Paid", "Reviewing"].map(f => (
                    <button key={f} style={{ padding: "7px 16px", borderRadius: 8, border: `1px solid ${C.border}`, background: f === "All" ? `${C.cyan}15` : "transparent", color: f === "All" ? C.cyan : C.textSecondary, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{f}</button>
                  ))}
                </div>
              </div>
              <div style={{ ...glass(theme)({ padding: "0 8px" }) }}>
                <ClaimsTable claims={userClaims.length ? userClaims : INITIAL_CLAIMS.filter(c => c.userId === "u1")} theme={theme} />
              </div>
            </motion.div>
          )}

          {tab === "analytics" && (
            <motion.div key="analytics" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
              <h2 style={{ fontFamily: "Outfit", fontSize: 22, fontWeight: 700, color: C.textPrimary, marginBottom: 24 }}>Your Analytics</h2>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
                <div style={{ ...glass(theme)({ padding: "24px" }) }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: C.textSecondary, marginBottom: 20 }}>Earnings Protected vs Claims (Weekly)</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={WEEKLY_DATA}>
                      <defs>
                        <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={C.cyan} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={C.cyan} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={`${C.border}`} />
                      <XAxis dataKey="week" tick={{ fill: C.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: C.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 10, color: C.textPrimary, fontSize: 12 }} />
                      <Area type="monotone" dataKey="payouts" stroke={C.cyan} strokeWidth={2} fill="url(#pg)" name="₹ Protected" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ ...glass(theme)({ padding: "24px" }) }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: C.textSecondary, marginBottom: 20 }}>Trigger Distribution</p>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={[
                        { name: "Rain", value: 42, color: C.cyan },
                        { name: "AQI", value: 28, color: C.purple },
                        { name: "Heat", value: 18, color: C.orange },
                        { name: "Other", value: 12, color: C.yellow },
                      ]} cx="50%" cy="50%" outerRadius={65} dataKey="value" strokeWidth={0}>
                        {[C.cyan, C.purple, C.orange, C.yellow].map((c, i) => <Cell key={i} fill={c} opacity={0.85} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 12, color: C.textPrimary }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    {[{ name: "Rain", val: "42%", c: C.cyan }, { name: "AQI", val: "28%", c: C.purple }, { name: "Heat", val: "18%", c: C.orange }, { name: "Other", val: "12%", c: C.yellow }].map(d => (
                      <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: d.c, flexShrink: 0 }} />
                        <span style={{ fontSize: 11, color: C.textSecondary }}>{d.name} {d.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {tab === "profile" && (
            <motion.div key="profile" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontFamily: "Outfit", fontSize: 22, fontWeight: 700, color: C.textPrimary }}>Worker Profile</h2>
                <p style={{ fontSize: 13, color: C.textMuted, marginTop: 4 }}>Manage your account and verification status</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 24 }}>
                <div style={{ ...glass(theme)({ padding: "32px", textAlign: "center" }) }}>
                  <div style={{ width: 100, height: 100, borderRadius: "50%", background: `linear-gradient(135deg, ${C.cyan}40, ${C.purple}40)`, border: `2px solid ${C.cyan}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 800, color: C.cyan, margin: "0 auto 20px" }}>{user.avatar}</div>
                  <h3 style={{ fontFamily: "Outfit", fontSize: 20, fontWeight: 700, color: C.textPrimary }}>{user.name}</h3>
                  <p style={{ fontSize: 13, color: C.textMuted, marginBottom: 20 }}>{user.email}</p>
                  <Badge color={C.green} theme={theme}>✓ Fully Verified</Badge>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ ...glass(theme)({ padding: "24px" }) }}>
                    <h4 style={{ fontSize: 14, fontWeight: 700, color: C.textPrimary, marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.05em" }}>KYC & Security</h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {[
                        { label: "Aadhar Verification", status: "Verified", color: C.green },
                        { label: "Driving License", status: "Verified", color: C.green },
                        { label: "Bank Account (UPI)", status: "Linked", color: C.cyan },
                        { label: "Face Match ID", status: "Done", color: C.green }
                      ].map(item => (
                        <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: C.cardHover, borderRadius: 10 }}>
                          <span style={{ fontSize: 13, color: C.textSecondary }}>{item.label}</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: item.color }}>{item.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ ...glass(theme)({ padding: "24px", borderColor: `${C.orange}20` }) }}>
                    <h4 style={{ fontSize: 14, fontWeight: 700, color: C.orange, marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.05em" }}>Platform Shield Status</h4>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ ...glass(theme)({ width: 64, height: 64, borderRadius: "50%", background: `${C.green}15`, border: `1px solid ${C.green}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }) }}>🏆</div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: C.textPrimary }}>Top-Tier Fraud Resilience</div>
                        <div style={{ fontSize: 12, color: C.textMuted }}>You are in the top 5% of honest and reliable workers.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {pendingPayout && (
        <PayoutScreen claim={pendingPayout} onDone={() => { setPendingPayout(null); setTab("claims"); }} theme={theme} />
      )}
    </div>
  );
};

const AdminDashboard = ({ claims, onLogout, addToast, theme = THEMES.dark, setTheme }) => {
  const C = theme;
  const [tab, setTab] = useState("overview");
  const fraudClaims = claims.filter(c => c.fraudScore >= 50);
  const totalPaid = claims.filter(c => c.status === "paid").reduce((s, c) => s + c.amount, 0);

  const tabs = ["overview", "zones", "fraud", "workers"];

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative", zIndex: 1 }}>
      {/* Navbar */}
      <nav style={{ ...glass(theme)({ borderRadius: 0, borderBottom: `1px solid ${C.border}`, borderLeft: "none", borderRight: "none", borderTop: "none", padding: "0 32px" }), display: "flex", alignItems: "center", height: 64 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginRight: "auto" }}>
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <path d="M16 2L4 8v8c0 7.4 5.2 14.3 12 16 6.8-1.7 12-8.6 12-16V8L16 2z" fill="none" stroke={C.orange} strokeWidth="1.5" />
            <circle cx="16" cy="14" r="3" fill={C.orange} />
            <path d="M12 19l2 2 4-4" stroke={C.orange} strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span style={{ fontFamily: "Outfit", fontWeight: 800, fontSize: 18, color: C.textPrimary }}>Gig<span style={{ color: C.orange }}>Shield</span> <span style={{ fontSize: 11, color: C.orange, background: `${C.orange}20`, padding: "2px 8px", borderRadius: 4, fontWeight: 600 }}>ADMIN</span></span>
        </div>
        <div style={{ display: "flex", gap: 4, marginRight: 24 }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: "6px 16px", borderRadius: 8, border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s", background: tab === t ? `${C.orange}18` : "transparent", color: tab === t ? C.orange : C.textSecondary, textTransform: "capitalize" }}>
              {t}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <ThemeToggle theme={theme} setTheme={setTheme} C={C} />
          <button onClick={onLogout} style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", color: C.textMuted, fontSize: 12, cursor: "pointer", transition: "all 0.2s" }}>Sign out</button>
        </div>
      </nav>

      <div style={{ flex: 1, padding: "32px", maxWidth: 1200, margin: "0 auto", width: "100%" }}>
        <AnimatePresence mode="wait">
          {tab === "overview" && (
            <motion.div key="ov" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
              <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontFamily: "Outfit", fontSize: 26, fontWeight: 800, color: C.textPrimary }}>Platform Overview</h1>
                <p style={{ fontSize: 13, color: C.textMuted, marginTop: 4 }}>Real-time insurance operations dashboard</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
                <StatCard label="Total Claims" value={claims.length} icon="📋" color={C.cyan} change={15} />
                <StatCard label="Total Payouts" value={`₹${totalPaid.toLocaleString()}`} icon="💸" color={C.green} change={22} />
                <StatCard label="Fraud Flagged" value={fraudClaims.length} icon="🚨" color={C.red} change={-8} />
                <StatCard label="Active Zones" value={ZONES.length} icon="🗺" color={C.purple} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 20 }}>
                <div style={{ ...glass(theme)({ padding: "24px" }) }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: C.textSecondary, marginBottom: 20 }}>Claims & Payouts Trend (Weekly)</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={WEEKLY_DATA} barGap={4}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="week" tick={{ fill: C.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: C.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 12, color: C.textPrimary }} />
                      <Bar dataKey="claims" fill={`${C.cyan}80`} radius={[4, 4, 0, 0]} name="Claims" />
                      <Bar dataKey="fraud" fill={`${C.red}80`} radius={[4, 4, 0, 0]} name="Fraud" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ ...glass(theme)({ padding: "24px" }) }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: C.textSecondary, marginBottom: 20 }}>Fraud Detection Rate</p>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={WEEKLY_DATA}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="week" tick={{ fill: C.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: C.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 12, color: C.textPrimary }} />
                      <Line type="monotone" dataKey="fraud" stroke={C.red} strokeWidth={2} dot={{ fill: C.red, r: 3 }} name="Fraud" />
                    </LineChart>
                  </ResponsiveContainer>
                  <div style={{ background: "rgba(255,59,71,0.08)", border: `1px solid rgba(255,59,71,0.2)`, borderRadius: 10, padding: "12px 14px", marginTop: 16 }}>
                    <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 4 }}>Avg Fraud Rate</div>
                    <div style={{ fontFamily: "Outfit", fontSize: 22, fontWeight: 800, color: C.red }}>7.2%</div>
                    <div style={{ fontSize: 11, color: C.red }}>↓ 2.1% from last month</div>
                  </div>
                </div>
              </div>
              <div style={{ ...glass(theme)({ padding: "8px" }) }}>
                <div style={{ padding: "16px 16px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: C.textSecondary }}>Recent Claims</p>
                  <Badge color={C.cyan}>{claims.length} total</Badge>
                </div>
                <ClaimsTable claims={claims.slice(0, 6)} />
              </div>
            </motion.div>
          )}

          {tab === "zones" && (
            <motion.div key="zones" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
              <h2 style={{ fontFamily: "Outfit", fontSize: 22, fontWeight: 700, color: C.textPrimary, marginBottom: 24 }}>Zone Risk Heatmap</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                {ZONES.map((z, i) => {
                  const riskColor = z.risk >= 75 ? C.red : z.risk >= 55 ? C.orange : z.risk >= 40 ? C.yellow : C.green;
                  return (
                    <motion.div key={z.name} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.07 }}
                      whileHover={{ y: -4 }}
                      style={{ ...glass(theme)({ padding: "22px", borderColor: `${riskColor}25` }) }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                        <div>
                          <h3 style={{ fontFamily: "Outfit", fontSize: 16, fontWeight: 700, color: C.textPrimary }}>{z.name}</h3>
                          <p style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{z.workers} active workers</p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontFamily: "Outfit", fontSize: 26, fontWeight: 800, color: riskColor }}>{z.risk}</div>
                          <div style={{ fontSize: 10, color: C.textMuted }}>risk score</div>
                        </div>
                      </div>
                      <ProgressBar value={z.risk} color={riskColor} height={8} />
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 16 }}>
                        {[{ label: "Claims", val: z.claims }, { label: "Premium", val: z.premium }].map(s => (
                          <div key={s.label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "10px 12px" }}>
                            <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 2 }}>{s.label}</div>
                            <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "Outfit", color: riskColor }}>{s.val}</div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {tab === "fraud" && (
            <motion.div key="fraud" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
              <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h2 style={{ fontFamily: "Outfit", fontSize: 22, fontWeight: 700, color: C.textPrimary }}>Fraud Detection Center</h2>
                  <p style={{ fontSize: 13, color: C.textMuted, marginTop: 4 }}>AI-powered multi-signal fraud analysis</p>
                </div>
                <div style={{ ...glass(theme)({ padding: "12px 20px", borderColor: `${C.red}30` }) }}>
                  <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 2 }}>Active Alerts</div>
                  <div style={{ fontFamily: "Outfit", fontSize: 24, fontWeight: 800, color: C.red }}>{fraudClaims.length}</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                {[
                  { title: "GPS Spoofing Detection", count: 3, desc: "Teleport jump patterns identified in Secunderabad zone" },
                  { title: "Duplicate Claim Burst", count: 1, desc: "Same worker, 3 claims in 24 hours — flagged for review" },
                  { title: "No Movement Anomaly", count: 2, desc: "Claim filed with zero GPS movement in 4 hours" },
                  { title: "Strong Signal During Alert", count: 1, desc: "Full network signal during flood alert zone" },
                ].map((alert, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                    style={{ ...glass(theme)({ padding: "20px", borderColor: "rgba(255,59,71,0.2)" }) }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: C.red }}>🚨 {alert.title}</span>
                      <Badge color={C.red}>{alert.count}</Badge>
                    </div>
                    <p style={{ fontSize: 12, color: C.textSecondary, lineHeight: 1.6 }}>{alert.desc}</p>
                    <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                      <button onClick={() => addToast({ type: "success", title: "Claim cleared", msg: "Moved to verified claims" })}
                        style={{ flex: 1, padding: "8px", borderRadius: 8, border: `1px solid ${C.green}40`, background: `${C.green}10`, color: C.green, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                        Clear
                      </button>
                      <button onClick={() => addToast({ type: "error", title: "Claim rejected", msg: "Worker notified via app" })}
                        style={{ flex: 1, padding: "8px", borderRadius: 8, border: `1px solid ${C.red}40`, background: `${C.red}10`, color: C.red, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                        Reject
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div style={{ ...glass(theme)({ padding: "20px", borderColor: "rgba(255,59,71,0.15)" }) }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: C.textSecondary, marginBottom: 16 }}>High Fraud Score Claims</p>
                <ClaimsTable claims={claims.filter(c => c.fraudScore >= 20)} />
              </div>
            </motion.div>
          )}

          {tab === "workers" && (
            <motion.div key="workers" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
              <h2 style={{ fontFamily: "Outfit", fontSize: 22, fontWeight: 700, color: C.textPrimary, marginBottom: 24 }}>Worker Registry</h2>
              <div style={{ ...glass(theme)({ padding: "8px" }) }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                      {["Worker", "Zone", "Risk Level", "Policy", "Claims", "Status"].map(h => (
                        <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 600, color: C.textMuted, textAlign: "left", textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {USERS.filter(u => u.role === "worker").map((u, i) => {
                      const wClaims = claims.filter(c => c.userId === u.id);
                      const rColor = u.riskLevel === "high" ? C.orange : u.riskLevel === "medium" ? C.yellow : C.green;
                      return (
                        <tr key={u.id} style={{ borderBottom: `1px solid rgba(255,255,255,0.04)` }}
                          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                          <td style={{ padding: "14px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{ width: 34, height: 34, borderRadius: "50%", background: `linear-gradient(135deg, ${C.cyan}30, ${C.purple}30)`, border: `1px solid ${C.cyan}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: C.cyan, flexShrink: 0 }}>{u.avatar}</div>
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>{u.name}</div>
                                <div style={{ fontSize: 11, color: C.textMuted }}>{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: "14px 16px", fontSize: 12, color: C.textSecondary }}>{u.zone}</td>
                          <td style={{ padding: "14px 16px" }}><Badge color={rColor}>{u.riskLevel}</Badge></td>
                          <td style={{ padding: "14px 16px" }}><Badge color={C.cyan}>Active ₹35/wk</Badge></td>
                          <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 700, color: C.cyan }}>{wClaims.length}</td>
                          <td style={{ padding: "14px 16px" }}><div style={{ display: "flex", alignItems: "center", gap: 6 }}><Dot color={C.green} pulse /><span style={{ fontSize: 12, color: C.green }}>Active</span></div></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   TOAST HOOK
───────────────────────────────────────────── */
const useToasts = () => {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((t) => {
    const id = Date.now();
    setToasts(p => [...p, { ...t, id }]);
    setTimeout(() => setToasts(p => p.filter(x => x.id !== id)), 4000);
  }, []);
  const remove = useCallback((id) => setToasts(p => p.filter(x => x.id !== id)), []);
  return { toasts, addToast: add, removeToast: remove };
};

/* ─────────────────────────────────────────────
   ROOT APP
───────────────────────────────────────────── */
export default function App() {
  const [savedTheme, setSavedTheme] = useState(null);
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("gigshield-theme");
      return saved === "light" ? THEMES.light : THEMES.dark;
    }
    return THEMES.dark;
  });

  useEffect(() => {
    localStorage.setItem("gigshield-theme", theme === THEMES.dark ? "dark" : "light");
  }, [theme]);

  const [user, setUser] = useState(null);
  const [claims, setClaims] = useState(INITIAL_CLAIMS);
  const [policy, setPolicy] = useState(null);
  const { toasts, addToast, removeToast } = useToasts();

  const handleLogin = (u) => setUser(u);
  const handleLogout = () => { setUser(null); setPolicy(null); addToast({ type: "info", title: "Signed out", msg: "See you soon!" }); };

  const handleClaim = (newClaim) => {
    setClaims(p => [{ ...newClaim, status: "paid", payoutTime: `${(Math.random() * 3 + 1).toFixed(1)}s` }, ...p]);
    addToast({ type: "success", title: "Claim Auto-Processed!", msg: `₹${newClaim.amount} payout initiated` });
  };

  const handleCreatePolicy = (tier) => {
    const now = new Date();
    const end = new Date(now); end.setDate(end.getDate() + 7);
    setPolicy({ id: `p_${Date.now()}`, userId: user.id, premium: tier.premium, level: tier.level, status: "active", startDate: now.toISOString().split("T")[0], endDate: end.toISOString().split("T")[0] });
    addToast({ type: "success", title: "Policy Activated!", msg: `₹${tier.premium}/week • ${tier.level} Coverage` });
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <GlobalStyle theme={theme} />
      <Background theme={theme} />
      <Toast toasts={toasts} removeToast={removeToast} theme={theme} />
      <AnimatePresence mode="wait">
        {!user ? (
          <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AuthPage onLogin={handleLogin} addToast={addToast} theme={theme} setTheme={setTheme} />
          </motion.div>
        ) : user.role === "admin" ? (
          <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AdminDashboard claims={claims} onLogout={handleLogout} addToast={addToast} theme={theme} setTheme={setTheme} />
          </motion.div>
        ) : (
          <motion.div key="worker" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <WorkerDashboard user={user} claims={claims} policy={policy} onClaim={handleClaim} addToast={addToast} onCreatePolicy={handleCreatePolicy} onLogout={handleLogout} theme={theme} setTheme={setTheme} />
          </motion.div>
        )}
      </AnimatePresence>
    </ThemeContext.Provider>
  );
}
