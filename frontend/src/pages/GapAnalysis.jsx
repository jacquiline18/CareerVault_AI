import { useState } from "react";
import api from "../lib/api";
import useAuth from "../lib/useAuth";
import { useTheme } from "../lib/ThemeContext";
import Navbar from "../components/Navbar";

export default function GapAnalysis() {
  const { user, loading } = useAuth();
  const { dark } = useTheme();
  const [targetRole, setTargetRole] = useState("");
  const [result, setResult] = useState(null);
  const [generating, setGenerating] = useState(false);

  const bg   = dark ? "bg-gray-950" : "";
  const card = dark ? "bg-gray-900 border border-gray-800" : "bg-white";
  const text = dark ? "text-white"  : "text-gray-800";
  const sub  = dark ? "text-gray-400" : "text-gray-500";
  const inp  = dark
    ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-indigo-500"
    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-500";

  const analyze = async () => {
    if (!targetRole.trim()) return alert("Enter a target role");
    setGenerating(true);
    setResult(null);
    try {
      const { data } = await api.post("/api/ai/gap-analysis", { target_role: targetRole });
      setResult(data);
    } catch (err) { alert("Failed: " + err.message); }
    setGenerating(false);
  };

  if (loading || !user) return null;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${bg}`}
      style={!dark ? { background: "linear-gradient(160deg,#eef2ff 0%,#fff4f2 50%,#fff8ed 100%)" } : {}}>
      <Navbar user={user} />
      <div className="max-w-4xl mx-auto p-6 space-y-6">

        <div className="rounded-2xl p-6 text-white"
          style={{ background: "linear-gradient(135deg,#4338ca 0%,#6366f1 40%,#ff5a3c 75%,#ff9d38 100%)" }}>
          <h2 className="text-2xl font-bold mb-1">🔍 Resume Gap Analysis</h2>
          <p className="text-white/75 text-sm">Compare your profile against any job role and get a detailed gap report.</p>
        </div>

        <div className={`${card} rounded-2xl p-6 shadow-sm`}>
          <label className={`block text-xs font-semibold mb-1.5 ${sub}`}>TARGET JOB ROLE</label>
          <div className="flex gap-3">
            <input value={targetRole} onChange={e => setTargetRole(e.target.value)}
              onKeyDown={e => e.key === "Enter" && analyze()}
              placeholder="e.g. Backend Developer, Data Analyst, ML Engineer..."
              className={`flex-1 px-4 py-3 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${inp}`} />
            <button onClick={analyze} disabled={generating}
              className="text-white px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105 disabled:opacity-50 flex items-center gap-2"
              style={{ background: "linear-gradient(135deg,#ff5a3c,#ff9d38)" }}>
              {generating ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Analyze"}
            </button>
          </div>
        </div>

        {generating && (
          <div className={`${card} rounded-2xl p-8 text-center shadow-sm`}>
            <div className="w-12 h-12 border-4 border-coral-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"
              style={{ borderColor: "#ff5a3c", borderTopColor: "transparent" }} />
            <p className={`text-sm ${sub}`}>Analyzing your profile against {targetRole}...</p>
          </div>
        )}

        {result && (
          <div className="space-y-5">

            {/* Match score */}
            <div className={`${card} rounded-2xl p-6 shadow-sm`}>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className={`text-lg font-bold ${text}`}>Match Score for: {result.target_role}</h3>
                  <p className={`text-sm ${sub}`}>Based on your current profile</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold" style={{ color: result.overall_match >= 70 ? "#10b981" : result.overall_match >= 50 ? "#ff9d38" : "#ff5a3c" }}>
                    {result.overall_match}%
                  </div>
                  <div className={`w-32 h-3 rounded-full overflow-hidden mt-2 ${dark ? "bg-gray-700" : "bg-gray-200"}`}>
                    <div className="h-3 rounded-full" style={{ width: `${result.overall_match}%`, background: "linear-gradient(90deg,#6366f1,#ff5a3c)" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Strong vs Weak */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className={`${card} rounded-2xl p-5 shadow-sm border-l-4 border-l-emerald-500`}>
                <h4 className={`font-semibold mb-3 ${text}`}>✅ Strong Areas</h4>
                {result.strong_areas?.map((s, i) => (
                  <div key={i} className="flex items-start gap-2 mb-2">
                    <span className="text-emerald-500 shrink-0">✓</span>
                    <span className={`text-sm ${sub}`}>{s}</span>
                  </div>
                ))}
              </div>
              <div className={`${card} rounded-2xl p-5 shadow-sm border-l-4 border-l-red-500`}>
                <h4 className={`font-semibold mb-3 ${text}`}>⚠️ Weak Areas</h4>
                {result.weak_areas?.map((w, i) => (
                  <div key={i} className="flex items-start gap-2 mb-2">
                    <span className="text-red-500 shrink-0">!</span>
                    <span className={`text-sm ${sub}`}>{w}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Missing items */}
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { title: "Missing Skills", items: result.missing_skills, color: "border-l-orange-500", tagClass: dark ? "bg-orange-900/50 text-orange-300" : "bg-orange-100 text-orange-700" },
                { title: "Missing Projects", items: result.missing_projects, color: "border-l-purple-500", tagClass: dark ? "bg-purple-900/50 text-purple-300" : "bg-purple-100 text-purple-700" },
                { title: "Missing Certs", items: result.missing_certifications, color: "border-l-yellow-500", tagClass: dark ? "bg-yellow-900/50 text-yellow-300" : "bg-yellow-100 text-yellow-700" },
              ].map(section => (
                <div key={section.title} className={`${card} rounded-2xl p-5 shadow-sm border-l-4 ${section.color}`}>
                  <h4 className={`font-semibold mb-3 text-sm ${text}`}>{section.title}</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {section.items?.map((item, i) => (
                      <span key={i} className={`text-xs px-2 py-1 rounded-full font-medium ${section.tagClass}`}>{item}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Action Plan */}
            {result.recommended_actions?.length > 0 && (
              <div className={`${card} rounded-2xl p-5 shadow-sm border-l-4 border-l-indigo-500`}>
                <h4 className={`font-semibold mb-4 ${text}`}>🎯 Recommended Action Plan</h4>
                <div className="space-y-3">
                  {result.recommended_actions.map((a, i) => (
                    <div key={i} className={`flex items-start gap-3 p-3 rounded-xl ${dark ? "bg-gray-800" : "bg-gray-50"}`}>
                      <span className={`text-xs px-2 py-1 rounded-full font-bold shrink-0 ${a.priority === "High" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>{a.priority}</span>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${text}`}>{a.action}</p>
                        <p className={`text-xs mt-0.5 ${sub}`}>⏱ {a.timeline}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
