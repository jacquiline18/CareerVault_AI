import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import supabase from "../lib/supabase";
import { useTheme } from "../lib/ThemeContext";
import Logo from "./Logo";

const PRIMARY_LINKS = [
  { path: "/dashboard",       label: "📁 Documents" },
  { path: "/career-insights", label: "🎯 Insights" },
  { path: "/ai-assistant",    label: "🤖 AI Chat" },
];

const MORE_LINKS = [
  { path: "/resume-builder",  label: "📄 Resume Builder" },
  { path: "/portfolio",       label: "🌐 Portfolio" },
  { path: "/career-report",   label: "📊 Career Report" },
  { path: "/interview-prep",  label: "🎤 Interview Prep" },
  { path: "/roadmap",         label: "🗺️ Roadmap" },
  { path: "/gap-analysis",    label: "🔍 Gap Analysis" },
  { path: "/skill-gap",       label: "📊 Skill Gap" },
  { path: "/knowledge-graph", label: "🕸 Knowledge Graph" },
];

export default function Navbar({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { dark, toggle } = useTheme();
  const [moreOpen, setMoreOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;
  const moreActive = MORE_LINKS.some(l => isActive(l.path));

  return (
    <nav className="text-white shadow-lg relative z-50"
      style={{ background: "linear-gradient(135deg,#4338ca 0%,#6366f1 45%,#ff5a3c 80%,#ff9d38 100%)" }}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        <Link to="/dashboard" className="font-bold tracking-tight flex items-center shrink-0">
          <Logo variant="icon" className="h-9 w-9" alt="CareerVault AI" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {PRIMARY_LINKS.map(link => (
            <Link key={link.path} to={link.path}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive(link.path) ? "bg-white text-indigo-700 shadow-md" : "text-white/90 hover:bg-white/20"}`}>
              {link.label}
            </Link>
          ))}

          {/* More dropdown */}
          <div className="relative">
            <button onClick={() => setMoreOpen(o => !o)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${moreActive ? "bg-white text-indigo-700 shadow-md" : "text-white/90 hover:bg-white/20"}`}>
              🛠 Tools
              <svg className={`w-3 h-3 transition-transform ${moreOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {moreOpen && (
              <div className={`absolute top-full left-0 mt-2 w-52 rounded-2xl shadow-xl border overflow-hidden z-50 ${dark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-100"}`}
                onMouseLeave={() => setMoreOpen(false)}>
                {MORE_LINKS.map(link => (
                  <Link key={link.path} to={link.path} onClick={() => setMoreOpen(false)}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm transition-all ${
                      isActive(link.path)
                        ? "bg-indigo-50 text-indigo-700 font-medium"
                        : dark ? "text-gray-300 hover:bg-gray-800" : "text-gray-700 hover:bg-gray-50"
                    }`}>
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-white/70 hidden lg:block truncate max-w-[160px]">{user?.email}</span>

          {/* Theme toggle */}
          <button onClick={toggle} title={dark ? "Light mode" : "Dark mode"}
            className="w-9 h-9 rounded-lg bg-white/15 hover:bg-white/25 border border-white/30 flex items-center justify-center transition-all">
            {dark
              ? <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>
              : <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            }
          </button>

          <button onClick={handleLogout}
            className="bg-white/15 hover:bg-white/25 border border-white/30 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-all">
            Logout
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="md:hidden flex overflow-x-auto gap-1 px-4 pb-3 scrollbar-hide">
        {[...PRIMARY_LINKS, ...MORE_LINKS].map(link => (
          <Link key={link.path} to={link.path}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${isActive(link.path) ? "bg-white text-indigo-700" : "text-white/90 hover:bg-white/20"}`}>
            {link.label}
          </Link>
        ))}
        <button onClick={toggle} className="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap bg-white/15 text-white border border-white/20 ml-1">
          {dark ? "☀️" : "🌙"}
        </button>
      </div>
    </nav>
  );
}
