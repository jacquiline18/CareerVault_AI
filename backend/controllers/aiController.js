const axios = require("axios");
const { supabaseAdmin } = require("../supabaseClient");

const AI = "http://127.0.0.1:8000";

// Fetch full user profile from all tables - always uses authenticated user ID
async function getUserProfile(user_id) {
  const [skills, projects, certs, internships, achievements, careers, profile] = await Promise.all([
    supabaseAdmin.from("skills").select("skill_name").eq("user_id", user_id),
    supabaseAdmin.from("projects").select("project_name,description").eq("user_id", user_id),
    supabaseAdmin.from("certificates").select("certificate_name,issuer,issue_date").eq("user_id", user_id),
    supabaseAdmin.from("internships").select("company_name,role,duration").eq("user_id", user_id),
    supabaseAdmin.from("achievements").select("title,description").eq("user_id", user_id),
    supabaseAdmin.from("career_insights").select("career_role").eq("user_id", user_id),
    supabaseAdmin.from("profiles").select("full_name,college_name,department").eq("id", user_id).single(),
  ]);
  return {
    full_name:    profile.data?.full_name || "",
    college:      profile.data?.college_name || "",
    department:   profile.data?.department || "",
    skills:       (skills.data || []).map(s => s.skill_name),
    projects:     projects.data || [],
    certificates: certs.data || [],
    internships:  internships.data || [],
    achievements: achievements.data || [],
    career_paths: (careers.data || []).map(c => c.career_role),
  };
}

// Helper to extract user_id from authenticated request
function getUserId(req) {
  return req.user.id;
}

// POST /api/ai/chat
const chat = async (req, res) => {
  const { message } = req.body;
  const user_id = getUserId(req);
  if (!message) return res.status(400).json({ error: "message required" });
  try {
    const profile = await getUserProfile(user_id);
    const historyRes = await supabaseAdmin.from("chat_history")
      .select("role,message").eq("user_id", user_id)
      .order("created_at", { ascending: false }).limit(20);
    const history = (historyRes.data || []).reverse();
    const { data } = await axios.post(`${AI}/chat`, { user_id, message, history, profile });
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// GET /api/ai/chat-history/:user_id
const getChatHistory = async (req, res) => {
  const user_id = getUserId(req);
  try {
    const { data } = await supabaseAdmin.from("chat_history")
      .select("*").eq("user_id", user_id).order("created_at", { ascending: true });
    res.json({ history: data || [] });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// DELETE /api/ai/chat-history
const clearChatHistory = async (req, res) => {
  const user_id = getUserId(req);
  try {
    await supabaseAdmin.from("chat_history").delete().eq("user_id", user_id);
    res.json({ message: "Chat history cleared" });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// POST /api/ai/resume
const generateResume = async (req, res) => {
  const { template = "modern" } = req.body;
  const user_id = getUserId(req);
  try {
    const profile = await getUserProfile(user_id);
    const { data } = await axios.post(`${AI}/resume`, { user_id, template, profile });
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// POST /api/ai/career-report
const getCareerReport = async (req, res) => {
  const user_id = getUserId(req);
  try {
    const profile = await getUserProfile(user_id);
    const { data } = await axios.post(`${AI}/career-report`, { user_id, profile });
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// POST /api/ai/interview
const generateInterview = async (req, res) => {
  const { topic, question_type = "technical" } = req.body;
  const user_id = getUserId(req);
  if (!topic) return res.status(400).json({ error: "topic required" });
  try {
    const profile = await getUserProfile(user_id);
    const { data } = await axios.post(`${AI}/interview`, { user_id, topic, question_type, profile });
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// POST /api/ai/roadmap
const generateRoadmap = async (req, res) => {
  const { target_role } = req.body;
  const user_id = getUserId(req);
  if (!target_role) return res.status(400).json({ error: "target_role required" });
  try {
    const profile = await getUserProfile(user_id);
    const { data } = await axios.post(`${AI}/roadmap`, { user_id, target_role, profile });
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// POST /api/ai/gap-analysis
const gapAnalysis = async (req, res) => {
  const { target_role } = req.body;
  const user_id = getUserId(req);
  if (!target_role) return res.status(400).json({ error: "target_role required" });
  try {
    const profile = await getUserProfile(user_id);
    const { data } = await axios.post(`${AI}/gap-analysis`, { user_id, target_role, profile });
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// POST /api/ai/portfolio
const generatePortfolio = async (req, res) => {
  const { settings = {} } = req.body;
  const user_id = getUserId(req);
  try {
    const profile = await getUserProfile(user_id);
    const { data } = await axios.post(`${AI}/portfolio`, { user_id, profile, settings });
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

module.exports = { chat, getChatHistory, clearChatHistory, generateResume, getCareerReport, generateInterview, generateRoadmap, gapAnalysis, generatePortfolio };
