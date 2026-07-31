import json
import os
from dotenv import load_dotenv
load_dotenv()
from groq import Groq

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL = "llama-3.3-70b-versatile"


def _call(prompt: str, temperature: float = 0.3, max_tokens: int = 2048) -> str:
    res = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=temperature,
        max_tokens=max_tokens,
    )
    return res.choices[0].message.content.strip()


def _json(prompt: str, temperature: float = 0.2) -> dict | list:
    raw = _call(prompt, temperature=temperature, max_tokens=4096)
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    return json.loads(raw.strip())


def build_profile_context(profile: dict) -> str:
    return f"""
USER PROFILE:
Name: {profile.get('full_name', 'Unknown')}
Skills: {', '.join(profile.get('skills', []))}
Projects: {json.dumps(profile.get('projects', []))}
Certificates: {json.dumps(profile.get('certificates', []))}
Internships: {json.dumps(profile.get('internships', []))}
Achievements: {json.dumps(profile.get('achievements', []))}
Career Paths: {', '.join(profile.get('career_paths', []))}
""".strip()


# ── CHAT ──────────────────────────────────────────────────────────────────────

def chat_with_profile(profile: dict, history: list, user_message: str) -> str:
    ctx = build_profile_context(profile)
    history_text = "\n".join(
        f"{'User' if m['role'] == 'user' else 'Assistant'}: {m['message']}"
        for m in history[-10:]
    )
    prompt = f"""You are CareerVault AI — an intelligent career mentor and advisor.
You have full access to the user's career profile below. Answer every question with specific, 
personalized, and actionable advice based on their actual data.

{ctx}

Conversation so far:
{history_text}

User: {user_message}

Respond helpfully, specifically referencing their actual skills/projects/certificates where relevant.
If asked to generate interview questions, resume tips, or learning paths — do it based on their profile.
Assistant:"""
    return _call(prompt, temperature=0.4, max_tokens=1024)


# ── RESUME ────────────────────────────────────────────────────────────────────

def generate_resume_content(profile: dict, template: str) -> dict:
    ctx = build_profile_context(profile)
    prompt = f"""You are a professional resume writer. Generate a complete, ATS-optimized resume for this person.
Template style: {template}

{ctx}

Return ONLY a valid JSON object:
{{
  "summary": "2-3 sentence professional summary",
  "skills_grouped": {{
    "Programming Languages": ["Python", "JavaScript"],
    "Frameworks": ["React", "FastAPI"],
    "Tools": ["Git", "Docker"]
  }},
  "projects": [
    {{"name": "...", "description": "...", "tech": ["..."], "highlights": ["..."]}}
  ],
  "certificates": [
    {{"name": "...", "issuer": "...", "date": "..."}}
  ],
  "internships": [
    {{"company": "...", "role": "...", "duration": "...", "highlights": ["..."]}}
  ],
  "achievements": ["..."],
  "suggested_roles": ["..."]
}}"""
    return _json(prompt)


# ── CAREER REPORT ─────────────────────────────────────────────────────────────

def generate_career_report(profile: dict) -> dict:
    ctx = build_profile_context(profile)
    prompt = f"""You are a career analyst AI. Analyze this user's career profile and generate a comprehensive report.

{ctx}

Return ONLY a valid JSON object:
{{
  "readiness_score": 78,
  "readiness_label": "Job Ready",
  "strengths": ["Strong Python skills", "Multiple projects"],
  "weaknesses": ["No cloud experience", "Limited soft skills mentioned"],
  "missing_skills": ["Docker", "AWS", "System Design", "CI/CD"],
  "recommended_certs": [
    {{"name": "AWS Cloud Practitioner", "platform": "AWS", "priority": "High"}},
    {{"name": "Google Data Analytics", "platform": "Coursera", "priority": "Medium"}}
  ],
  "career_paths": [
    {{"role": "Full Stack Developer", "match_score": 88, "reason": "Strong React + Node skills"}},
    {{"role": "Data Analyst", "match_score": 72, "reason": "Python + SQL background"}}
  ],
  "salary_insights": {{
    "entry_level": "$55,000 - $75,000",
    "mid_level": "$75,000 - $110,000",
    "senior_level": "$110,000 - $150,000"
  }},
  "growth_roadmap": [
    {{"phase": "Month 1-2", "focus": "Learn Docker & containerization", "resources": ["Docker docs", "FreeCodeCamp"]}},
    {{"phase": "Month 3-4", "focus": "AWS fundamentals", "resources": ["AWS Free Tier", "A Cloud Guru"]}}
  ]
}}"""
    return _json(prompt)


# ── INTERVIEW PREP ────────────────────────────────────────────────────────────

