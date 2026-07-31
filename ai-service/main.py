import os
import traceback
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client
from extractor import extract_text
from ai import analyze_document, analyze_document_vision, generate_knowledge_graph
from embeddings import store_chunks, search_chunks
from groq import Groq
from phase6 import (
    chat_with_profile, generate_resume_content, generate_career_report,
    generate_interview_questions, generate_roadmap, analyze_resume_gap,
    generate_portfolio_html
)

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

supabase_client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)

class ProcessRequest(BaseModel):
    document_id: int
    user_id: str
    file_url: str
    file_type: str

class QueryRequest(BaseModel):
    user_id: str
    query: str

class ChatRequest(BaseModel):
    user_id: str
    message: str
    history: list = []
    profile: dict = {}

class ResumeRequest(BaseModel):
    user_id: str
    template: str = "modern"
    profile: dict = {}

class CareerReportRequest(BaseModel):
    user_id: str
    profile: dict = {}

class InterviewRequest(BaseModel):
    user_id: str
    topic: str
    question_type: str = "technical"
    profile: dict = {}

class RoadmapRequest(BaseModel):
    user_id: str
    target_role: str
    profile: dict = {}

class GapAnalysisRequest(BaseModel):
    user_id: str
    target_role: str
    profile: dict = {}

class PortfolioRequest(BaseModel):
    user_id: str
    profile: dict = {}
    settings: dict = {}

def safe_insert(table: str, rows: list):
    if not rows:
        return
    try:
        res = supabase_client.table(table).insert(rows).execute()
        print(f"✅ Inserted {len(rows)} rows into {table}")
        return res
    except Exception as e:
        print(f"❌ Failed to insert into {table}: {e}")
        traceback.print_exc()

def get_existing(table: str, user_id: str, column: str):
    try:
        res = supabase_client.table(table).select(column).eq("user_id", user_id).execute()
        return {row[column].lower() for row in res.data} if res.data else set()
    except:
        return set()

@app.post("/process")
async def process_document(req: ProcessRequest):
    try:
        print(f"📄 Processing document {req.document_id} for user {req.user_id}")

        text = extract_text(req.file_url, req.file_type)
        print(f"📝 Extracted {len(text)} characters")

        is_image = req.file_type.startswith("image/") or any(t in req.file_type for t in ["png", "jpeg", "webp"])
        is_scanned_pdf = "pdf" in req.file_type and not text.strip()

        if is_image or is_scanned_pdf:
            result = analyze_document_vision(req.file_url)
        else:
            result = analyze_document(text)
        print(f"🤖 AI Result: {result}")

        uid = req.user_id

        # Skills - deduplicate
        if result.get("skills"):
            existing_skills = get_existing("skills", uid, "skill_name")
            new_skills = [
                {"user_id": uid, "skill_name": s}
                for s in result["skills"]
                if s.lower() not in existing_skills
            ]
            safe_insert("skills", new_skills)

        # Projects - deduplicate
        if result.get("projects"):
            existing_projects = get_existing("projects", uid, "project_name")
            new_projects = [
                {"user_id": uid, "project_name": p["project_name"], "description": p.get("description", "")}
                for p in result["projects"]
                if p.get("project_name", "").lower() not in existing_projects
            ]
            safe_insert("projects", new_projects)

        # Certificates - deduplicate
        if result.get("certificates"):
            existing_certs = get_existing("certificates", uid, "certificate_name")
            new_certs = [
                {
                    "user_id": uid,
                    "certificate_name": c["certificate_name"],
                    "issuer": c.get("issuer", ""),
                    "issue_date": c.get("issue_date", "")
                }
                for c in result["certificates"]
                if c.get("certificate_name", "").lower() not in existing_certs
            ]
            safe_insert("certificates", new_certs)

        # Internships - deduplicate
        if result.get("internships"):
            existing_internships = get_existing("internships", uid, "company_name")
            new_internships = [
                {
                    "user_id": uid,
                    "company_name": i["company_name"],
                    "role": i.get("role", ""),
                    "duration": i.get("duration", "")
                }
                for i in result["internships"]
                if i.get("company_name", "").lower() not in existing_internships
            ]
            safe_insert("internships", new_internships)

        # Achievements - deduplicate
        if result.get("achievements"):
            existing_achievements = get_existing("achievements", uid, "title")
            new_achievements = [
                {"user_id": uid, "title": a["title"], "description": a.get("description", "")}
                for a in result["achievements"]
                if a.get("title", "").lower() not in existing_achievements
            ]
            safe_insert("achievements", new_achievements)

        # Career insights - deduplicate
        if result.get("career_paths"):
            existing_insights = get_existing("career_insights", uid, "career_role")
            new_insights = [
                {"user_id": uid, "career_role": c["career_role"], "confidence_score": c.get("confidence_score", 0.0)}
                for c in result["career_paths"]
                if c.get("career_role", "").lower() not in existing_insights
            ]
            safe_insert("career_insights", new_insights)

        # Update document type
        supabase_client.table("documents").update(
            {"document_type": result.get("document_type", "Unknown")}
        ).eq("id", req.document_id).execute()

        # Store embeddings for RAG (non-blocking)
        try:
            embed_text = text if text.strip() else str(result)
            store_chunks(supabase_client, uid, req.document_id, embed_text)
        except Exception as e:
            print(f"⚠️ Embedding storage failed: {e}")

        # Return immediately - knowledge graph runs in background
        import threading
        def build_graph():
            try:
                relationships = generate_knowledge_graph(result)
                if relationships:
                    graph_rows = [
                        {
                            "user_id": uid,
                            "source_type": r.get("source_type"),
                            "source_name": r.get("source_name"),
                            "relationship_type": r.get("relationship_type"),
                            "target_type": r.get("target_type"),
                            "target_name": r.get("target_name"),
                            "confidence_score": r.get("confidence_score", 0.9)
                        }
                        for r in relationships
                    ]
                    safe_insert("knowledge_graph", graph_rows)
                    print(f"🕸️ Knowledge graph: {len(graph_rows)} relationships stored")
            except Exception as e:
                print(f"⚠️ Knowledge graph generation failed: {e}")
        threading.Thread(target=build_graph, daemon=True).start()

        return {"status": "success", "result": result}

    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/query")
