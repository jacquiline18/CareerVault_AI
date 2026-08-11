import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import useAuth from "../lib/useAuth";
import { useTheme } from "../lib/ThemeContext";
import Navbar from "../components/Navbar";

export default function CareerInsights() {
  const { user, loading } = useAuth();
  const { dark } = useTheme();
  const [insights, setInsights] = useState(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => { if (user) fetchInsights(user.id); }, [user]);

  const fetchInsights = async (userId) => {
    try {
      const { data } = await api.get(`/api/documents/insights/${userId}`);
      setInsights(data);
    } catch (err) { console.error(err.message); }
    setFetching(false);
  };

  const bg   = dark ? "bg-gray-950"                : "";
  const card = dark ? "bg-gray-900 border border-gray-800" : "bg-white";
  const text = dark ? "text-white"                 : "text-gray-800";
  const sub  = dark ? "text-gray-400"              : "text-gray-500";

  const sectionStyles = {
    indigo: { border: "border-l-indigo-500", item: dark ? "bg-indigo-950/50 border border-indigo-800" : "bg-indigo-50 border border-indigo-100",  label: dark ? "text-indigo-300" : "text-indigo-800",  meta: dark ? "text-indigo-400" : "text-indigo-600"  },
    orange: { border: "border-l-orange-500", item: dark ? "bg-orange-950/50 border border-orange-800": "bg-orange-50 border border-orange-100",  label: dark ? "text-orange-300" : "text-gray-800",   meta: dark ? "text-orange-400" : "text-orange-600"  },
    coral:  { border: "border-l-red-500",    item: dark ? "bg-red-950/50 border border-red-800"      : "bg-red-50 border border-red-100",         label: dark ? "text-red-300"    : "text-gray-800",   meta: dark ? "text-red-400"    : "text-red-600"     },
    purple: { border: "border-l-purple-500", item: dark ? "bg-purple-950/50 border border-purple-800": "bg-purple-50 border border-purple-100",  label: dark ? "text-purple-300" : "text-gray-800",   meta: dark ? "text-purple-400" : "text-purple-600"  },
    green:  { border: "border-l-emerald-500",item: dark ? "bg-emerald-950/50 border border-emerald-800":"bg-emerald-50 border border-emerald-100",label: dark ? "text-emerald-300": "text-gray-800",   meta: dark ? "text-emerald-400": "text-emerald-600" },
  };

  if (loading || !user) return null;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${bg}`}
      style={!dark ? { background: "linear-gradient(160deg,#eef2ff 0%,#fff4f2 50%,#fff8ed 100%)" } : {}}>
      <Navbar user={user} />
      <div className="max-w-5xl mx-auto p-6 space-y-6">

        <div className="rounded-2xl p-6 text-white" style={{ background: "linear-gradient(135deg,#4338ca 0%,#6366f1 40%,#ff5a3c 75%,#ff9d38 100%)" }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">🎯 Career Insights</h2>
              <p className="text-white/75 text-sm">AI-generated career paths, projects, certificates and achievements.</p>
            </div>
            <button onClick={() => { setFetching(true); fetchInsights(user.id); }}
              className="bg-white/20 hover:bg-white/30 border border-white/30 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              Refresh
            </button>
          </div>
        </div>

        {fetching && <p className={`text-sm animate-pulse ${sub}`}>Loading insights...</p>}

        {!fetching && !insights && (
          <div className={`${card} rounded-2xl p-8 text-center shadow-sm`}>
            <p className={sub}>No insights yet.</p>
            <Link to="/dashboard" className="text-orange-500 text-sm hover:underline mt-2 block">Upload documents to get started →</Link>
          </div>
        )}

        {insights && (
          <div className="space-y-6">

            {insights.career_insights?.length > 0 && (
              <div className={`${card} rounded-2xl p-6 shadow-sm border-l-4 ${sectionStyles.indigo.border}`}>
                <h3 className={`text-lg font-semibold mb-4 ${text}`}>🎯 Recommended Career Paths</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {insights.career_insights.map((c) => (
                    <div key={c.id} className={`flex items-center justify-between rounded-xl p-4 ${sectionStyles.indigo.item}`}>
                      <span className={`font-medium ${sectionStyles.indigo.label}`}>{c.career_role}</span>
                      {c.confidence_score && (
                        <div className="flex items-center gap-2">
                          <div className={`w-20 h-2 rounded-full overflow-hidden ${dark ? "bg-indigo-900" : "bg-indigo-100"}`}>
                            <div className="h-2 rounded-full" style={{ width: `${c.confidence_score * 100}%`, background: "linear-gradient(90deg,#6366f1,#ff5a3c)" }} />
                          </div>
                          <span className={`text-xs font-medium ${sectionStyles.indigo.meta}`}>{Math.round(c.confidence_score * 100)}%</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {insights.certificates?.length > 0 && (
              <div className={`${card} rounded-2xl p-6 shadow-sm border-l-4 ${sectionStyles.orange.border}`}>
                <h3 className={`text-lg font-semibold mb-4 ${text}`}>🎓 Certificates</h3>
                {insights.certificates.map((c) => (
                  <div key={c.id} className={`flex items-start gap-3 p-4 rounded-xl mb-3 ${sectionStyles.orange.item}`}>
                    <span className="text-2xl">🏅</span>
                    <div>
                      <p className={`font-semibold ${sectionStyles.orange.label}`}>{c.certificate_name}</p>
                      {c.issuer && <p className={`text-sm ${sectionStyles.orange.meta}`}>Issued by {c.issuer}{c.issue_date ? ` • ${c.issue_date}` : ""}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {insights.internships?.length > 0 && (
              <div className={`${card} rounded-2xl p-6 shadow-sm border-l-4 ${sectionStyles.coral.border}`}>
                <h3 className={`text-lg font-semibold mb-4 ${text}`}>💼 Internships</h3>
                {insights.internships.map((i) => (
                  <div key={i.id} className={`flex items-start gap-3 p-4 rounded-xl mb-3 ${sectionStyles.coral.item}`}>
                    <span className="text-2xl">🏢</span>
                    <div>
                      <p className={`font-semibold ${sectionStyles.coral.label}`}>{i.role} at {i.company_name}</p>
                      {i.duration && <p className={`text-sm ${sectionStyles.coral.meta}`}>{i.duration}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {insights.projects?.length > 0 && (
              <div className={`${card} rounded-2xl p-6 shadow-sm border-l-4 ${sectionStyles.purple.border}`}>
                <h3 className={`text-lg font-semibold mb-4 ${text}`}>🚀 Projects</h3>
                {insights.projects.map((p) => (
                  <div key={p.id} className={`flex items-start gap-3 p-4 rounded-xl mb-3 ${sectionStyles.purple.item}`}>
                    <span className="text-2xl">💡</span>
                    <div>
                      <p className={`font-semibold ${sectionStyles.purple.label}`}>{p.project_name}</p>
                      {p.description && <p className={`text-sm ${sectionStyles.purple.meta}`}>{p.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {insights.achievements?.length > 0 && (
              <div className={`${card} rounded-2xl p-6 shadow-sm border-l-4 ${sectionStyles.green.border}`}>
                <h3 className={`text-lg font-semibold mb-4 ${text}`}>🏆 Achievements</h3>
                {insights.achievements.map((a) => (
                  <div key={a.id} className={`flex items-start gap-3 p-4 rounded-xl mb-3 ${sectionStyles.green.item}`}>
                    <span className="text-2xl">⭐</span>
                    <div>
                      <p className={`font-semibold ${sectionStyles.green.label}`}>{a.title}</p>
                      {a.description && <p className={`text-sm ${sectionStyles.green.meta}`}>{a.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
