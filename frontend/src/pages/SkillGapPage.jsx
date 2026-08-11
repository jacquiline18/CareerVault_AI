import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import useAuth from "../lib/useAuth";
import { useTheme } from "../lib/ThemeContext";
import Navbar from "../components/Navbar";
import SkillGap from "../components/SkillGap";

export default function SkillGapPage() {
  const { user, loading } = useAuth();
  const { dark } = useTheme();
  const [skills, setSkills] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => { if (user) fetchSkills(user.id); }, [user]);

  const fetchSkills = async (userId) => {
    try {
      const { data } = await api.get(`/api/documents/insights/${userId}`);
      setSkills(data.skills || []);
    } catch (err) { console.error(err.message); }
    setFetching(false);
  };

  if (loading || !user) return null;

  const tagColors = dark ? [
    "bg-indigo-900/60 text-indigo-300 border border-indigo-700",
    "bg-red-900/60 text-red-300 border border-red-700",
    "bg-orange-900/60 text-orange-300 border border-orange-700",
    "bg-purple-900/60 text-purple-300 border border-purple-700",
    "bg-pink-900/60 text-pink-300 border border-pink-700",
  ] : [
    "bg-indigo-100 text-indigo-700 border border-indigo-200",
    "bg-coral-100 text-coral-700 border border-coral-200",
    "bg-orange-100 text-orange-700 border border-orange-200",
    "bg-purple-100 text-purple-700 border border-purple-200",
    "bg-pink-100 text-pink-700 border border-pink-200",
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${dark ? "bg-gray-950" : ""}`}
      style={!dark ? { background: "linear-gradient(160deg, #eef2ff 0%, #fff4f2 50%, #fff8ed 100%)" } : {}}>
      <Navbar user={user} />
      <div className="max-w-3xl mx-auto p-6 space-y-6">

        <div className="rounded-2xl p-6 text-white" style={{ background: "linear-gradient(135deg, #4338ca 0%, #6366f1 40%, #ff5a3c 75%, #ff9d38 100%)" }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">📊 Skill Gap Analysis</h2>
              <p className="text-white/75 text-sm">Select a career goal to see what you have and what you're missing.</p>
            </div>
            <button onClick={() => { setFetching(true); fetchSkills(user.id); }}
              className="bg-white/20 hover:bg-white/30 border border-white/30 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {fetching && <p className={`text-sm animate-pulse ${dark ? "text-gray-400" : "text-gray-400"}`}>Loading skills...</p>}

        {!fetching && skills.length === 0 && (
          <div className={`rounded-2xl p-8 text-center shadow-sm ${dark ? "bg-gray-900 border border-gray-800" : "bg-white"}`}>
            <p className={dark ? "text-gray-400" : "text-gray-500"}>No skills found yet.</p>
            <Link to="/dashboard" className="text-coral-600 text-sm hover:underline mt-2 block">Upload documents to extract skills →</Link>
          </div>
        )}

        {skills.length > 0 && (
          <>
            <div className={`rounded-2xl p-6 shadow-sm border-l-4 border-l-coral-500 ${dark ? "bg-gray-900 border border-gray-800" : "bg-white"}`}>
              <h3 className={`text-lg font-semibold mb-4 ${dark ? "text-white" : "text-gray-800"}`}>🛠 Your Current Skills</h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((s, i) => (
                  <span key={s.id} className={`${tagColors[i % tagColors.length]} px-3 py-1 rounded-full text-sm font-medium`}>
                    {s.skill_name}
                  </span>
                ))}
              </div>
            </div>

            <div className={`rounded-2xl p-6 shadow-sm border-l-4 border-l-orange-500 ${dark ? "bg-gray-900 border border-gray-800" : "bg-white"}`}>
              <h3 className={`text-lg font-semibold mb-4 ${dark ? "text-white" : "text-gray-800"}`}>🎯 Analyze Gap for a Career Goal</h3>
              <SkillGap userSkills={skills} />
            </div>
          </>
        )}

      </div>
    </div>
  );
}
