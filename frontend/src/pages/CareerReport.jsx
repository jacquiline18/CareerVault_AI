import { useState } from "react";
import api from "../lib/api";
import useAuth from "../lib/useAuth";
import { useTheme } from "../lib/ThemeContext";
import Navbar from "../components/Navbar";

export default function CareerReport() {
  const { user, loading } = useAuth();
  const { dark } = useTheme();
  const [report, setReport] = useState(null);
  const [generating, setGenerating] = useState(false);

  const bg   = dark ? "bg-gray-950" : "";
  const card = dark ? "bg-gray-900 border border-gray-800" : "bg-white";
  const text = dark ? "text-white"  : "text-gray-800";
  const sub  = dark ? "text-gray-400" : "text-gray-500";

  const generate = async () => {
    setGenerating(true);
    try {
      const { data } = await api.post("/api/ai/career-report", {});
      setReport(data);
    } catch (err) { alert("Failed: " + err.message); }
    setGenerating(false);
  };

  const scoreColor = (s) => s >= 80 ? "#10b981" : s >= 60 ? "#ff9d38" : "#ff5a3c";

  if (loading || !user) return null;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${bg}`}
      style={!dark ? { background: "linear-gradient(160deg,#eef2ff 0%,#fff4f2 50%,#fff8ed 100%)" } : {}}>
      <Navbar user={user} />
      <div className="max-w-5xl mx-auto p-6 space-y-6">

        <div className="rounded-2xl p-6 text-white"
          style={{ background: "linear-gradient(135deg,#4338ca 0%,#6366f1 40%,#ff5a3c 75%,#ff9d38 100%)" }}>
          <h2 className="text-2xl font-bold mb-1">📊 Career Report</h2>
          <p className="text-white/75 text-sm">AI analyzes your complete profile and generates a personalized career readiness report.</p>
        </div>

        {!report && (
          <div className={`${card} rounded-2xl p-8 text-center shadow-sm`}>
            <div className="text-6xl mb-4">🎯</div>
            <h3 className={`text-xl font-bold mb-2 ${text}`}>Generate Your Career Report</h3>
            <p className={`text-sm mb-6 ${sub}`}>Get your readiness score, strengths, missing skills, salary insights, and growth roadmap.</p>
            <button onClick={generate} disabled={generating}
              className="text-white font-semibold py-3 px-8 rounded-xl transition-all hover:scale-105 disabled:opacity-50 flex items-center gap-2 mx-auto"
              style={{ background: "linear-gradient(135deg,#6366f1,#ff5a3c,#ff9d38)" }}>
              {generating
                ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Analyzing...</>
                : "🚀 Generate Report"}
            </button>
          </div>
        )}

        {report && (
          <div className="space-y-6">

            {/* Score */}
            <div className={`${card} rounded-2xl p-6 shadow-sm`}>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className={`text-lg font-semibold ${text}`}>Career Readiness Score</h3>
                  <p className={`text-sm ${sub}`}>{report.readiness_label}</p>
                </div>
                <div className="relative w-28 h-28">
                  <svg viewBox="0 0 36 36" className="w-28 h-28 -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke={dark ? "#1f2937" : "#f3f4f6"} strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke={scoreColor(report.readiness_score)} strokeWidth="3"
                      strokeDasharray={`${report.readiness_score} 100`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold" style={{ color: scoreColor(report.readiness_score) }}>{report.readiness_score}%</span>
                  </div>
                </div>
              </div>
              <button onClick={generate} disabled={generating}
                className={`mt-4 text-sm px-4 py-2 rounded-lg border transition-all ${dark ? "border-gray-700 text-gray-300 hover:border-gray-500" : "border-gray-200 text-gray-600 hover:border-indigo-300"}`}>
                🔄 Regenerate
              </button>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className={`${card} rounded-2xl p-5 shadow-sm border-l-4 border-l-emerald-500`}>
                <h4 className={`font-semibold mb-3 ${text}`}>💪 Strengths</h4>
                {report.strengths?.map((s, i) => (
                  <div key={i} className="flex items-start gap-2 mb-2">
                    <span className="text-emerald-500 mt-0.5">✓</span>
                    <span className={`text-sm ${sub}`}>{s}</span>
                  </div>
                ))}
              </div>
              <div className={`${card} rounded-2xl p-5 shadow-sm border-l-4 border-l-red-500`}>
                <h4 className={`font-semibold mb-3 ${text}`}>⚠️ Weaknesses</h4>
                {report.weaknesses?.map((w, i) => (
                  <div key={i} className="flex items-start gap-2 mb-2">
                    <span className="text-red-500 mt-0.5">!</span>
                    <span className={`text-sm ${sub}`}>{w}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Missing Skills */}
            <div className={`${card} rounded-2xl p-5 shadow-sm border-l-4 border-l-orange-500`}>
              <h4 className={`font-semibold mb-3 ${text}`}>🎯 Missing Skills</h4>
              <div className="flex flex-wrap gap-2">
                {report.missing_skills?.map((s, i) => (
                  <span key={i} className={`px-3 py-1 rounded-full text-sm font-medium ${dark ? "bg-orange-900/50 text-orange-300" : "bg-orange-100 text-orange-700"}`}>{s}</span>
                ))}
              </div>
            </div>

            {/* Career Paths */}
            <div className={`${card} rounded-2xl p-5 shadow-sm border-l-4 border-l-indigo-500`}>
              <h4 className={`font-semibold mb-3 ${text}`}>🚀 Suitable Career Paths</h4>
              <div className="space-y-3">
                {report.career_paths?.map((c, i) => (
                  <div key={i} className={`flex items-center justify-between p-3 rounded-xl ${dark ? "bg-gray-800" : "bg-gray-50"}`}>
                    <div>
                      <p className={`font-medium text-sm ${text}`}>{c.role}</p>
                      <p className={`text-xs ${sub}`}>{c.reason}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-20 h-2 rounded-full overflow-hidden ${dark ? "bg-gray-700" : "bg-gray-200"}`}>
                        <div className="h-2 rounded-full" style={{ width: `${c.match_score}%`, background: "linear-gradient(90deg,#6366f1,#ff5a3c)" }} />
                      </div>
                      <span className="text-xs font-semibold text-indigo-500">{c.match_score}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Salary */}
            {report.salary_insights && (
              <div className={`${card} rounded-2xl p-5 shadow-sm border-l-4 border-l-purple-500`}>
                <h4 className={`font-semibold mb-3 ${text}`}>💰 Salary Insights</h4>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Entry Level", val: report.salary_insights.entry_level, color: "text-emerald-500" },
                    { label: "Mid Level",   val: report.salary_insights.mid_level,   color: "text-orange-500" },
                    { label: "Senior",      val: report.salary_insights.senior_level, color: "text-indigo-500" },
                  ].map(s => (
                    <div key={s.label} className={`text-center p-3 rounded-xl ${dark ? "bg-gray-800" : "bg-gray-50"}`}>
                      <p className={`text-sm font-bold ${s.color}`}>{s.val}</p>
                      <p className={`text-xs mt-1 ${sub}`}>{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Certs */}
            {report.recommended_certs?.length > 0 && (
              <div className={`${card} rounded-2xl p-5 shadow-sm border-l-4 border-l-yellow-500`}>
                <h4 className={`font-semibold mb-3 ${text}`}>🎓 Recommended Certifications</h4>
                {report.recommended_certs.map((c, i) => (
                  <div key={i} className={`flex items-center justify-between p-3 rounded-xl mb-2 ${dark ? "bg-gray-800" : "bg-gray-50"}`}>
                    <div>
                      <p className={`text-sm font-medium ${text}`}>{c.name}</p>
                      <p className={`text-xs ${sub}`}>{c.platform}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${c.priority === "High" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>{c.priority}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Growth Roadmap */}
            {report.growth_roadmap?.length > 0 && (
              <div className={`${card} rounded-2xl p-5 shadow-sm border-l-4 border-l-pink-500`}>
                <h4 className={`font-semibold mb-4 ${text}`}>🗺️ Growth Roadmap</h4>
                <div className="space-y-4">
                  {report.growth_roadmap.map((phase, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                          style={{ background: "linear-gradient(135deg,#6366f1,#ff5a3c)" }}>{i + 1}</div>
                        {i < report.growth_roadmap.length - 1 && <div className={`w-0.5 flex-1 mt-1 ${dark ? "bg-gray-700" : "bg-gray-200"}`} />}
                      </div>
                      <div className="pb-4">
                        <p className={`text-sm font-semibold ${text}`}>{phase.phase}</p>
                        <p className={`text-sm ${sub} mt-1`}>{phase.focus}</p>
                        {phase.resources?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {phase.resources.map((r, j) => (
                              <span key={j} className={`text-xs px-2 py-0.5 rounded-full ${dark ? "bg-indigo-900/50 text-indigo-300" : "bg-indigo-100 text-indigo-700"}`}>{r}</span>
                            ))}
                          </div>
                        )}
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
