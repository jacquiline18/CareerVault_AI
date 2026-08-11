import os
import re
import json
import base64
import requests
from io import BytesIO
from dotenv import load_dotenv
load_dotenv()
from groq import Groq
from fastapi import HTTPException
from log_util import log

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Point pytesseract to the installed binary
import pytesseract
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

from PIL import Image

# Hardcoded skill detection — if any of these appear in the text, they ARE skills
KNOWN_SKILLS = {
    "python": "Python", "java": "Java", "javascript": "JavaScript", "typescript": "TypeScript",
    "c++": "C++", "c#": "C#", "golang": "Go", "rust": "Rust",
    "kotlin": "Kotlin", "swift": "Swift", "php": "PHP", "ruby": "Ruby", "scala": "Scala",
    "lua": "Lua", "haskell": "Haskell", "elixir": "Elixir", "objective-c": "Objective-C",
    "matlab": "MATLAB", "perl": "Perl", "dart": "Dart", "bash": "Bash", "shell": "Shell",
    "html": "HTML", "css": "CSS", "sql": "SQL", "mysql": "MySQL", "postgresql": "PostgreSQL",
    "sqlite": "SQLite", "mongodb": "MongoDB", "redis": "Redis", "firebase": "Firebase",
    "supabase": "Supabase", "oracle": "Oracle", "cassandra": "Cassandra", "dynamodb": "DynamoDB",
    "react": "React", "angular": "Angular", "vue": "Vue.js", "next.js": "Next.js",
    "svelte": "Svelte", "jquery": "jQuery", "bootstrap": "Bootstrap", "tailwind": "Tailwind CSS",
    "node.js": "Node.js", "express": "Express.js", "django": "Django", "flask": "Flask",
    "fastapi": "FastAPI", "spring": "Spring", "laravel": "Laravel", "graphql": "GraphQL",
    "tensorflow": "TensorFlow", "pytorch": "PyTorch", "keras": "Keras",
    "scikit-learn": "Scikit-learn", "pandas": "Pandas", "numpy": "NumPy",
    "matplotlib": "Matplotlib", "opencv": "OpenCV",
    "machine learning": "Machine Learning", "deep learning": "Deep Learning",
    "data science": "Data Science", "nlp": "NLP", "computer vision": "Computer Vision",
    "aws": "AWS", "azure": "Azure", "gcp": "GCP", "google cloud": "Google Cloud",
    "docker": "Docker", "kubernetes": "Kubernetes", "git": "Git", "github": "GitHub",
    "gitlab": "GitLab", "linux": "Linux", "ubuntu": "Ubuntu", "ci/cd": "CI/CD",
    "jenkins": "Jenkins", "terraform": "Terraform",
    "figma": "Figma", "postman": "Postman", "jira": "Jira", "excel": "Excel",
    "power bi": "Power BI", "tableau": "Tableau", "hadoop": "Hadoop", "spark": "Apache Spark",
    # Domain-specific tools & platforms
    "guidewire": "Guidewire", "salesforce": "Salesforce", "sap": "SAP", "servicenow": "ServiceNow",
    "workday": "Workday", "peoplesoft": "PeopleSoft", "sharepoint": "SharePoint",
    "ms office": "MS Office", "microsoft office": "Microsoft Office",
    "word": "Microsoft Word", "powerpoint": "PowerPoint", "access": "MS Access",
    "autocad": "AutoCAD", "solidworks": "SolidWorks", "matlab": "MATLAB",
    "photoshop": "Photoshop", "illustrator": "Illustrator", "canva": "Canva",
    "slack": "Slack", "trello": "Trello", "notion": "Notion", "confluence": "Confluence",
    # Healthcare / PT / Medical
    "npte": "NPTE", "nclex": "NCLEX", "cpt": "CPT Coding", "icd": "ICD Coding",
    "epic": "Epic EMR", "meditech": "Meditech", "cerner": "Cerner",
    "physical therapy": "Physical Therapy", "occupational therapy": "Occupational Therapy",
    # Finance / Insurance
    "quickbooks": "QuickBooks", "tally": "Tally", "xero": "Xero",
    "bloomberg": "Bloomberg", "finra": "FINRA",
}

