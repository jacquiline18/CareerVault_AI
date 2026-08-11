import { useState } from "react";
import { useTheme } from "../lib/ThemeContext";

const CAREER_SKILLS = {
  "Data Engineer": ["Python", "SQL", "Apache Spark", "Docker", "AWS", "ETL Pipelines", "Kafka"],
  "Full Stack Developer": ["React", "Node.js", "MongoDB", "Express", "JavaScript", "REST APIs", "Git"],
  "Cloud Engineer": ["AWS", "Docker", "Kubernetes", "Terraform", "Linux", "CI/CD", "Networking"],
  "Data Analyst": ["Python", "SQL", "Power BI", "Excel", "Statistics", "Tableau", "Data Visualization"],
  "Machine Learning Engineer": ["Python", "TensorFlow", "PyTorch", "SQL", "Statistics", "Docker", "MLOps"],
  "Backend Developer": ["Node.js", "Python", "SQL", "REST APIs", "Docker", "Git", "System Design"],
  "DevOps Engineer": ["Docker", "Kubernetes", "CI/CD", "AWS", "Linux", "Terraform", "Git"],
};

export default function SkillGap({ userSkills }) {
  const [selectedCareer, setSelectedCareer] = useState("");
  const [gap, setGap] = useState(null);
  const { dark } = useTheme();

  const analyze = () => {
    if (!selectedCareer) return;
    const required = CAREER_SKILLS[selectedCareer] || [];
    const existing = userSkills.map((s) => s.skill_name.toLowerCase());
    const missing = required.filter((s) => !existing.includes(s.toLowerCase()));
    const present = required.filter((s) => existing.includes(s.toLowerCase()));
    setGap({ missing, present, total: required.length });
  };

  return (
    <div>
      <div className="flex gap-3 mb-4">
        <select
          className={`border p-2 rounded-xl w-full text-sm outline-none transition-all ${
            dark
              ? "bg-gray-800 border-gray-700 text-gray-100 focus:border-indigo-500"
              : "bg-white border-gray-200 text-gray-800 focus:border-indigo-500"
          }`}
          value={selectedCareer}
          onChange={(e) => { setSelectedCareer(e.target.value); setGap(null); }}
        >
          <option value="">Select a career goal...</option>
          {Object.keys(CAREER_SKILLS).map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <button
          onClick={analyze}
          className="text-white px-4 py-2 rounded-xl whitespace-nowrap text-sm font-semibold hover:scale-105 transition-all"
          style={{ background: "linear-gradient(135deg, #6366f1, #ff5a3c)" }}
        >
          Analyze
        </button>
      </div>

      {gap && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className={`h-2 rounded-full flex-1 ${dark ? "bg-gray-700" : "bg-gray-200"}`}>
              <div
                className="h-2 rounded-full bg-green-500"
                style={{ width: `${(gap.present.length / gap.total) * 100}%` }}
              />
            </div>
            <span className={`text-sm ${dark ? "text-gray-400" : "text-gray-600"}`}>{gap.present.length}/{gap.total} skills</span>
          </div>

          {gap.present.length > 0 && (
            <div>
              <p className="text-sm font-medium text-green-500 mb-2">✅ Skills you have</p>
              <div className="flex flex-wrap gap-2">
                {gap.present.map((s) => (
                  <span key={s} className={`px-3 py-1 rounded-full text-sm ${dark ? "bg-green-900/50 text-green-300 border border-green-800" : "bg-green-100 text-green-700"}`}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {gap.missing.length > 0 && (
            <div>
              <p className="text-sm font-medium text-red-500 mb-2">❌ Missing skills</p>
              <div className="flex flex-wrap gap-2">
                {gap.missing.map((s) => (
                  <span key={s} className={`px-3 py-1 rounded-full text-sm ${dark ? "bg-red-900/50 text-red-300 border border-red-800" : "bg-red-100 text-red-600"}`}>{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