async def query_documents(req: QueryRequest):
    try:
        # 1. Search vector DB for relevant chunks
        chunks = search_chunks(supabase_client, req.user_id, req.query, top_k=5)

        if not chunks:
            # Fallback: use structured data from DB tables
            skills = supabase_client.table("skills").select("skill_name").eq("user_id", req.user_id).execute()
            certs = supabase_client.table("certificates").select("certificate_name,issuer").eq("user_id", req.user_id).execute()
            careers = supabase_client.table("career_insights").select("career_role").eq("user_id", req.user_id).execute()
            context = f"Skills: {[s['skill_name'] for s in (skills.data or [])]}\n"
            context += f"Certificates: {[c['certificate_name'] for c in (certs.data or [])]}\n"
            context += f"Career paths: {[c['career_role'] for c in (careers.data or [])]}"
        else:
            context = "\n\n---\n\n".join(c["chunk_text"] for c in chunks)

        # 2. Generate answer with Groq
        prompt = f"""You are a career advisor AI. Answer the user's question using ONLY the context from their career documents below.
Be specific, helpful, and concise. If the answer isn't in the context, say so honestly.

Context from user's documents:
{context}

User question: {req.query}

Answer:"""

        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=1024
        )

        answer = response.choices[0].message.content.strip()
        return {
            "answer": answer,
            "sources_used": len(chunks),
            "context_preview": context[:300] + "..." if len(context) > 300 else context
        }

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/chat")
async def chat(req: ChatRequest):
    try:
        answer = chat_with_profile(req.profile, req.history, req.message)
        try:
            supabase_client.table("chat_history").insert([
                {"user_id": req.user_id, "role": "user",      "message": req.message},
                {"user_id": req.user_id, "role": "assistant", "message": answer},
            ]).execute()
        except Exception as db_err:
            print(f"⚠️ chat_history save failed (non-fatal): {db_err}")
        return {"answer": answer}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/resume")
async def resume(req: ResumeRequest):
    try:
        content = generate_resume_content(req.profile, req.template)
        try:
            row = supabase_client.table("resumes").insert({
                "user_id": req.user_id,
                "template": req.template,
                "content": content
            }).execute()
            resume_id = row.data[0]["id"] if row.data else None
        except Exception as db_err:
            print(f"⚠️ resumes save failed (non-fatal): {db_err}")
            resume_id = None
        return {"resume_id": resume_id, "content": content, "template": req.template}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/career-report")
async def career_report(req: CareerReportRequest):
    try:
        report = generate_career_report(req.profile)
        try:
            supabase_client.table("career_reports").insert({
                "user_id": req.user_id,
                "readiness_score": report.get("readiness_score", 0),
                "strengths":           report.get("strengths", []),
                "weaknesses":          report.get("weaknesses", []),
                "missing_skills":      report.get("missing_skills", []),
                "recommended_certs":   report.get("recommended_certs", []),
                "career_paths":        report.get("career_paths", []),
                "growth_roadmap":      report.get("growth_roadmap", []),
            }).execute()
        except Exception as db_err:
            print(f"⚠️ career_reports save failed (non-fatal): {db_err}")
        return report
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/interview")
async def interview(req: InterviewRequest):
    try:
        questions = generate_interview_questions(req.profile, req.topic, req.question_type)
        try:
            supabase_client.table("interview_sessions").insert({
                "user_id": req.user_id,
                "topic": req.topic,
                "question_type": req.question_type,
                "questions": questions
            }).execute()
        except Exception as db_err:
            print(f"⚠️ interview_sessions save failed (non-fatal): {db_err}")
        return {"questions": questions, "topic": req.topic, "type": req.question_type}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/roadmap")
async def roadmap(req: RoadmapRequest):
    try:
        result = generate_roadmap(req.profile, req.target_role)
        try:
            supabase_client.table("roadmaps").insert({
                "user_id": req.user_id,
                "target_role": req.target_role,
                "current_skills": result.get("skills_you_have", []),
                "weeks": result.get("weeks", [])
            }).execute()
        except Exception as db_err:
            print(f"⚠️ roadmaps save failed (non-fatal): {db_err}")
        return result
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/gap-analysis")
async def gap_analysis(req: GapAnalysisRequest):
    try:
        result = analyze_resume_gap(req.profile, req.target_role)
        return result
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/portfolio")
async def portfolio(req: PortfolioRequest):
    try:
        html = generate_portfolio_html(req.profile, req.settings)
        try:
            supabase_client.table("portfolio_settings").upsert({
                "user_id": req.user_id,
                "theme": req.settings.get("theme", "indigo"),
                "github_url": req.settings.get("github_url", ""),
                "linkedin_url": req.settings.get("linkedin_url", ""),
                "contact_email": req.settings.get("contact_email", ""),
                "bio": req.settings.get("bio", ""),
            }, on_conflict="user_id").execute()
        except Exception as db_err:
            print(f"⚠️ portfolio_settings save failed (non-fatal): {db_err}")
        return {"html": html}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
def health():
    return {"status": "ok"}