SOLOLEARN_COURSES = {
    "python": "Python", "sql": "SQL", "javascript": "JavaScript", "java": "Java",
    "c++": "C++", "html": "HTML", "css": "CSS", "php": "PHP",
    "swift": "Swift", "kotlin": "Kotlin", "ruby": "Ruby",
    "data science": "Data Science", "machine learning": "Machine Learning",
    "web development": "Web Development", "react": "React", "angular": "Angular",
    "node.js": "Node.js", "typescript": "TypeScript", "golang": "Go",
}


def force_extract_skills(text: str, existing_skills: list) -> list:
    text_lower = text.lower()
    existing_lower = {s.lower() for s in existing_skills}
    result = list(existing_skills)
    for keyword, display_name in KNOWN_SKILLS.items():
        escaped = re.escape(keyword)
        # Use word boundary only on sides that are purely word characters
        left  = r'\b' if keyword[0].isalnum()  else r'(?<![\w])'
        right = r'\b' if keyword[-1].isalnum() else r'(?![\w])'
        pattern = left + escaped + right
        if re.search(pattern, text_lower) and display_name.lower() not in existing_lower:
            result.append(display_name)
            existing_lower.add(display_name.lower())
    return result


def force_extract_sololearn_certs(text: str, existing_certs: list) -> list:
    text_lower = text.lower()
    existing_names = {c.get("certificate_name", "").lower() for c in existing_certs}
    result = list(existing_certs)

    if "sololearn" in text_lower:
        for course_key, course_name in SOLOLEARN_COURSES.items():
            escaped = re.escape(course_key)
            left  = r'\b' if course_key[0].isalnum()  else r'(?<![\w])'
            right = r'\b' if course_key[-1].isalnum() else r'(?![\w])'
            pattern = left + escaped + right
            if re.search(pattern, text_lower) and course_name.lower() not in existing_names:
                result.append({"certificate_name": course_name, "issuer": "SoloLearn", "issue_date": None})
                existing_names.add(course_name.lower())

    cert_patterns = [
        r"certificate of completion[^\n]{0,80}?([A-Za-z0-9+#.\s]{2,40})",
        r"certified in[^\n]{0,40}?([A-Za-z0-9+#.\s]{2,40})",
        r"has successfully completed[^\n]{0,80}?([A-Za-z0-9+#.\s]{2,40})",
    ]
    for pattern in cert_patterns:
        for match in re.finditer(pattern, text_lower, re.IGNORECASE):
            name = match.group(1).strip(" .,-")
            if len(name) >= 2 and name.lower() not in existing_names:
                result.append({"certificate_name": name.title(), "issuer": "Unknown", "issue_date": None})
                existing_names.add(name.lower())

    return result


def enrich_result(result: dict, raw_text: str) -> dict:
    result["skills"] = force_extract_skills(raw_text, result.get("skills", []))
    result["certificates"] = force_extract_sololearn_certs(raw_text, result.get("certificates", []))
    for cert in result["certificates"]:
        name = cert.get("certificate_name", "")
        skill_name = SOLOLEARN_COURSES.get(name.lower(), name)
        if skill_name.lower() in KNOWN_SKILLS:
            skill_name = KNOWN_SKILLS[skill_name.lower()]
        if skill_name and skill_name not in result["skills"]:
            result["skills"].append(skill_name)
    return result


PROMPT_TEMPLATE = """You are a career document data extractor. Extract ALL structured information from the document below.

RULES:
- skills: EVERY skill mentioned, especially ALL programming languages (Python, Java, C, C++, JavaScript, TypeScript, Go, Rust, etc.), frameworks, tools, databases, cloud platforms, and soft skills. If a certificate is for a programming language or tech course, also add that language/topic as a skill.
- certificates: every certificate, course completion, badge, or credential with exact name, issuer, and date
- projects: every project with name and description
- internships: company, role, duration
- achievements: awards, rankings, honors
- career_paths: 3-5 realistic suggested roles based on the document content

Return ONLY valid JSON, no markdown:
{
  "document_type": "Resume | Certificate | Internship Letter | Project Report | Achievement Certificate | Marksheet | Unknown",
  "skills": ["Python", "SQL"],
  "projects": [{"project_name": "name", "description": "description"}],
  "certificates": [{"certificate_name": "name", "issuer": "issuer", "issue_date": "date or null"}],
  "internships": [{"company_name": "company", "role": "role", "duration": "duration"}],
  "achievements": [{"title": "title", "description": "description"}],
  "career_paths": [{"career_role": "role", "confidence_score": 0.9}]
}"""


