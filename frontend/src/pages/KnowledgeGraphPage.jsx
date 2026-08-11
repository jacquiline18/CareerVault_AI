import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import useAuth from "../lib/useAuth";
import { useTheme } from "../lib/ThemeContext";
import Navbar from "../components/Navbar";
import KnowledgeGraph from "../components/KnowledgeGraph";

export default function KnowledgeGraphPage() {
  const { user, loading } = useAuth();
  const { dark } = useTheme();
  const [relationships, setRelationships] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => { if (user) fetchGraph(user.id); }, [user]);

  const fetchGraph = async (userId) => {
    try {
      const { data } = await api.get(`/api/documents/knowledge-graph/${userId}`);
      setRelationships(data.relationships || []);
    } catch (err) { console.error(err.message); }
    setFetching(false);
  };

  if (loading || !user) return null;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${dark ? "bg-gray-950" : ""}`}
      style={!dark ? { background: "linear-gradient(160deg, #eef2ff 0%, #fff4f2 50%, #fff8ed 100%)" } : {}}>
      <Navbar user={user} />
      <div className="max-w-6xl mx-auto p-6 space-y-6">

        <div className="rounded-2xl p-6 text-white" style={{ background: "linear-gradient(135deg, #4338ca 0%, #6366f1 40%, #ff5a3c 75%, #ff9d38 100%)" }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">🕸 Knowledge Graph</h2>
              <p className="text-white/75 text-sm">Visual map of how your skills, projects, certificates and career paths connect.</p>
              <div className="flex flex-wrap gap-4 mt-4 text-xs text-white/80">
                {[
                  { color: "#6366f1", label: "Skill" },
                  { color: "#8b5cf6", label: "Project" },
                  { color: "#10b981", label: "Certificate" },
                  { color: "#ff9d38", label: "Internship" },
                  { color: "#ff5a3c", label: "Career" },
                  { color: "#ec4899", label: "Achievement" },
                ].map((item) => (
                  <span key={item.label} className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full shadow-sm" style={{ background: item.color }} />
                    {item.label}
                  </span>
                ))}
              </div>
            </div>
            <button onClick={() => { setFetching(true); fetchGraph(user.id); }}
              className="bg-white/20 hover:bg-white/30 border border-white/30 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 self-start transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {fetching && <p className={`text-sm animate-pulse ${dark ? "text-gray-400" : "text-gray-400"}`}>Loading knowledge graph...</p>}

        {!fetching && relationships.length === 0 && (
          <div className={`rounded-2xl p-8 text-center shadow-sm ${dark ? "bg-gray-900 border border-gray-800" : "bg-white"}`}>
            <p className="text-5xl mb-3">🕸</p>
            <p className={dark ? "text-gray-400" : "text-gray-500"}>No knowledge graph data yet.</p>
            <Link to="/dashboard" className="text-coral-600 text-sm hover:underline mt-2 block">Upload documents to generate connections →</Link>
          </div>
        )}

        {relationships.length > 0 && (
          <div className={`rounded-2xl p-6 shadow-sm border-l-4 border-l-indigo-500 ${dark ? "bg-gray-900 border border-gray-800" : "bg-white"}`}>
            <p className={`text-sm mb-4 ${dark ? "text-gray-400" : "text-gray-400"}`}>{relationships.length} connections found</p>
            <KnowledgeGraph relationships={relationships} />
          </div>
        )}

      </div>
    </div>
  );
}
