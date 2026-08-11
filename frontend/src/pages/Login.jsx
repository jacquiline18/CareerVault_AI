import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import supabase from "../lib/supabase";
import { useTheme } from "../lib/ThemeContext";
import Logo from "../components/Logo";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { dark, toggle } = useTheme();
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else navigate("/dashboard");
    setLoading(false);
  };

  const d = dark;
  return (
    <div className={`min-h-screen flex ${d ? "bg-gray-950" : "bg-gray-50"} transition-colors duration-300`}>

      {/* ── Left panel: image + branding ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col">
        {/* Full-cover student image from Unsplash */}
        <img
          src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&q=80"
          alt="Students studying"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Gradient overlay — indigo → coral */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, rgba(67,56,202,0.82) 0%, rgba(99,102,241,0.7) 40%, rgba(255,90,60,0.75) 75%, rgba(255,157,56,0.8) 100%)" }} />

        {/* Content over image */}
        <div className="relative z-10 flex flex-col justify-between h-full p-10">
          <div>
            <Logo className="h-24 w-auto" />
          </div>

          <div>
            <h2 className="text-4xl font-bold text-white leading-tight mb-4">
              Build your<br />
              <span className="text-orange-300">Digital Career</span><br />
              Identity
            </h2>
            <p className="text-white/75 text-base leading-relaxed mb-8">
              Upload your documents. Let AI extract your skills,<br />
              certificates, and career paths automatically.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2">
              {["🤖 AI Extraction", "📊 Skill Gap Analysis", "🕸 Knowledge Graph", "💬 AI Assistant"].map((f) => (
                <span key={f} className="bg-white/15 backdrop-blur-sm border border-white/25 text-white text-xs px-3 py-1.5 rounded-full font-medium">
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* Testimonial */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5">
            <p className="text-white/90 text-sm italic leading-relaxed">
              "CareerVault AI helped me discover career paths I never considered. The skill gap analysis was a game changer!"
            </p>
            <div className="flex items-center gap-3 mt-3">
              <div className="w-8 h-8 rounded-full bg-orange-400 flex items-center justify-center text-white text-xs font-bold">S</div>
              <div>
                <p className="text-white text-xs font-semibold">Sarah K.</p>
                <p className="text-white/60 text-xs">Computer Science Student</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel: form ── */}
      <div className={`flex-1 flex flex-col items-center justify-center p-8 relative ${d ? "bg-gray-950" : "bg-white"} transition-colors duration-300`}>

        {/* Theme toggle */}
        <button
          onClick={toggle}
          className={`absolute top-6 right-6 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${d ? "bg-white/10 hover:bg-white/20 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}
          title={d ? "Switch to light mode" : "Switch to dark mode"}
        >
          {d ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        <div className="w-full max-w-md animate-fade-in-up">

          {/* Mobile brand */}
          <div className="lg:hidden text-center mb-8">
            <Logo className="h-20 w-auto mx-auto" />
            <p className={`text-sm mt-3 ${d ? "text-gray-400" : "text-gray-500"}`}>Track • Build • Succeed</p>
          </div>

          <div className="mb-8">
            <h2 className={`text-3xl font-bold ${d ? "text-white" : "text-gray-900"}`}>Welcome back 👋</h2>
            <p className={`mt-1 text-sm ${d ? "text-gray-400" : "text-gray-500"}`}>Sign in to access your career vault</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2 mb-5">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${d ? "text-gray-400" : "text-gray-600"}`}>EMAIL ADDRESS</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm transition-all outline-none focus:ring-2
                    ${d
                      ? "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-indigo-500/20"
                      : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500/20"
                    }`}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${d ? "text-gray-400" : "text-gray-600"}`}>PASSWORD</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={`w-full pl-11 pr-11 py-3 rounded-xl border text-sm transition-all outline-none focus:ring-2
                    ${d
                      ? "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-indigo-500/20"
                      : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500/20"
                    }`}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-300">
                  {showPass
                    ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  }
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white font-semibold py-3 px-6 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 mt-2"
              style={{ background: "linear-gradient(135deg, #6366f1 0%, #ff5a3c 60%, #ff9d38 100%)" }}
            >
              {loading ? (
                <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Signing in...</>
              ) : (
                <><span>Sign In</span><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg></>
              )}
            </button>
          </form>

          <div className={`flex items-center gap-3 my-6`}>
            <div className={`flex-1 h-px ${d ? "bg-white/10" : "bg-gray-200"}`} />
            <span className={`text-xs ${d ? "text-gray-500" : "text-gray-400"}`}>New here?</span>
            <div className={`flex-1 h-px ${d ? "bg-white/10" : "bg-gray-200"}`} />
          </div>

          <Link to="/register"
            className={`block w-full text-center font-medium py-3 px-6 rounded-xl border transition-all duration-300 text-sm
              ${d ? "bg-white/5 hover:bg-white/10 text-white border-white/15 hover:border-white/25" : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"}`}>
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}