def parse_response(raw: str) -> dict:
    raw = raw.strip()
    if "```" in raw:
        parts = raw.split("```")
        for part in parts:
            part = part.strip()
            if part.startswith("json"):
                part = part[4:].strip()
            if part.startswith("{"):
                raw = part
                break
    try:
        return json.loads(raw.strip())
    except json.JSONDecodeError:
        start = raw.find("{")
        end = raw.rfind("}") + 1
        if start != -1 and end > start:
            return json.loads(raw[start:end])
        raise


def analyze_document(text: str) -> dict:
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": PROMPT_TEMPLATE + f"\n\nDocument Text:\n{text[:12000]}"}],
        temperature=0.1,
        max_tokens=4096,
    )
    result = parse_response(response.choices[0].message.content)
    result = enrich_result(result, text)
    log(f"[AI] Final: {len(result.get('skills', []))} skills, {len(result.get('certificates', []))} certs, {len(result.get('projects', []))} projects")
    return result


def ocr_image_tesseract(image_bytes: bytes) -> str:
    """Use Tesseract to extract text from image bytes."""
    try:
        img = Image.open(BytesIO(image_bytes))
        # Upscale small images for better OCR accuracy
        w, h = img.size
        if w < 1000:
            scale = 1000 / w
            img = img.resize((int(w * scale), int(h * scale)), Image.LANCZOS)
        text = pytesseract.image_to_string(img, config="--psm 3")
        log(f"[OCR] Tesseract: {len(text)} chars")
        return text.strip()
    except Exception as e:
        log(f"[ERR] Tesseract OCR failed: {e}")
        return ""


def analyze_document_vision(file_url: str) -> dict:
    log("[OCR] Starting image processing with Tesseract")
    try:
        image_bytes = requests.get(file_url, timeout=30).content
        ocr_text = ocr_image_tesseract(image_bytes)

        if ocr_text and len(ocr_text) > 30:
            log(f"[OCR] Got {len(ocr_text)} chars, running AI extraction")
            result = analyze_document(ocr_text)
        else:
            log("[WARN] OCR got little text, returning enriched empty result")
            result = {
                "document_type": "Unknown",
                "skills": [], "projects": [], "certificates": [],
                "internships": [], "achievements": [], "career_paths": []
            }
            result = enrich_result(result, ocr_text or "")

        log(f"[AI] Final: {len(result.get('skills', []))} skills, {len(result.get('certificates', []))} certs")
        return result
    except Exception as e:
        log(f"[ERR] Image processing failed: {e}")
        raise HTTPException(status_code=422, detail=f"Could not process image: {e}")


def generate_knowledge_graph(result: dict) -> list:
    prompt = f"""Generate career knowledge graph relationships from this data.
Return ONLY a JSON array:
[
  {{"source_type": "skill", "source_name": "Python", "relationship_type": "USED_IN", "target_type": "project", "target_name": "ProjectName", "confidence_score": 0.9}}
]
Relationship types: USED_IN, LEARNED_FROM, DEMONSTRATED_BY, SUPPORTS, REQUIRES, LEADS_TO, ACHIEVED_IN

Data:
{json.dumps(result, indent=2)}

Return only the JSON array, nothing else."""
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
        max_tokens=2048,
    )
    raw = response.choices[0].message.content.strip()
    if "```" in raw:
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    start = raw.find("[")
    end = raw.rfind("]") + 1
    if start != -1 and end > start:
        return json.loads(raw[start:end])
    return []
