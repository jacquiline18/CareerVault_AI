import { useState } from "react";
import api from "../lib/api";
import useAuth from "../lib/useAuth";
import { useTheme } from "../lib/ThemeContext";
import Navbar from "../components/Navbar";

const POPULAR_ROLES = [
  "Full Stack Developer", "Data Scientist", "Cloud Engineer",
  "DevOps Engineer", "Machine Learning Engineer", "Backend Developer",
  "Frontend Developer", "Cybersecurity Analyst",
];

export default function RoadmapPage() {
  const { user, loading } = useAuth();
  const { dark } = useTheme();
  const [targetRole, setTargetRole] = useState("");
  const [roadmap, setRoadmap] = useState(null);
  const [generating, setGenerating] = useState(false);

  const bg   = dark ? "bg-gray-950" : "";
  const card = dark ? "bg-gray-900 border border-gray-800" : "bg-white";
  const text = dark ? "text-white"  : "text-gray-800";
  const sub  = dark ? "text-gray-400" : "text-gray-500";
  const inp  = dark
    ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-indigo-500"
    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-500";

  const generate = async (role) => {
    const r = role || targetRole;
    if (!r.trim()) return alert("Enter a target role");
    setTargetRole(r);
    setGenerating(true);
    setRoadmap(null);
    try {
      const { data } = await api.post("/api/ai/roadmap", { target_role: r });
      setRoadmap(data);
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
          <h2 className="text-2xl font-bold mb-1">🗺️ AI Roadmap Generator</h2>
          <p className="text-white/75 text-sm">Get a personalized week-by-week learning roadmap to reach your target role.</p>
        </div>

        {/* Input */}
        <div className={`${card} rounded-2xl p-6 shadow-sm`}>
          <label className={`block text-xs font-semibold mb-1.5 ${sub}`}>TARGET ROLE</label>
          <div className="flex gap-3 mb-4">
            <input value={targetRole} onChange={e => setTargetRole(e.target.value)}
              onKeyDown={e => e.key === "Enter" && generate()}
              placeholder="e.g. Full Stack Developer, Data Scientist..."
              className={`flex-1 px-4 py-3 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${inp}`} />
            <button onClick={() => generate()} disabled={generating}
              className="text-white px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg,#6366f1,#ff5a3c)" }}>
              {generating ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Generate"}
            </button>
          </div>
          <p className={`text-xs mb-2 ${sub}`}>Popular roles:</p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_ROLES.map(r => (
              <button key={r} onClick={() => generate(r)}
                className={`text-xs px-3 py-1.5 rounded-full transition-all font-medium ${dark ? "bg-gray-800 text-gray-300 hover:bg-indigo-900/50 hover:text-indigo-300" : "bg-gray-100 text-gray-600 hover:bg-indigo-100 hover:text-indigo-700"}`}>
                {r}
              </button>
            ))}
          </div>
        </div>

        {generating && (
          <div className={`${card} rounded-2xl p-8 text-center shadow-sm`}>
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className={`text-sm ${sub}`}>Building your personalized roadmap...</p>
          </div>
        )}

        {roadmap && (
          <div className="space-y-6">

            {/* Overview */}
            <div className={`${card} rounded-2xl p-6 shadow-sm`}>
              <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
                <div>
                  <h3 className={`text-lg font-bold ${text}`}>Roadmap to: {roadmap.target_role}</h3>
                  <p className={`text-sm ${sub}`}>Current match: {roadmap.current_match_score}%</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-32 h-3 rounded-full overflow-hidden ${dark ? "bg-gray-700" : "bg-gray-200"}`}>
                    <div className="h-3 rounded-full transition-all" style={{ width: `${roadmap.current_match_score}%`, background: "linear-gradient(90deg,#6366f1,#ff5a3c)" }} />
                  </div>
                  <span className="text-sm font-bold text-indigo-500">{roadmap.current_match_score}%</span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className={`text-xs font-semibold mb-2 ${sub}`}>✅ SKILLS YOU HAVE</p>
                  <div className="flex flex-wrap gap-1.5">
                    {roadmap.skills_you_have?.map((s, i) => (
                      <span key={i} className={`text-xs px-2 py-1 rounded-full font-medium ${dark ? "bg-emerald-900/50 text-emerald-300" : "bg-emerald-100 text-emerald-700"}`}>{s}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className={`text-xs font-semibold mb-2 ${sub}`}>📚 SKILLS TO LEARN</p>
                  <div className="flex flex-wrap gap-1.5">
                    {roadmap.skills_to_learn?.map((s, i) => (
                      <span key={i} className={`text-xs px-2 py-1 rounded-full font-medium ${dark ? "bg-orange-900/50 text-orange-300" : "bg-orange-100 text-orange-700"}`}>{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Weekly plan */}
            <div className={`${card} rounded-2xl p-6 shadow-sm`}>
              <h3 className={`text-lg font-semibold mb-6 ${text}`}>📅 Weekly Learning Plan</h3>
              <div className="space-y-4">
                {roadmap.weeks?.map((week, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
                        style={{ background: i % 2 === 0 ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "linear-gradient(135deg,#ff5a3c,#ff9d38)" }}>
                        W{week.week}
                      </div>
                      {i < roadmap.weeks.length - 1 && <div className={`w-0.5 flex-1 mt-2 ${dark ? "bg-gray-700" : "bg-gray-200"}`} />}
                    </div>
                    <div className={`flex-1 p-4 rounded-xl mb-2 ${dark ? "bg-gray-800" : "bg-gray-50"}`}>
                      <p className={`font-semibold text-sm mb-1 ${text}`}>{week.theme}</p>
                      <p className={`text-xs mb-3 ${sub}`}>{week.goal}</p>
                      <div className="space-y-1 mb-3">
                        {week.tasks?.map((task, j) => (
                          <div key={j} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                            <span className={`text-xs ${sub}`}>{task}</span>
                          </div>
                        ))}
                      </div>
                      {week.resources?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {week.resources.map((r, j) => (
                            <span key={j} className={`text-xs px-2 py-0.5 rounded-full ${dark ? "bg-indigo-900/50 text-indigo-300" : "bg-indigo-100 text-indigo-700"}`}>📖 {r}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
