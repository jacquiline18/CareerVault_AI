import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./lib/ThemeContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CareerInsights from "./pages/CareerInsights";
import SkillGapPage from "./pages/SkillGapPage";
import KnowledgeGraphPage from "./pages/KnowledgeGraphPage";
import AIAssistant from "./pages/AIAssistant";
import ResumeBuilder from "./pages/ResumeBuilder";
import CareerReport from "./pages/CareerReport";
import InterviewPrep from "./pages/InterviewPrep";
import RoadmapPage from "./pages/RoadmapPage";
import GapAnalysis from "./pages/GapAnalysis";
import PortfolioGenerator from "./pages/PortfolioGenerator";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/career-insights" element={<CareerInsights />} />
          <Route path="/skill-gap" element={<SkillGapPage />} />
          <Route path="/knowledge-graph" element={<KnowledgeGraphPage />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
          <Route path="/resume-builder" element={<ResumeBuilder />} />
          <Route path="/career-report" element={<CareerReport />} />
          <Route path="/interview-prep" element={<InterviewPrep />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
          <Route path="/gap-analysis" element={<GapAnalysis />} />
          <Route path="/portfolio" element={<PortfolioGenerator />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
