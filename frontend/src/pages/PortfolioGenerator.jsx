import { useState } from "react";
import api from "../lib/api";
import useAuth from "../lib/useAuth";
import { useTheme } from "../lib/ThemeContext";
import Navbar from "../components/Navbar";

const THEMES = [
  { id: "indigo", label: "Indigo",  color: "#6366f1" },
  { id: "ocean",  label: "Ocean",   color: "#0ea5e9" },
  { id: "forest", label: "Forest",  color: "#10b981" },
  { id: "rose",   label: "Rose",    color: "#f43f5e" },
];

export default function PortfolioGenerator() {
  const { user, loading } = useAuth();
  const { dark } = useTheme();
  const [settings, setSettings] = useState({ theme: "indigo", bio: "", github_url: "", linkedin_url: "", contact_email: "" });
  const [html, setHtml] = useState("");
  const [generating, setGenerating] = useState(false);
  const [preview, setPreview] = useState(false);

  const bg   = dark ? "bg-gray-950" : "";
  const card = dark ? "bg-gray-900 border border-gray-800" : "bg-white";
  const text = dark ? "text-white"  : "text-gray-800";
  const sub  = dark ? "text-gray-400" : "text-gray-500";
  const inp  = dark
    ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-indigo-500"
    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-500";

  const set = (k, v) => setSettings(s => ({ ...s, [k]: v }));

  const generate = async () => {
    setGenerating(true);
    try {
      const { data } = await api.post("/api/ai/portfolio", { settings });
      setHtml(data.html);
      setPreview(true);
    } catch (err) { alert("Failed: " + err.message); }
    setGenerating(false);
  };

  const download = () => {
    const blob = new Blob([html], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "portfolio.html";
    a.click();
  };

  if (loading || !user) return null;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${bg}`}
      style={!dark ? { background: "linear-gradient(160deg,#eef2ff 0%,#fff4f2 50%,#fff8ed 100%)" } : {}}>
      <Navbar user={user} />
      <div className="max-w-5xl mx-auto p-6 space-y-6">

        <div className="rounded-2xl p-6 text-white"
          style={{ background: "linear-gradient(135deg,#4338ca 0%,#6366f1 40%,#ff5a3c 75%,#ff9d38 100%)" }}>
          <h2 className="text-2xl font-bold mb-1">🌐 Portfolio Generator</h2>
          <p className="text-white/75 text-sm">Generate a beautiful portfolio website from your career profile. Download and host anywhere.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">

          {/* Settings */}
          <div className={`${card} rounded-2xl p-6 shadow-sm space-y-4`}>
            <h3 className={`text-lg font-semibold ${text}`}>⚙️ Customize</h3>

            {/* Theme */}
            <div>
              <label className={`block text-xs font-semibold mb-2 ${sub}`}>COLOR THEME</label>
              <div className="flex gap-2">
                {THEMES.map(t => (
                  <button key={t.id} onClick={() => set("theme", t.id)}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium border-2 transition-all ${settings.theme === t.id ? "border-current" : dark ? "border-gray-700" : "border-gray-200"}`}
                    style={{ color: t.color, borderColor: settings.theme === t.id ? t.color : undefined }}>
                    <div className="w-4 h-4 rounded-full mx-auto mb-1" style={{ background: t.color }} />
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${sub}`}>BIO</label>
              <textarea value={settings.bio} onChange={e => set("bio", e.target.value)}
                placeholder="A short bio about yourself..."
                rows={3}
                className={`w-full px-4 py-3 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none ${inp}`} />
            </div>

            {/* Links */}
            {[
              { key: "github_url",    label: "GITHUB URL",    placeholder: "https://github.com/username" },
              { key: "linkedin_url",  label: "LINKEDIN URL",  placeholder: "https://linkedin.com/in/username" },
              { key: "contact_email", label: "CONTACT EMAIL", placeholder: "you@example.com" },
            ].map(f => (
              <div key={f.key}>
                <label className={`block text-xs font-semibold mb-1.5 ${sub}`}>{f.label}</label>
                <input value={settings[f.key]} onChange={e => set(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className={`w-full px-4 py-3 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${inp}`} />
              </div>
            ))}

            <button onClick={generate} disabled={generating}
              className="w-full text-white font-semibold py-3 rounded-xl transition-all hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg,#6366f1,#ff5a3c,#ff9d38)" }}>
              {generating
                ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating...</>
                : "✨ Generate Portfolio"}
            </button>
          </div>

          {/* Preview panel */}
          <div className={`${card} rounded-2xl p-6 shadow-sm flex flex-col`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${text}`}>👁 Preview</h3>
              {html && (
                <button onClick={download}
                  className="text-white text-sm px-4 py-2 rounded-xl font-semibold flex items-center gap-1.5 hover:scale-105 transition-all"
                  style={{ background: "linear-gradient(135deg,#ff5a3c,#ff9d38)" }}>
                  ⬇️ Download HTML
                </button>
              )}
            </div>

            {!html && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-5xl mb-3">🌐</div>
                  <p className={`text-sm ${sub}`}>Your portfolio preview will appear here</p>
                </div>
              </div>
            )}

            {html && (
              <div className="flex-1 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700" style={{ minHeight: "400px" }}>
                <iframe
                  srcDoc={html}
                  title="Portfolio Preview"
                  className="w-full h-full"
                  style={{ minHeight: "400px" }}
                  sandbox="allow-same-origin"
                />
              </div>
            )}
          </div>
        </div>

        {/* What's included */}
        <div className={`${card} rounded-2xl p-6 shadow-sm`}>
          <h3 className={`text-lg font-semibold mb-4 ${text}`}>📦 What's Included</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {["Hero Section","Skills Grid","Projects Cards","Certificates","Internships","Contact Links","Dark Theme","Responsive Design"].map(f => (
              <div key={f} className={`flex items-center gap-2 p-3 rounded-xl text-sm ${dark ? "bg-gray-800" : "bg-gray-50"}`}>
                <span className="text-emerald-500">✓</span>
                <span className={sub}>{f}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
