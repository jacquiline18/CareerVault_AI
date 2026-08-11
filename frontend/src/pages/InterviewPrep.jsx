import { useState } from "react";
import api from "../lib/api";
import useAuth from "../lib/useAuth";
import { useTheme } from "../lib/ThemeContext";
import Navbar from "../components/Navbar";

const TYPES = [
  { id: "technical",  label: "Technical",  icon: "💻" },
  { id: "hr",         label: "HR",         icon: "🤝" },
  { id: "behavioral", label: "Behavioral", icon: "🧠" },
  { id: "coding",     label: "Coding",     icon: "⌨️" },
];

const DIFF_COLOR = {
  Easy:   "bg-emerald-100 text-emerald-700",
  Medium: "bg-orange-100 text-orange-700",
  Hard:   "bg-red-100 text-red-700",
};

export default function InterviewPrep() {
  const { user, loading } = useAuth();
  const { dark } = useTheme();
  const [topic, setTopic] = useState("");
  const [qType, setQType] = useState("technical");
  const [questions, setQuestions] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [expanded, setExpanded] = useState(null);

  const bg   = dark ? "bg-gray-950" : "";
  const card = dark ? "bg-gray-900 border border-gray-800" : "bg-white";
  const text = dark ? "text-white"  : "text-gray-800";
  const sub  = dark ? "text-gray-400" : "text-gray-500";
  const inp  = dark
    ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-indigo-500"
    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-500";

  const generate = async () => {
    if (!topic.trim()) return alert("Enter a topic first");
    setGenerating(true);
    setQuestions([]);
    setExpanded(null);
    try {
      const { data } = await api.post("/api/ai/interview", {
        topic, question_type: qType,
      });
      setQuestions(data.questions || []);
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
          <h2 className="text-2xl font-bold mb-1">🎤 Interview Preparation</h2>
          <p className="text-white/75 text-sm">AI generates personalized interview questions based on your skills and experience.</p>
        </div>

        {/* Controls */}
        <div className={`${card} rounded-2xl p-6 shadow-sm`}>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${sub}`}>TOPIC / ROLE</label>
              <input value={topic} onChange={e => setTopic(e.target.value)}
                placeholder="e.g. Python, React, Data Science, Backend Developer..."
                className={`w-full px-4 py-3 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${inp}`} />
            </div>
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${sub}`}>QUESTION TYPE</label>
              <div className="grid grid-cols-4 gap-2">
                {TYPES.map(t => (
                  <button key={t.id} onClick={() => setQType(t.id)}
                    className={`py-2 rounded-xl text-xs font-medium transition-all border ${
                      qType === t.id
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                        : dark ? "border-gray-700 text-gray-400 hover:border-gray-500" : "border-gray-200 text-gray-500 hover:border-indigo-300"
                    }`}>
                    <div>{t.icon}</div>
                    <div>{t.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button onClick={generate} disabled={generating}
            className="w-full text-white font-semibold py-3 rounded-xl transition-all hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg,#6366f1,#ff5a3c,#ff9d38)" }}>
            {generating
              ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating Questions...</>
              : "🎯 Generate Interview Questions"}
          </button>
        </div>

        {/* Questions */}
        {questions.length > 0 && (
          <div className="space-y-3">
            <p className={`text-sm font-semibold ${sub}`}>{questions.length} questions generated for "{topic}"</p>
            {questions.map((q, i) => (
              <div key={i} className={`${card} rounded-2xl shadow-sm overflow-hidden`}>
                <button onClick={() => setExpanded(expanded === i ? null : i)}
                  className="w-full p-5 text-left flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5"
                      style={{ background: "linear-gradient(135deg,#6366f1,#ff5a3c)" }}>{i + 1}</span>
                    <p className={`text-sm font-medium ${text}`}>{q.question}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DIFF_COLOR[q.difficulty] || "bg-gray-100 text-gray-600"}`}>{q.difficulty}</span>
                    <svg className={`w-4 h-4 transition-transform ${expanded === i ? "rotate-180" : ""} ${sub}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                {expanded === i && (
                  <div className={`px-5 pb-5 space-y-3 border-t ${dark ? "border-gray-800" : "border-gray-100"}`}>
                    {q.hint && (
                      <div className={`mt-3 p-3 rounded-xl text-sm ${dark ? "bg-indigo-900/30 text-indigo-300" : "bg-indigo-50 text-indigo-700"}`}>
                        💡 <strong>Hint:</strong> {q.hint}
                      </div>
                    )}
                    {q.sample_answer && (
                      <div className={`p-3 rounded-xl text-sm ${dark ? "bg-gray-800 text-gray-300" : "bg-gray-50 text-gray-600"}`}>
                        ✅ <strong>Sample Answer:</strong> {q.sample_answer}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
