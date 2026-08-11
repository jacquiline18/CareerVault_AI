import { useState, useRef, useEffect } from "react";
import api from "../lib/api";
import useAuth from "../lib/useAuth";
import { useTheme } from "../lib/ThemeContext";
import Navbar from "../components/Navbar";

const SUGGESTED = [
  "Summarize my profile",
  "What skills do I have?",
  "What jobs am I suitable for?",
  "Generate interview questions for me",
  "What should I learn next?",
  "Find gaps in my resume",
  "What certificates have I earned?",
  "Which projects used Python?",
];

export default function AIAssistant() {
  const { user, loading } = useAuth();
  const { dark } = useTheme();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const bottomRef = useRef(null);

  const bg   = dark ? "bg-gray-950"  : "";
  const card = dark ? "bg-gray-900 border border-gray-800" : "bg-white";
  const text = dark ? "text-white"   : "text-gray-800";
  const sub  = dark ? "text-gray-400": "text-gray-500";

  useEffect(() => {
    if (!user) return;
    api.get(`/api/ai/chat-history/${user.id}`)
      .then(({ data }) => {
        if (data.history?.length > 0) {
          setMessages(data.history.map(h => ({ role: h.role, text: h.message })));
        } else {
          setMessages([{ role: "assistant", text: "Hi! I'm your CareerVault AI mentor 🎓 I know everything about your profile — skills, projects, certificates, and more. Ask me anything!" }]);
        }
      })
      .catch(() => {
        setMessages([{ role: "assistant", text: "Hi! I'm your CareerVault AI mentor 🎓 Ask me anything about your career profile!" }]);
      })
      .finally(() => setHistoryLoaded(true));
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  const send = async (query) => {
    if (!query.trim() || thinking) return;
    setMessages(prev => [...prev, { role: "user", text: query }]);
    setInput("");
    setThinking(true);
    try {
      const { data } = await api.post("/api/ai/chat", {
        user_id: user.id,
        message: query,
      });
      setMessages(prev => [...prev, { role: "assistant", text: data.answer }]);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Something went wrong. Please try again.";
      setMessages(prev => [...prev, { role: "assistant", text: `❌ ${msg}`, error: true }]);
    }
    setThinking(false);
  };

  const clearHistory = async () => {
    await api.delete("/api/ai/chat-history", { data: { user_id: user.id } });
    setMessages([{ role: "assistant", text: "Chat cleared! How can I help you?" }]);
  };

  if (loading || !user) return null;

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${bg}`}
      style={!dark ? { background: "linear-gradient(160deg,#eef2ff 0%,#fff4f2 50%,#fff8ed 100%)" } : {}}>
      <Navbar user={user} />
      <div className="max-w-3xl mx-auto w-full p-6 flex flex-col flex-1 gap-4">

        {/* Header */}
        <div className="rounded-2xl p-6 text-white relative overflow-hidden"
          style={{ background: "linear-gradient(135deg,#4338ca 0%,#6366f1 40%,#ff5a3c 75%,#ff9d38 100%)" }}>
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-1">🤖 AI Career Mentor</h2>
              <p className="text-white/75 text-sm">Powered by your complete career profile + Groq AI</p>
            </div>
            <button onClick={clearHistory} className="bg-white/15 hover:bg-white/25 border border-white/30 text-white text-xs px-3 py-1.5 rounded-lg transition-all">
              Clear Chat
            </button>
          </div>
        </div>

        {/* Suggested */}
        {messages.length <= 1 && (
          <div className={`${card} rounded-2xl p-4 shadow-sm`}>
            <p className={`text-xs font-semibold mb-3 tracking-wide ${sub}`}>TRY ASKING</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED.map((q, i) => {
                const colors = ["bg-indigo-100 text-indigo-700","bg-red-100 text-red-700","bg-orange-100 text-orange-700","bg-purple-100 text-purple-700"];
                const darkColors = ["bg-indigo-900/50 text-indigo-300","bg-red-900/50 text-red-300","bg-orange-900/50 text-orange-300","bg-purple-900/50 text-purple-300"];
                return (
                  <button key={q} onClick={() => send(q)}
                    className={`text-xs px-3 py-1.5 rounded-full transition-colors font-medium ${dark ? darkColors[i%4] : colors[i%4]}`}>
                    {q}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 space-y-4 min-h-[300px]">
          {!historyLoaded && <p className={`text-sm ${sub}`}>Loading history...</p>}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm shrink-0 mr-2 mt-1"
                  style={{ background: "linear-gradient(135deg,#6366f1,#ff5a3c)" }}>🤖</div>
              )}
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user" ? "text-white rounded-tr-sm"
                : msg.error ? "bg-red-50 text-red-700 border border-red-200 rounded-tl-sm"
                : `${card} ${text} shadow-sm rounded-tl-sm`
              }`} style={msg.role === "user" ? { background: "linear-gradient(135deg,#ff5a3c,#ff9d38)" } : {}}>
                <p className="whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          ))}
          {thinking && (
            <div className="flex justify-start">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm shrink-0 mr-2 mt-1"
                style={{ background: "linear-gradient(135deg,#6366f1,#ff5a3c)" }}>🤖</div>
              <div className={`${card} rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-1.5`}>
                {[0,150,300].map(d => (
                  <span key={d} className="w-2 h-2 rounded-full animate-bounce"
                    style={{ background: "linear-gradient(135deg,#6366f1,#ff5a3c)", animationDelay: `${d}ms` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={e => { e.preventDefault(); send(input); }}
          className={`${card} rounded-2xl shadow-sm p-3 flex gap-2 sticky bottom-4`}>
          <input type="text" value={input} onChange={e => setInput(e.target.value)}
            placeholder="Ask anything about your career profile..."
            className={`flex-1 text-sm outline-none px-2 bg-transparent ${text} placeholder-gray-400`}
            disabled={thinking} />
          <button type="submit" disabled={!input.trim() || thinking}
            className="text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105 disabled:opacity-40 flex items-center gap-1.5"
            style={{ background: "linear-gradient(135deg,#ff5a3c,#ff9d38)" }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
