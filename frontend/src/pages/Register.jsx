import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import supabase from "../lib/supabase";
import { useTheme } from "../lib/ThemeContext";
import Logo from "../components/Logo";

export default function Register() {
  const [form, setForm] = useState({ full_name: "", email: "", password: "", college_name: "", department: "", year_of_study: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { dark, toggle } = useTheme();
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { data, error } = await supabase.auth.signUp({ email: form.email, password: form.password });
    if (error) { setError(error.message); setLoading(false); return; }
    if (data.user) {
      await supabase.from("profiles").insert([{
        id: data.user.id,
        full_name: form.full_name,
        college_name: form.college_name,
        department: form.department,
        year_of_study: parseInt(form.year_of_study) || null
      }]);
    }
    navigate("/dashboard");
    setLoading(false);
  };

  const d = dark;

  const inputClass = `w-full pl-11 pr-4 py-3 rounded-xl border text-sm transition-all outline-none focus:ring-2
    ${d ? "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-indigo-500/20"
        : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500/20"}`;

  const labelClass = `block text-xs font-semibold mb-1.5 ${d ? "text-gray-400" : "text-gray-600"}`;

  const fields = [
    { name: "full_name",     label: "FULL NAME",      type: "text",     placeholder: "John Doe",           icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
    { name: "college_name",  label: "COLLEGE NAME",   type: "text",     placeholder: "MIT, Stanford...",   icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
    { name: "department",    label: "DEPARTMENT",     type: "text",     placeholder: "Computer Science",   icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
    { name: "year_of_study", label: "YEAR OF STUDY",  type: "number",   placeholder: "1, 2, 3, 4...",     icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
  ];

  return (
    <div className={`min-h-screen flex ${d ? "bg-gray-950" : "bg-gray-50"} transition-colors duration-300`}>

      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col">
        <img
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&q=80"
          alt="Students collaborating"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, rgba(67,56,202,0.82) 0%, rgba(99,102,241,0.7) 40%, rgba(255,90,60,0.75) 75%, rgba(255,157,56,0.8) 100%)" }} />

        <div className="relative z-10 flex flex-col justify-between h-full p-10">
          <div>
            <Logo className="h-24 w-auto" />
          </div>

          <div>
            <h2 className="text-4xl font-bold text-white leading-tight mb-4">
              Start your<br />
              <span className="text-orange-300">Career Journey</span><br />
              today
            </h2>
            <p className="text-white/75 text-base leading-relaxed mb-8">
              Join thousands of students who use AI to<br />
              discover their strengths and career potential.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: "10K+", label: "Students" },
                { value: "50+", label: "Career Paths" },
                { value: "98%", label: "Accuracy" },
              ].map((s) => (
                <div key={s.label} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 text-center">
                  <div className="text-xl font-bold text-orange-300">{s.value}</div>
                  <div className="text-white/70 text-xs mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5">
            <p className="text-white/90 text-sm italic leading-relaxed">
              "I uploaded my resume and within seconds had a complete skill map and 5 career paths I could pursue. Incredible!"
            </p>
            <div className="flex items-center gap-3 mt-3">
              <div className="w-8 h-8 rounded-full bg-indigo-400 flex items-center justify-center text-white text-xs font-bold">A</div>
              <div>
                <p className="text-white text-xs font-semibold">Alex M.</p>
                <p className="text-white/60 text-xs">Final Year Engineering Student</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel: form ── */}
      <div className={`flex-1 flex flex-col items-center justify-center p-8 relative ${d ? "bg-gray-950" : "bg-white"} transition-colors duration-300`}>

        {/* Theme toggle */}
        <button onClick={toggle}
          className={`absolute top-6 right-6 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${d ? "bg-white/10 hover:bg-white/20 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}>
          {d
            ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>
            : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
          }
        </button>

        <div className="w-full max-w-md animate-fade-in-up">

          {/* Mobile brand */}
          <div className="lg:hidden text-center mb-6">
            <Logo className="h-20 w-auto mx-auto" />
            <p className={`text-sm mt-3 ${d ? "text-gray-400" : "text-gray-500"}`}>Track • Build • Succeed</p>
          </div>

          <div className="mb-6">
            <h2 className={`text-3xl font-bold ${d ? "text-white" : "text-gray-900"}`}>Create account 🚀</h2>
            <p className={`mt-1 text-sm ${d ? "text-gray-400" : "text-gray-500"}`}>Fill in your details to get started</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2 mb-4">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-3">
            {/* Email */}
            <div>
              <label className={labelClass}>EMAIL ADDRESS</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <input type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required className={inputClass} />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className={labelClass}>PASSWORD</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <input type={showPass ? "text" : "password"} name="password" placeholder="Min. 6 characters" value={form.password} onChange={handleChange} required className={`${inputClass} pr-11`} />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-300">
                  {showPass
                    ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  }
                </button>
              </div>
            </div>

            {/* Other fields */}
            {fields.map((field) => (
              <div key={field.name}>
                <label className={labelClass}>{field.label}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={field.icon} /></svg>
                  </div>
                  <input type={field.type} name={field.name} placeholder={field.placeholder} value={form[field.name]} onChange={handleChange} className={inputClass} />
                </div>
              </div>
            ))}

            <button type="submit" disabled={loading}
              className="w-full text-white font-semibold py-3 px-6 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 mt-1"
              style={{ background: "linear-gradient(135deg, #6366f1 0%, #ff5a3c 60%, #ff9d38 100%)" }}>
              {loading
                ? <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Creating account...</>
                : <><span>Create Account</span><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg></>
              }
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className={`flex-1 h-px ${d ? "bg-white/10" : "bg-gray-200"}`} />
            <span className={`text-xs ${d ? "text-gray-500" : "text-gray-400"}`}>Already registered?</span>
            <div className={`flex-1 h-px ${d ? "bg-white/10" : "bg-gray-200"}`} />
          </div>

          <Link to="/login"
            className={`block w-full text-center font-medium py-3 px-6 rounded-xl border transition-all duration-300 text-sm
              ${d ? "bg-white/5 hover:bg-white/10 text-white border-white/15 hover:border-white/25" : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"}`}>
            Sign In Instead
          </Link>
        </div>
      </div>
    </div>
  );
}
