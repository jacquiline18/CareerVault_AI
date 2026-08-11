const axios = require("axios");
const { supabaseAdmin } = require("../supabaseClient");

const processDocument = async (req, res) => {
  const { document_id, file_url, file_type } = req.body;
  const user_id = req.user.id;

  if (!document_id || !file_url || !file_type) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const response = await axios.post("http://127.0.0.1:8000/process", {
      document_id,
      user_id,
      file_url,
      file_type,
    }, { timeout: 120000 });

    res.status(200).json({ status: "success", result: response.data });
  } catch (err) {
    const detail = err.response?.data?.detail || err.response?.data?.error || err.message;
    res.status(err.response?.status || 500).json({ error: detail });
  }
};

const getInsights = async (req, res) => {
  const user_id = req.user.id;

  try {
    const [skills, projects, certificates, internships, achievements, career_insights] =
      await Promise.all([
        supabaseAdmin.from("skills").select("*").eq("user_id", user_id),
        supabaseAdmin.from("projects").select("*").eq("user_id", user_id),
        supabaseAdmin.from("certificates").select("*").eq("user_id", user_id),
        supabaseAdmin.from("internships").select("*").eq("user_id", user_id),
        supabaseAdmin.from("achievements").select("*").eq("user_id", user_id),
        supabaseAdmin.from("career_insights").select("*").eq("user_id", user_id),
      ]);

    res.status(200).json({
      skills: skills.data || [],
      projects: projects.data || [],
      certificates: certificates.data || [],
      internships: internships.data || [],
      achievements: achievements.data || [],
      career_insights: career_insights.data || [],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getKnowledgeGraph = async (req, res) => {
  const user_id = req.user.id;
  try {
    const { data, error } = await supabaseAdmin
      .from("knowledge_graph")
      .select("*")
      .eq("user_id", user_id);
    if (error) throw error;
    res.status(200).json({ relationships: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteDocumentData = async (req, res) => {
  const user_id = req.user.id;

  try {
    await Promise.all([
      supabaseAdmin.from("skills").delete().eq("user_id", user_id),
      supabaseAdmin.from("projects").delete().eq("user_id", user_id),
      supabaseAdmin.from("certificates").delete().eq("user_id", user_id),
      supabaseAdmin.from("internships").delete().eq("user_id", user_id),
      supabaseAdmin.from("achievements").delete().eq("user_id", user_id),
      supabaseAdmin.from("career_insights").delete().eq("user_id", user_id),
      supabaseAdmin.from("knowledge_graph").delete().eq("user_id", user_id),
    ]);
    res.status(200).json({ message: "All extracted data cleared" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const queryDocuments = async (req, res) => {
  const { query } = req.body;
  const user_id = req.user.id;
  if (!query) return res.status(400).json({ error: "query required" });
  try {
    const response = await axios.post("http://127.0.0.1:8000/query", { user_id, query });
    res.status(200).json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { processDocument, getInsights, getKnowledgeGraph, deleteDocumentData, queryDocuments };