def generate_interview_questions(profile: dict, topic: str, q_type: str) -> list:
    ctx = build_profile_context(profile)
    prompt = f"""You are an expert technical interviewer. Generate 10 interview questions for this candidate.

{ctx}

Topic: {topic}
Question Type: {q_type} (technical/hr/behavioral/coding)

Return ONLY a valid JSON array:
[
  {{
    "question": "Explain how you used Python in your projects.",
    "type": "{q_type}",
    "difficulty": "Medium",
    "hint": "Focus on specific use cases",
    "sample_answer": "In my project X, I used Python to..."
  }}
]"""
    return _json(prompt)


# ── ROADMAP ───────────────────────────────────────────────────────────────────

def generate_roadmap(profile: dict, target_role: str) -> dict:
    ctx = build_profile_context(profile)
    prompt = f"""You are a career roadmap generator. Create a personalized 8-week learning roadmap.

{ctx}

Target Role: {target_role}

Return ONLY a valid JSON object:
{{
  "target_role": "{target_role}",
  "current_match_score": 65,
  "skills_you_have": ["Python", "React"],
  "skills_to_learn": ["Docker", "AWS", "Redis"],
  "weeks": [
    {{
      "week": 1,
      "theme": "Docker Fundamentals",
      "tasks": ["Install Docker", "Build first container", "Docker Compose basics"],
      "resources": ["Docker official docs", "TechWorld with Nana YouTube"],
      "goal": "Deploy a containerized app"
    }}
  ]
}}"""
    return _json(prompt)


# ── GAP ANALYSIS ──────────────────────────────────────────────────────────────

def analyze_resume_gap(profile: dict, target_role: str) -> dict:
    ctx = build_profile_context(profile)
    prompt = f"""You are a resume gap analyzer. Compare this user's profile against the target role requirements.

{ctx}

Target Role: {target_role}

Return ONLY a valid JSON object:
{{
  "target_role": "{target_role}",
  "overall_match": 68,
  "missing_skills": ["Kubernetes", "CI/CD", "System Design"],
  "missing_projects": ["Microservices project", "Cloud deployment project"],
  "missing_certifications": ["AWS Certified Developer", "Kubernetes Administrator"],
  "weak_areas": ["No production experience mentioned", "Limited team collaboration evidence"],
  "strong_areas": ["Good Python foundation", "Frontend skills present"],
  "recommended_actions": [
    {{"priority": "High", "action": "Build a Docker + Kubernetes project", "timeline": "2 weeks"}},
    {{"priority": "Medium", "action": "Get AWS Cloud Practitioner cert", "timeline": "1 month"}}
  ]
}}"""
    return _json(prompt)


# ── PORTFOLIO HTML ────────────────────────────────────────────────────────────

