const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { processDocument, getInsights, getKnowledgeGraph, deleteDocumentData, queryDocuments } = require("../controllers/documentController");

// All document routes require authentication
router.post("/process", protect, processDocument);
router.get("/insights/:user_id", protect, getInsights);
router.get("/knowledge-graph/:user_id", protect, getKnowledgeGraph);
router.delete("/clear-data", protect, deleteDocumentData);
router.post("/query", protect, queryDocuments);

module.exports = router;
