import { useState } from "react";
import api from "../lib/api";
import jsPDF from "jspdf";
import useAuth from "../lib/useAuth";
import { useTheme } from "../lib/ThemeContext";
import Navbar from "../components/Navbar";

const TEMPLATES = [
  { id: "modern",          label: "Modern",           icon: "✨", desc: "Clean & contemporary" },
  { id: "ats",             label: "ATS Friendly",      icon: "🤖", desc: "Optimized for scanners" },
  { id: "professional",    label: "Professional",      icon: "💼", desc: "Corporate & formal" },
  { id: "student",         label: "Student",           icon: "🎓", desc: "Perfect for freshers" },
  { id: "software_engineer",label: "Software Engineer",icon: "💻", desc: "Tech-focused layout" },
];

export default function ResumeBuilder() {
  const { user, loading } = useAuth();
  const { dark } = useTheme();
  const [template, setTemplate] = useState("modern");
  const [resume, setResume] = useState(null);
  const [generating, setGenerating] = useState(false);

  const bg   = dark ? "bg-gray-950" : "";
  const card = dark ? "bg-gray-900 border border-gray-800" : "bg-white";
  const text = dark ? "text-white"  : "text-gray-800";
  const sub  = dark ? "text-gray-400":"text-gray-500";

  const generate = async () => {
    setGenerating(true);
    setResume(null);
    try {
      const { data } = await api.post("/api/ai/resume", { template });
      setResume(data);
    } catch (err) { alert("Generation failed: " + err.message); }
    setGenerating(false);
  };

  const downloadPDF = () => {
    if (!resume) return;
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const c = resume.content;
    const margin = 20;
    let y = margin;
    const lh = 7;
    const pageH = 297;

    const addLine = (txt, size = 11, bold = false, color = [30,30,30]) => {
      if (y > pageH - margin) { doc.addPage(); y = margin; }
      doc.setFontSize(size);
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.setTextColor(...color);
      doc.text(txt, margin, y);
      y += lh;
    };

    const addSection = (title) => {
      y += 3;
      doc.setDrawColor(99, 102, 241);
      doc.setLineWidth(0.5);
      doc.line(margin, y, 210 - margin, y);
      y += 4;
      addLine(title, 13, true, [67, 56, 202]);
    };

    // Header
    addLine(c.summary ? "RESUME" : "RESUME", 20, true, [67, 56, 202]);
    y += 2;

    if (c.summary) {
      addSection("PROFESSIONAL SUMMARY");
      const lines = doc.splitTextToSize(c.summary, 170);
      lines.forEach(l => addLine(l, 10));
    }

    if (c.skills_grouped) {
      addSection("SKILLS");
      Object.entries(c.skills_grouped).forEach(([cat, skills]) => {
        addLine(`${cat}: ${skills.join(", ")}`, 10);
      });
    }

    if (c.projects?.length) {
      addSection("PROJECTS");
      c.projects.forEach(p => {
        addLine(p.name, 11, true);
        addLine(p.description, 10);
        if (p.tech?.length) addLine(`Tech: ${p.tech.join(", ")}`, 9, false, [100,100,100]);
        y += 2;
      });
    }

    if (c.internships?.length) {
      addSection("INTERNSHIPS");
      c.internships.forEach(i => {
        addLine(`${i.role} @ ${i.company}`, 11, true);
        addLine(i.duration || "", 9, false, [100,100,100]);
        (i.highlights || []).forEach(h => addLine(`• ${h}`, 10));
        y += 2;
      });
    }

    if (c.certificates?.length) {
      addSection("CERTIFICATES");
      c.certificates.forEach(cert => {
        addLine(`${cert.name} — ${cert.issuer}${cert.date ? " (" + cert.date + ")" : ""}`, 10);
      });
    }

    if (c.achievements?.length) {
      addSection("ACHIEVEMENTS");
      c.achievements.forEach(a => addLine(`• ${a}`, 10));
    }

    doc.save(`resume_${template}.pdf`);
  };

  if (loading || !user) return null;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${bg}`}
      style={!dark ? { background: "linear-gradient(160deg,#eef2ff 0%,#fff4f2 50%,#fff8ed 100%)" } : {}}>
      <Navbar user={user} />
      <div className="max-w-5xl mx-auto p-6 space-y-6">

        {/* Header */}
        <div className="rounded-2xl p-6 text-white"
          style={{ background: "linear-gradient(135deg,#4338ca 0%,#6366f1 40%,#ff5a3c 75%,#ff9d38 100%)" }}>
          <h2 className="text-2xl font-bold mb-1">📄 Resume Builder</h2>
          <p className="text-white/75 text-sm">AI generates a professional resume from your career profile. Download as PDF instantly.</p>
        </div>

        {/* Template selector */}
        <div className={`${card} rounded-2xl p-6 shadow-sm`}>
          <h3 className={`text-lg font-semibold mb-4 ${text}`}>Choose Template</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {TEMPLATES.map(t => (
              <button key={t.id} onClick={() => setTemplate(t.id)}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  template === t.id
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30"
                    : dark ? "border-gray-700 hover:border-gray-500" : "border-gray-200 hover:border-indigo-300"
                }`}>
                <div className="text-2xl mb-1">{t.icon}</div>
                <div className={`text-sm font-semibold ${template === t.id ? "text-indigo-600" : text}`}>{t.label}</div>
                <div className={`text-xs mt-0.5 ${sub}`}>{t.desc}</div>
              </button>
            ))}
          </div>

          <button onClick={generate} disabled={generating}
            className="mt-6 w-full text-white font-semibold py-3 rounded-xl transition-all hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg,#6366f1,#ff5a3c,#ff9d38)" }}>
            {generating ? (
              <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating Resume...</>
            ) : (
              <><span>✨ Generate Resume with AI</span></>
            )}
          </button>
        </div>

        {/* Resume Preview */}
        {resume && (
          <div className={`${card} rounded-2xl p-6 shadow-sm`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-lg font-semibold ${text}`}>📋 Resume Preview</h3>
              <button onClick={downloadPDF}
                className="text-white px-5 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 hover:scale-105 transition-all"
                style={{ background: "linear-gradient(135deg,#ff5a3c,#ff9d38)" }}>
                ⬇️ Download PDF
              </button>
            </div>

            <div className={`rounded-xl p-6 space-y-5 ${dark ? "bg-gray-800" : "bg-gray-50"}`}>
              {resume.content.summary && (
                <div>
                  <h4 className="text-xs font-bold tracking-widest text-indigo-500 mb-2">PROFESSIONAL SUMMARY</h4>
                  <p className={`text-sm leading-relaxed ${sub}`}>{resume.content.summary}</p>
                </div>
              )}

              {resume.content.skills_grouped && (
                <div>
                  <h4 className="text-xs font-bold tracking-widest text-indigo-500 mb-2">SKILLS</h4>
                  {Object.entries(resume.content.skills_grouped).map(([cat, skills]) => (
                    <div key={cat} className="mb-2">
                      <span className={`text-xs font-semibold ${text}`}>{cat}: </span>
                      <span className={`text-xs ${sub}`}>{skills.join(", ")}</span>
                    </div>
                  ))}
                </div>
              )}

              {resume.content.projects?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold tracking-widest text-indigo-500 mb-2">PROJECTS</h4>
                  {resume.content.projects.map((p, i) => (
                    <div key={i} className="mb-3">
                      <p className={`text-sm font-semibold ${text}`}>{p.name}</p>
                      <p className={`text-xs ${sub}`}>{p.description}</p>
                      {p.tech?.length > 0 && <p className="text-xs text-indigo-500 mt-1">{p.tech.join(" · ")}</p>}
                    </div>
                  ))}
                </div>
              )}

              {resume.content.internships?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold tracking-widest text-indigo-500 mb-2">INTERNSHIPS</h4>
                  {resume.content.internships.map((i, idx) => (
                    <div key={idx} className="mb-3">
                      <p className={`text-sm font-semibold ${text}`}>{i.role} @ {i.company}</p>
                      <p className={`text-xs ${sub}`}>{i.duration}</p>
                    </div>
                  ))}
                </div>
              )}

              {resume.content.certificates?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold tracking-widest text-indigo-500 mb-2">CERTIFICATES</h4>
                  {resume.content.certificates.map((c, i) => (
                    <p key={i} className={`text-xs ${sub}`}>🏅 {c.name} — {c.issuer}{c.date ? ` (${c.date})` : ""}</p>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