def generate_portfolio_html(profile: dict, settings: dict) -> str:
    theme_colors = {
        "indigo": {"primary": "#6366f1", "secondary": "#4338ca", "accent": "#ff5a3c"},
        "ocean":  {"primary": "#0ea5e9", "secondary": "#0284c7", "accent": "#f59e0b"},
        "forest": {"primary": "#10b981", "secondary": "#059669", "accent": "#f97316"},
        "rose":   {"primary": "#f43f5e", "secondary": "#e11d48", "accent": "#8b5cf6"},
    }
    t = theme_colors.get(settings.get("theme", "indigo"), theme_colors["indigo"])
    p = profile

    skills_html = "".join(
        f'<span class="skill-tag">{s}</span>' for s in p.get("skills", [])
    )
    projects_html = "".join(f"""
        <div class="project-card">
          <h3>{proj.get('project_name','')}</h3>
          <p>{proj.get('description','')}</p>
        </div>""" for proj in p.get("projects", [])
    )
    certs_html = "".join(f"""
        <div class="cert-card">
          <span class="cert-icon">🏅</span>
          <div><strong>{c.get('certificate_name','')}</strong><br>
          <small>{c.get('issuer','')}{' • ' + c.get('issue_date','') if c.get('issue_date') else ''}</small></div>
        </div>""" for c in p.get("certificates", [])
    )
    internships_html = "".join(f"""
        <div class="intern-card">
          <h3>{i.get('role','')} @ {i.get('company_name','')}</h3>
          <p>{i.get('duration','')}</p>
        </div>""" for i in p.get("internships", [])
    )

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{p.get('full_name','Portfolio')} — Portfolio</title>
<style>
  :root {{
    --primary: {t['primary']};
    --secondary: {t['secondary']};
    --accent: {t['accent']};
  }}
  * {{ margin:0; padding:0; box-sizing:border-box; }}
  body {{ font-family:'Segoe UI',system-ui,sans-serif; background:#0f172a; color:#e2e8f0; }}
  a {{ color:var(--primary); text-decoration:none; }}
  .hero {{ min-height:100vh; display:flex; align-items:center; justify-content:center; text-align:center;
           background:linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%); padding:2rem; }}
  .hero h1 {{ font-size:3.5rem; font-weight:800; background:linear-gradient(135deg,var(--primary),var(--accent));
              -webkit-background-clip:text; -webkit-text-fill-color:transparent; margin-bottom:1rem; }}
  .hero p {{ font-size:1.2rem; color:#94a3b8; max-width:600px; margin:0 auto 2rem; }}
  .hero-btns {{ display:flex; gap:1rem; justify-content:center; flex-wrap:wrap; }}
  .btn {{ padding:.75rem 2rem; border-radius:12px; font-weight:600; font-size:.95rem; cursor:pointer; transition:all .3s; }}
  .btn-primary {{ background:linear-gradient(135deg,var(--primary),var(--accent)); color:#fff; border:none; }}
  .btn-outline {{ background:transparent; color:var(--primary); border:2px solid var(--primary); }}
  .btn:hover {{ transform:translateY(-2px); box-shadow:0 8px 25px rgba(0,0,0,.3); }}
  section {{ padding:5rem 2rem; max-width:1100px; margin:0 auto; }}
  h2.section-title {{ font-size:2rem; font-weight:700; color:#f1f5f9; margin-bottom:2.5rem;
                      border-left:4px solid var(--primary); padding-left:1rem; }}
  .skills-grid {{ display:flex; flex-wrap:wrap; gap:.75rem; }}
  .skill-tag {{ background:rgba(99,102,241,.15); border:1px solid rgba(99,102,241,.3);
                color:var(--primary); padding:.4rem 1rem; border-radius:999px; font-size:.875rem; font-weight:500; }}
  .cards-grid {{ display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:1.5rem; }}
  .project-card,.cert-card,.intern-card {{ background:#1e293b; border:1px solid #334155;
    border-radius:16px; padding:1.5rem; transition:all .3s; }}
  .project-card:hover,.cert-card:hover,.intern-card:hover {{ border-color:var(--primary); transform:translateY(-4px); }}
  .project-card h3,.intern-card h3 {{ color:#f1f5f9; font-size:1.1rem; margin-bottom:.5rem; }}
  .project-card p,.intern-card p {{ color:#94a3b8; font-size:.875rem; line-height:1.6; }}
  .cert-card {{ display:flex; align-items:center; gap:1rem; }}
  .cert-icon {{ font-size:2rem; }}
  .cert-card strong {{ color:#f1f5f9; }}
  .cert-card small {{ color:#94a3b8; }}
  .contact-links {{ display:flex; gap:1rem; flex-wrap:wrap; }}
  .contact-link {{ background:#1e293b; border:1px solid #334155; color:#e2e8f0;
    padding:.75rem 1.5rem; border-radius:12px; font-weight:500; transition:all .3s; }}
  .contact-link:hover {{ border-color:var(--primary); color:var(--primary); }}
  footer {{ text-align:center; padding:2rem; color:#475569; border-top:1px solid #1e293b; }}
  @media(max-width:768px) {{ .hero h1 {{ font-size:2.5rem; }} }}
</style>
</head>
<body>

<div class="hero">
  <div>
    <p style="color:var(--accent);font-weight:600;margin-bottom:.5rem;letter-spacing:.1em">PORTFOLIO</p>
    <h1>{p.get('full_name','Your Name')}</h1>
    <p>{settings.get('bio') or 'Passionate developer building impactful solutions with modern technologies.'}</p>
    <div class="hero-btns">
      {'<a href="' + settings.get('github_url','#') + '" class="btn btn-primary">GitHub</a>' if settings.get('github_url') else ''}
      {'<a href="' + settings.get('linkedin_url','#') + '" class="btn btn-outline">LinkedIn</a>' if settings.get('linkedin_url') else ''}
    </div>
  </div>
</div>

{'<section><h2 class="section-title">🛠 Skills</h2><div class="skills-grid">' + skills_html + '</div></section>' if p.get('skills') else ''}

{'<section><h2 class="section-title">🚀 Projects</h2><div class="cards-grid">' + projects_html + '</div></section>' if p.get('projects') else ''}

{'<section><h2 class="section-title">🎓 Certificates</h2><div class="cards-grid">' + certs_html + '</div></section>' if p.get('certificates') else ''}

{'<section><h2 class="section-title">💼 Internships</h2><div class="cards-grid">' + internships_html + '</div></section>' if p.get('internships') else ''}

<section>
  <h2 class="section-title">📬 Contact</h2>
  <div class="contact-links">
    {'<a href="mailto:' + settings.get('contact_email','') + '" class="contact-link">✉️ ' + settings.get('contact_email','') + '</a>' if settings.get('contact_email') else ''}
    {'<a href="' + settings.get('github_url','') + '" class="contact-link">🐙 GitHub</a>' if settings.get('github_url') else ''}
    {'<a href="' + settings.get('linkedin_url','') + '" class="contact-link">💼 LinkedIn</a>' if settings.get('linkedin_url') else ''}
  </div>
</section>

<footer>Built with CareerVault AI ⚡</footer>
</body>
</html>"""
