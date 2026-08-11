import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import supabase from "../lib/supabase";
import useAuth from "../lib/useAuth";
import { useTheme } from "../lib/ThemeContext";
import Navbar from "../components/Navbar";
import UploadDocument from "../components/UploadDocument";
import DocumentsList from "../components/DocumentsList";

const STATS = [
  { key: "documents", label: "Documents",   icon: "📁", from: "#6366f1", to: "#4338ca" },
  { key: "skills",    label: "Skills",      icon: "🛠",  from: "#ff5a3c", to: "#ed3a1e" },
  { key: "certs",     label: "Certificates",icon: "🎓", from: "#ff9d38", to: "#ff7d0a" },
  { key: "careers",   label: "Career Paths",icon: "🎯", from: "#8b5cf6", to: "#6366f1" },
];

export default function Dashboard() {
  const { user, loading } = useAuth();
  const { dark } = useTheme();
  const [documents, setDocuments] = useState([]);
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    if (user) { fetchDocuments(user.id); fetchInsights(user.id); }
  }, [user]);

  const fetchDocuments = async (userId) => {
    const { data } = await supabase.from("documents").select("*").eq("user_id", userId).order("upload_date", { ascending: false });
    setDocuments(data || []);
  };

  const fetchInsights = async (userId) => {
    try {
      const { data } = await api.get(`/api/documents/insights/${userId}`);
      setInsights(data);
    } catch (err) { console.error(err.message); }
  };

  const handleRefresh = () => { fetchDocuments(user.id); fetchInsights(user.id); };

  if (loading || !user) return null;

  const statValues = {
    documents: documents.length,
    skills:    insights?.skills?.length || 0,
    certs:     insights?.certificates?.length || 0,
    careers:   insights?.career_insights?.length || 0,
  };

  const tagColors = [
    dark ? "bg-indigo-900/60 text-indigo-300 border border-indigo-700" : "bg-indigo-100 text-indigo-700 border border-indigo-200",
    dark ? "bg-red-900/60 text-red-300 border border-red-700"         : "bg-coral-100 text-coral-700 border border-coral-200",
    dark ? "bg-orange-900/60 text-orange-300 border border-orange-700": "bg-orange-100 text-orange-700 border border-orange-200",
    dark ? "bg-purple-900/60 text-purple-300 border border-purple-700": "bg-purple-100 text-purple-700 border border-purple-200",
    dark ? "bg-pink-900/60 text-pink-300 border border-pink-700"      : "bg-pink-100 text-pink-700 border border-pink-200",
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${dark ? "bg-gray-950" : ""}`}
      style={!dark ? { background: "linear-gradient(160deg, #eef2ff 0%, #fff4f2 50%, #fff8ed 100%)" } : {}}>
      <Navbar user={user} />
      <div className="max-w-5xl mx-auto p-6 space-y-6">

        {/* Hero */}
        <div className="rounded-2xl p-7 text-white relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #4338ca 0%, #6366f1 40%, #ff5a3c 75%, #ff9d38 100%)" }}>
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)", transform: "translate(30%,-30%)" }} />
          <h2 className="text-2xl font-bold mb-1">Welcome back 👋</h2>
          <p className="text-white/75 text-sm mb-5">Upload your career documents and let AI build your Digital Identity.</p>
          <div className="flex flex-wrap gap-3">
            <Link to="/career-insights" className="bg-white text-indigo-700 px-4 py-2 rounded-xl text-sm font-semibold hover:shadow-lg transition-all hover:scale-105">🎯 Career Insights</Link>
            <Link to="/ai-assistant"    className="bg-white/20 border border-white/30 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-white/30 transition-all">🤖 Ask AI Assistant</Link>
            <Link to="/knowledge-graph" className="bg-white/20 border border-white/30 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-white/30 transition-all">🕸 Knowledge Graph</Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((s) => (
            <div key={s.key} className={`rounded-2xl p-4 shadow-sm text-center hover:scale-105 transition-all duration-300 hover:shadow-md ${dark ? "bg-gray-900 border border-gray-800" : "bg-white"}`}>
              <div className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center text-xl"
                style={{ background: `linear-gradient(135deg, ${s.from}, ${s.to})` }}>
                {s.icon}
              </div>
              <div className={`text-2xl font-bold ${dark ? "text-white" : "text-gray-800"}`}>{statValues[s.key]}</div>
              <div className={`text-xs mt-0.5 ${dark ? "text-gray-400" : "text-gray-500"}`}>{s.label}</div>
            </div>
          ))}
        </div>

        <UploadDocument userId={user.id} onUploadSuccess={handleRefresh} />
        <DocumentsList documents={documents} userId={user.id} onDelete={handleRefresh} />

        {/* Phase 6 Feature Cards */}
        <div className={`rounded-2xl p-6 shadow-sm ${dark ? "bg-gray-900 border border-gray-800" : "bg-white"}`}>
          <h3 className={`text-lg font-semibold mb-4 ${dark ? "text-white" : "text-gray-800"}`}>🚀 AI Career Tools</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { path: "/ai-assistant",   icon: "🤖", label: "AI Career Chat",    desc: "Ask anything",          from: "#6366f1", to: "#4338ca" },
              { path: "/resume-builder", icon: "📄", label: "Resume Builder",    desc: "AI-generated PDF",      from: "#ff5a3c", to: "#ed3a1e" },
              { path: "/career-report",  icon: "📊", label: "Career Report",     desc: "Readiness score",       from: "#ff9d38", to: "#ff7d0a" },
              { path: "/interview-prep", icon: "🎤", label: "Interview Prep",    desc: "Practice questions",    from: "#8b5cf6", to: "#6366f1" },
              { path: "/roadmap",        icon: "🗺️", label: "Learning Roadmap",  desc: "Week-by-week plan",     from: "#10b981", to: "#059669" },
              { path: "/gap-analysis",   icon: "🔍", label: "Gap Analysis",      desc: "vs target role",        from: "#f43f5e", to: "#e11d48" },
              { path: "/portfolio",      icon: "🌐", label: "Portfolio Builder", desc: "Download HTML site",    from: "#0ea5e9", to: "#0284c7" },
              { path: "/knowledge-graph",icon: "🕸", label: "Knowledge Graph",   desc: "Visual connections",    from: "#ec4899", to: "#db2777" },
              { path: "/skill-gap",      icon: "📈", label: "Skill Gap",         desc: "What to learn next",    from: "#f59e0b", to: "#d97706" },
            ].map(f => (
              <Link key={f.path} to={f.path}
                className={`p-4 rounded-xl transition-all hover:scale-105 hover:shadow-md ${dark ? "bg-gray-800 hover:bg-gray-750" : "bg-gray-50 hover:bg-white"}`}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg mb-2"
                  style={{ background: `linear-gradient(135deg,${f.from},${f.to})` }}>{f.icon}</div>
                <p className={`text-sm font-semibold ${dark ? "text-white" : "text-gray-800"}`}>{f.label}</p>
                <p className={`text-xs mt-0.5 ${dark ? "text-gray-400" : "text-gray-500"}`}>{f.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Skills preview */}
        {insights?.skills?.length > 0 && (
          <div className={`rounded-2xl p-6 shadow-sm ${dark ? "bg-gray-900 border border-gray-800" : "bg-white"}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-semibold ${dark ? "text-white" : "text-gray-800"}`}>🛠 Skills Identified</h3>
              <Link to="/skill-gap" className="text-sm text-coral-500 hover:text-coral-400 font-medium hover:underline">Analyze Skill Gap →</Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {insights.skills.map((s, i) => (
                <span key={s.id} className={`${tagColors[i % tagColors.length]} px-3 py-1 rounded-full text-sm font-medium`}>
                  {s.skill_name}
                </span>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
