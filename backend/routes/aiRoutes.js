const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  chat, getChatHistory, clearChatHistory,
  generateResume, getCareerReport,
  generateInterview, generateRoadmap,
  gapAnalysis, generatePortfolio
} = require("../controllers/aiController");

// All AI routes require authentication
router.post("/chat",              protect, chat);
router.get("/chat-history/:user_id", protect, getChatHistory);
router.delete("/chat-history",    protect, clearChatHistory);
router.post("/resume",            protect, generateResume);
router.post("/career-report",     protect, getCareerReport);
router.post("/interview",         protect, generateInterview);
router.post("/roadmap",           protect, generateRoadmap);
router.post("/gap-analysis",      protect, gapAnalysis);
router.post("/portfolio",         protect, generatePortfolio);

module.exports = router;
