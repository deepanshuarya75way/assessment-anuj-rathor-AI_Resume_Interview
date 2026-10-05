import { extractTextFromFile, parseResumeText, BLANK_RESUME } from "../utils/resumeExtractor";
import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useParams, useNavigate, useLocation } from "react-router";
import { 
  Sparkles, 
  Download, 
  Printer, 
  RotateCcw, 
  RotateCw, 
  Search, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Target, 
  Send, 
  X, 
  Copy, 
  ChevronRight, 
  LayoutTemplate,
  Sliders,
  Check,
  Briefcase,
  Eye,
  Edit3,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Maximize2,
  Minimize2,
  Menu,
  ArrowLeft,
  Compass,
  Mic,
  BarChart2,
  LogOut
} from "lucide-react";
import ResumeEditor from "../components/ResumeEditor";
import ResumePreviewLive from "../components/ResumePreviewLive";
import { useResume, templateLibrary, calculateLiveATS } from "../hooks/useResume";
import { 
  downloadPDF, 
  generateSummary, 
  rewriteBullets, 
  suggestSkills, 
  generateCoverLetter, 
  analyzeResume, 
  chatAssistant 
} from "../services/resume.api";
import "../style/resume.scss";
import BrandLogo from "../../../components/BrandLogo";
import { useAuth } from "../../auth/hooks/useAuth";

export default function ResumeBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, handleLogout } = useAuth();
  const { resume, setResume, handleAIImprove } = useResume(id);

  const userName = user?.username || user?.email?.split("@")[0] || "Candidate";
  const userInitials = (userName || "CA").slice(0, 2).toUpperCase();

  // ── Workspace State ──
  const [docTitle, setDocTitle] = useState("Software Engineer Resume");
  const [zoomLevel, setZoomLevel] = useState(0.85);
  const [zoomMode, setZoomMode] = useState("fit");
  const [activeRightTab, setActiveRightTab] = useState("ats"); // 'ats' | 'matcher' | 'suggestions'
  const [mobileTab, setMobileTab] = useState("editor"); // 'editor' | 'preview' | 'ai'
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" ? window.innerWidth <= 900 : false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 900);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const viewportRef = useRef(null);
  const [saveStatus, setSaveStatus] = useState("Saved just now");
  const [isAILoading, setIsAILoading] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const location = useLocation();
  const [hasChosenStart, setHasChosenStart] = useState(false);

  const markStartChosen = (chosen = true) => {
    setHasChosenStart(chosen);
  };
  const [isExtractingFile, setIsExtractingFile] = useState(false);
  const fileInputRef = useRef(null);

  // Always show the 3 Option Cards landing page when entering Resume Builder without a specific ID!
  useEffect(() => {
    if (id) {
      setHasChosenStart(true);
    } else {
      setHasChosenStart(false);
    }
  }, [id, location.key]);

  const handleCreateNewResume = () => {
    setResume({ ...BLANK_RESUME });
    markStartChosen(true);
    showToast("Created a clean blank resume ready for typing!", "info");
  };

  const handleContinueSavedResume = () => {
    markStartChosen(true);
    showToast("Resumed your active saved draft!", "info");
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    try {
      setIsExtractingFile(true);
      showToast("Extracting resume data...", "info");

      const extractedText = await extractTextFromFile(file);
      const parsedData = parseResumeText(extractedText, user);

      setResume(parsedData);

      showToast("Resume data successfully extracted & populated!", "success");
      markStartChosen(true);
    } catch (err) {
      console.error("Extraction error:", err);
      showToast("Failed to parse file. Starting with blank resume.", "error");
      handleCreateNewResume();
    } finally {
      setIsExtractingFile(false);
    }
  };
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [editorCollapsed, setEditorCollapsed] = useState(false);
  const [aiCollapsed, setAiCollapsed] = useState(false);

  const isFocusMode = editorCollapsed && aiCollapsed;

  const toggleFocusMode = () => {
    if (isFocusMode) {
      setEditorCollapsed(false);
      setAiCollapsed(false);
      showToast("Exited Focus Mode", "info");
    } else {
      setEditorCollapsed(true);
      setAiCollapsed(true);
      showToast("Entered Focus Mode — Full Canvas", "info");
    }
  };

  // ── Modals / Drawers ──
  const [coverLetterOpen, setCoverLetterOpen] = useState(false);
  const [coverLetterForm, setCoverLetterForm] = useState({ company: "", jd: "", tone: "Professional" });
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: "assistant", text: "Hello! I'm your PrepAI Copilot. How can I help sharpen your resume for recruiters today?" }
  ]);
  const [chatInput, setChatInput] = useState("");

  // ── Job Matcher State ──
  const [targetJD, setTargetJD] = useState("");
  const [jdAnalysis, setJdAnalysis] = useState(null);

  // ── AI Suggestions Diff State ──
  const [aiSuggestions, setAiSuggestions] = useState([]);

  // ── Toast Notification ──
  const [toast, setToast] = useState({ visible: false, text: "", type: "info" });
  const toastTimerRef = useRef(null);

  // ── Undo / Redo History Stack ──
  const historyRef = useRef([]);
  const futureRef = useRef([]);
  const isUndoRedoRef = useRef(false);

  const showToast = useCallback((text, type = "info") => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ visible: true, text, type });
    toastTimerRef.current = setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 2800);
  }, []);

  // ── Compute Live Genuine ATS Score ──
  const liveATS = calculateLiveATS(resume, targetJD);

  // ── Autosave & History Tracking ──
  useEffect(() => {
    if (!resume) return;

    if (!isUndoRedoRef.current) {
      historyRef.current.push(JSON.stringify(resume));
      if (historyRef.current.length > 30) historyRef.current.shift();
      futureRef.current = []; // Clear redo stack on new change
    }
    isUndoRedoRef.current = false;

    setSaveStatus("Saving...");
    const timer = setTimeout(() => {
      setSaveStatus("Saved just now");
    }, 850);

    return () => clearTimeout(timer);
  }, [resume]);

  // ── Undo / Redo Functions ──
  const handleUndo = useCallback(() => {
    if (historyRef.current.length < 2) return;
    const current = historyRef.current.pop();
    futureRef.current.push(current);
    const previous = historyRef.current[historyRef.current.length - 1];
    if (previous) {
      isUndoRedoRef.current = true;
      setResume(JSON.parse(previous));
      showToast("Undone last change", "info");
    }
  }, [setResume, showToast]);

  const handleRedo = useCallback(() => {
    if (futureRef.current.length === 0) return;
    const next = futureRef.current.pop();
    historyRef.current.push(next);
    isUndoRedoRef.current = true;
    setResume(JSON.parse(next));
    showToast("Redone change", "info");
  }, [setResume, showToast]);

  // ── Keyboard Shortcuts (Ctrl+Z, Ctrl+Y, Ctrl+K) ──
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && (e.key === "y" || e.key === "Y")) {
        e.preventDefault();
        handleRedo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo, handleRedo]);

  // ── Responsive Dynamic Zoom Calculation ──
  const updateFitZoom = useCallback(() => {
    if (!viewportRef.current) return;
    const stageWidth = viewportRef.current.clientWidth;
    const padding = stageWidth < 600 ? 20 : 36;
    const availableWidth = stageWidth - padding;
    if (availableWidth > 0) {
      const calculatedScale = Math.min(1.05, Math.max(0.32, availableWidth / 794));
      if (zoomMode === "fit") {
        setZoomLevel(parseFloat(calculatedScale.toFixed(2)));
      }
    }
  }, [zoomMode]);

  useEffect(() => {
    if (zoomMode === "fit") {
      updateFitZoom();
    } else if (zoomMode === "75") {
      setZoomLevel(0.75);
    } else if (zoomMode === "100") {
      setZoomLevel(1);
    } else if (zoomMode === "125") {
      setZoomLevel(1.25);
    }
  }, [zoomMode, updateFitZoom]);

  useEffect(() => {
    window.addEventListener("resize", updateFitZoom);
    return () => window.removeEventListener("resize", updateFitZoom);
  }, [updateFitZoom]);

  useEffect(() => {
    if (mobileTab === "preview") {
      const t = setTimeout(updateFitZoom, 60);
      return () => clearTimeout(t);
    }
  }, [mobileTab, updateFitZoom]);

  useEffect(() => {
    const timer = setTimeout(updateFitZoom, 280);
    return () => clearTimeout(timer);
  }, [editorCollapsed, aiCollapsed, updateFitZoom]);

  // ── AI Actions ──
  const handleAISummary = async (tone = "standard") => {
    setIsAILoading(true);
    try {
      const summary = await generateSummary({ resume, targetRole: resume.role, tone });
      if (summary) {
        // Add to suggestions diff so user can review and apply
        setAiSuggestions(prev => [
          {
            id: Date.now(),
            section: "Professional Summary",
            field: "summary",
            original: resume.summary,
            suggested: summary,
          },
          ...prev,
        ]);
        setActiveRightTab("suggestions");
        showToast("AI Summary generated! Review in AI Suggestions tab.", "success");
      }
    } catch (err) {
      showToast("AI Summary generation failed. Please try again.", "error");
    } finally {
      setIsAILoading(false);
    }
  };

  const handleAIBullet = async (bulletText, updateCallback) => {
    if (!bulletText?.trim()) return;
    setIsAILoading(true);
    try {
      const improved = await rewriteBullets({ bullets: [bulletText], targetRole: resume.role, resume });
      if (Array.isArray(improved) && improved[0]) {
        updateCallback(improved[0]);
        showToast("Bullet polished with Action + Metric format!", "success");
      }
    } catch (err) {
      showToast("Could not polish bullet. Please try again.", "error");
    } finally {
      setIsAILoading(false);
    }
  };

  const handleAISkills = async () => {
    setIsAILoading(true);
    try {
      const res = await suggestSkills({ resume, targetRole: resume.role });
      const suggested = res?.skills || [];
      if (suggested.length > 0) {
        // Find skills not already present
        const currentLower = new Set((resume.skills || []).map(s => s.toLowerCase()));
        const newSkills = suggested.filter(s => !currentLower.has(s.toLowerCase()));

        if (newSkills.length > 0) {
          setResume(prev => ({
            ...prev,
            skills: [...new Set([...(prev.skills || []), ...newSkills.slice(0, 5)])]
          }));
          showToast(`Added ${Math.min(5, newSkills.length)} in-demand skills to your resume!`, "success");
        } else {
          showToast("Your skills list is already comprehensive!", "info");
        }
      }
    } catch (err) {
      showToast("Failed to suggest skills.", "error");
    } finally {
      setIsAILoading(false);
    }
  };

  const applySuggestion = (suggestion) => {
    if (suggestion.field === "summary") {
      setResume(prev => ({ ...prev, summary: suggestion.suggested }));
    }
    setAiSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
    showToast(`Applied improvement to ${suggestion.section}!`, "success");
  };

  const dismissSuggestion = (id) => {
    setAiSuggestions(prev => prev.filter(s => s.id !== id));
  };

  // ── Job Matcher Scan ──
  const handleRunJobMatcher = () => {
    if (!targetJD.trim()) {
      showToast("Please paste a Job Description first", "warning");
      return;
    }
    const analysis = calculateLiveATS(resume, targetJD);
    setJdAnalysis(analysis);
    showToast("Job Match analysis complete!", "success");
  };

  const addMissingSkill = (skill) => {
    setResume(prev => ({
      ...prev,
      skills: [...new Set([...(prev.skills || []), skill])]
    }));
    showToast(`Added "${skill}" to your skills!`, "success");
  };

  // ── Cover Letter Generation ──
  const handleGenerateCoverLetter = async () => {
    if (!coverLetterForm.jd.trim()) {
      showToast("Job description is required for a tailored cover letter", "warning");
      return;
    }
    setIsAILoading(true);
    try {
      const res = await generateCoverLetter({
        resume,
        jobDescription: coverLetterForm.jd,
        companyName: coverLetterForm.company,
        tone: coverLetterForm.tone
      });
      setGeneratedCoverLetter(res);
      showToast("Cover letter created successfully!", "success");
    } catch (err) {
      showToast("Failed to generate cover letter", "error");
    } finally {
      setIsAILoading(false);
    }
  };

  // ── AI Chat Copilot ──
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const msg = chatInput.trim();
    setChatMessages(prev => [...prev, { role: "user", text: msg }]);
    setChatInput("");

    try {
      const reply = await chatAssistant({ resume, message: msg });
      setChatMessages(prev => [...prev, { role: "assistant", text: reply }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: "assistant", text: "I encountered an issue processing your request. Please try again." }]);
    }
  };

  // ── Export Handlers ──
  const handlePrint = () => {
    setExportMenuOpen(false);
    window.print();
  };

  const handleDownloadJson = () => {
    setExportMenuOpen(false);
    const blob = new Blob([JSON.stringify(resume, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(resume.name || "resume").toLowerCase().replace(/\s+/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("JSON export downloaded", "success");
  };

    if (!hasChosenStart) {
    return (
      <div className="rf-onboarding-page">
        <header className="rf-onboarding-nav">
          <div className="rf-logo" onClick={() => navigate("/")}>
            <BrandLogo size={36} />
            <div className="rf-logo__text">
              <span className="rf-logo__brand">PrepAI</span>
              <span className="rf-logo__tag">Studio</span>
            </div>
          </div>

          <div className="rf-onboarding-nav__right">
            <div className="rf-avatar" title={`Signed in as ${userName}`}>
              {userInitials}
            </div>
            <button 
              type="button" 
              onClick={() => navigate("/")} 
              className="rf-exit-btn"
              title="Exit to Interview Prep"
            >
              <LogOut size={14} />
              <span>Exit</span>
            </button>
          </div>
        </header>

        <main className="rf-onboarding-body">
          <div className="rf-onboarding-hero">
            <div className="rf-onboarding-badge">
              <Sparkles size={14} />
              <span>AI-POWERED RESUME STUDIO</span>
            </div>
            <h1 className="rf-onboarding-title">How would you like to build your resume?</h1>
            <p className="rf-onboarding-subtitle">
              Upload your existing resume for automatic data extraction & live A4 formatting, or create a new resume step-by-step from scratch.
            </p>
          </div>

          <div className="rf-onboarding-grid">
            {/* Card 1: Upload Existing Resume */}
            <div 
              className={`rf-onboarding-card rf-onboarding-card--upload ${isExtractingFile ? "is-loading" : ""}`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept=".json,.pdf,.docx,.txt"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />
              <div className="rf-onboarding-card__icon">
                <Download size={32} style={{ transform: "rotate(180deg)" }} />
              </div>
              <h3 className="rf-onboarding-card__title">Upload Resume</h3>
              <p className="rf-onboarding-card__desc">
                Upload your PDF, DOCX, or TXT file. We will automatically extract all contact details, summary, skills, experience, and projects into the editor & live A4 preview.
              </p>
              <div className="rf-onboarding-card__action">
                <button type="button" className="rf-btn-primary rf-btn-block" style={{ background: "linear-gradient(135deg, #10B981 0%, #059669 100%)", boxShadow: "0 4px 14px rgba(16, 185, 129, 0.35)" }}>
                  {isExtractingFile ? "Extracting Data..." : "Upload & Extract Resume"}
                </button>
              </div>
              <span className="rf-onboarding-card__hint">Supports PDF, DOCX, TXT, JSON</span>
            </div>

            {/* Card 2: Create New Resume (Clean Blank) */}
            <div 
              className="rf-onboarding-card rf-onboarding-card--create"
              onClick={handleCreateNewResume}
            >
              <div className="rf-onboarding-card__icon">
                <Sparkles size={32} />
              </div>
              <h3 className="rf-onboarding-card__title">Create New Resume</h3>
              <p className="rf-onboarding-card__desc">
                Start completely fresh with a clean slate. Every field will be emptied so you can build a new resume step-by-step with zero sample data.
              </p>
              <div className="rf-onboarding-card__action">
                <button 
                  type="button" 
                  className="rf-btn-secondary rf-btn-block"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCreateNewResume();
                  }}
                >
                  Create Blank Resume →
                </button>
              </div>
              <span className="rf-onboarding-card__hint">Includes 4+ Modern ATS Layouts</span>
            </div>

            {/* Card 3: Continue Active Saved Draft */}
            <div 
              className="rf-onboarding-card rf-onboarding-card--continue"
              onClick={handleContinueSavedResume}
            >
              <div className="rf-onboarding-card__icon">
                <RotateCcw size={30} />
              </div>
              <h3 className="rf-onboarding-card__title">Continue Saved Resume</h3>
              <p className="rf-onboarding-card__desc">
                Pick up right where you left off. Continue editing your existing saved resume draft, ATS score checks, and AI bullet optimizations.
              </p>
              <div className="rf-onboarding-card__action">
                <button 
                  type="button" 
                  className="rf-btn-primary rf-btn-block"
                  style={{ background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleContinueSavedResume();
                  }}
                >
                  Resume Active Draft →
                </button>
              </div>
              <span className="rf-onboarding-card__hint">Saved session: {resume?.name && resume.name !== "Krish Gupta" && resume.name !== "Your Full Name" ? resume.name : "Active Draft"}</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="rf-app">
      {/* ── Top Header ── */}
      <header className="rf-header">
        <div className="rf-header__left">
          {/* Mobile Menu / Navigation Toggle Button */}
          <button
            type="button"
            className="rf-menu-toggle-btn"
            onClick={() => setMobileDrawerOpen(true)}
            title="Open PrepAI Navigation"
            aria-label="Open Navigation"
          >
            <Menu size={20} />
          </button>

          <div className="rf-logo" onClick={() => navigate("/")}>
            <BrandLogo size={36} />
            <div className="rf-logo__text">
              <span className="rf-logo__brand">PrepAI</span>
              <span className="rf-logo__tag">Studio</span>
            </div>
          </div>

          {id && (
            <button
              type="button"
              className="rf-back-btn"
              onClick={() => navigate(`/interview/${id}`)}
              title="Return to Interview Intelligence"
            >
              <ArrowLeft size={13} />
              <span className="rf-back-text">Interview</span>
            </button>
          )}

          
          <div className="rf-header__divider" />

          {/* Editable Document Title */}
          <div className="rf-doc-title">
            <input
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              title="Click to rename resume"
            />
            <span className="rf-role-badge">{resume.role || "Software Engineer"}</span>
          </div>
        </div>

        {/* Center Navigation Switcher */}
        <div className="rf-header__center">
          <button 
            type="button" 
            className="rf-nav-pill is-active"
            onClick={() => setActiveRightTab("ats")}
            title="Resume Editor"
          >
            <FileText size={14} />
            <span className="rf-pill-text">Resume</span>
          </button>
          <button 
            type="button" 
            className={`rf-nav-pill ${activeRightTab === "matcher" ? "is-active" : ""}`}
            onClick={() => setActiveRightTab("matcher")}
            title="ATS Matcher"
          >
            <Target size={14} />
            <span className="rf-pill-text">ATS Matcher</span>
          </button>
          <button 
            type="button" 
            className="rf-nav-pill"
            onClick={() => setCoverLetterOpen(true)}
            title="Cover Letter"
          >
            <Briefcase size={14} />
            <span className="rf-pill-text">Cover Letter</span>
          </button>
          <button 
            type="button" 
            className="rf-nav-pill"
            onClick={() => setChatOpen(true)}
            title="AI Copilot"
          >
            <Sparkles size={14} />
            <span className="rf-pill-text">AI Copilot</span>
          </button>
          <div className="rf-header__divider rf-header__divider--nav" />
          <button 
            type="button" 
            className="rf-nav-pill rf-nav-pill--external"
            onClick={() => navigate("/dashboard")}
            title="Go to Command Center"
          >
            <BarChart2 size={13} />
            <span className="rf-pill-text">Dashboard</span>
          </button>
        </div>

        {/* Right Actions */}
        <div className="rf-header__right">
          <div className="rf-save-indicator" title={saveStatus}>
            <span className="rf-save-dot" />
            <span className="rf-save-text">{saveStatus}</span>
          </div>

          <div className="rf-history-btns">
            <button type="button" onClick={handleUndo} title="Undo (Ctrl+Z)">
              <RotateCcw size={14} />
            </button>
            <button type="button" onClick={handleRedo} title="Redo (Ctrl+Y)">
              <RotateCw size={14} />
            </button>
          </div>

          <button
            type="button"
            className="rf-cmd-btn"
            onClick={() => setCommandPaletteOpen(true)}
            title="Command Palette"
          >
            <Search size={14} />
            <span className="rf-kbd">⌘K</span>
          </button>

          {/* Export Dropdown */}
          <div className="rf-export-wrap">
            <button
              type="button"
              className="rf-btn-primary"
              onClick={() => setExportMenuOpen(prev => !prev)}
            >
              <Download size={14} /> Export <ChevronRight size={13} className={exportMenuOpen ? "rotate-90" : ""} />
            </button>

            {exportMenuOpen && (
              <div className="rf-dropdown-menu">
                <button type="button" onClick={handlePrint}>
                  <Printer size={14} /> Print / Save as PDF
                </button>
                <button type="button" onClick={handleDownloadJson}>
                  <FileText size={14} /> Download JSON Data
                </button>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="rf-avatar" title={`Signed in as ${userName}`}>
            {userInitials}
          </div>

          {/* Exit Button - sends directly to Image 2 (Home page) */}
          <button 
            type="button" 
            onClick={() => navigate('/')} 
            className="rf-exit-btn" 
            title="Exit to Interview Prep"
            aria-label="Exit"
          >
            <LogOut size={14} />
            <span className="rf-exit-text">Exit</span>
          </button>
        </div>
      </header>

      {/* ── Mobile Viewport Tab Switcher (Visible on <= 900px) ── */}
      <div className="rf-mobile-tabs">
        <button
          type="button"
          className={`rf-mobile-tab ${mobileTab === "editor" ? "is-active" : ""}`}
          onClick={() => setMobileTab("editor")}
        >
          <Edit3 size={14} /> Editor
        </button>
        <button
          type="button"
          className={`rf-mobile-tab ${mobileTab === "preview" ? "is-active" : ""}`}
          onClick={() => {
            setMobileTab("preview");
            setTimeout(updateFitZoom, 60);
          }}
        >
          <Eye size={14} /> A4 Preview
        </button>
        <button
          type="button"
          className={`rf-mobile-tab ${mobileTab === "ai" ? "is-active" : ""}`}
          onClick={() => setMobileTab("ai")}
        >
          <Sparkles size={14} /> AI Copilot ({liveATS.score}%)
        </button>
      </div>

      {/* ── 3-Panel Independent Scrolling Workspace ── */}
      <div className={`rf-workspace rf-workspace--mobile-${mobileTab} ${editorCollapsed ? "rf-workspace--left-collapsed" : ""} ${aiCollapsed ? "rf-workspace--right-collapsed" : ""} ${isFocusMode ? "rf-workspace--both-collapsed" : ""}`}>
        {/* ── Left Panel (30%): Editor or Collapsed Rail ── */}
        {(editorCollapsed && !isMobile) ? (
          <aside
            className="rf-rail rf-rail--left"
            onClick={() => setEditorCollapsed(false)}
            title="Expand Resume Editor"
          >
            <button
              type="button"
              className="rf-rail-btn"
              onClick={(e) => {
                e.stopPropagation();
                setEditorCollapsed(false);
              }}
              title="Expand Resume Editor"
            >
              <PanelLeftOpen size={16} />
            </button>
            <div className="rf-rail-badge">
              {liveATS.score}%
            </div>
            <div className="rf-rail-label-wrap">
              <span className="rf-rail-label">RESUME EDITOR</span>
            </div>
          </aside>
        ) : (
          <aside className="rf-panel rf-panel--editor">
            <div className="rf-panel__header">
              <div>
                <h2 className="rf-panel__title">Resume Editor</h2>
                <p className="rf-panel__desc">Build a recruiter-ready resume with live ATS checks</p>
              </div>
              <div className="rf-panel__header-actions">
                <div className="rf-panel__badge">
                  {liveATS.score}% Ready
                </div>
                <button
                  type="button"
                  className="rf-collapse-panel-btn"
                  onClick={() => setEditorCollapsed(true)}
                  title="Compress Editor Panel"
                >
                  <PanelLeftClose size={15} />
                </button>
              </div>
            </div>

            <div className="rf-panel__body">
              <ResumeEditor
                resume={resume}
                setResume={setResume}
                onAISummary={handleAISummary}
                onAIBullet={handleAIBullet}
                onAISkills={handleAISkills}
                isAILoading={isAILoading}
              />
            </div>

            {/* Mobile Floating Action Button to View Preview */}
            <div className="rf-mobile-floating-wrap">
              <button
                type="button"
                className="rf-mobile-floating-btn"
                onClick={() => {
                  setMobileTab("preview");
                  setTimeout(updateFitZoom, 60);
                }}
              >
                <Eye size={15} /> View A4 Preview ({liveATS.score}%)
              </button>
            </div>
          </aside>
        )}

        {/* ── Center Panel (45%): Live A4 Canvas ── */}
        <main className="rf-panel rf-panel--preview">
          <div className="rf-preview-bar">
            <div className="rf-preview-bar__left">
              <span className="rf-preview-tag">True A4 Canvas</span>
              <span className="rf-preview-template-name">
                Template: <strong>{resume.template || "Modern"}</strong>
              </span>
            </div>

            <div className="rf-preview-bar__center">
              <div className="rf-template-chips">
                {templateLibrary.map(t => (
                  <button
                    key={t.key}
                    type="button"
                    className={`rf-tpl-chip ${resume.template === t.key ? "is-selected" : ""}`}
                    onClick={() => {
                      setResume(prev => ({ ...prev, template: t.key }));
                      showToast(`Switched to ${t.title} template`, "info");
                    }}
                  >
                    {t.title}
                  </button>
                ))}
              </div>
            </div>

            <div className="rf-preview-bar__right">
              <button
                type="button"
                className={`rf-canvas-btn ${isFocusMode ? "is-active" : ""}`}
                onClick={toggleFocusMode}
                title={isFocusMode ? "Exit Focus Mode (Restore sidebars)" : "Focus Canvas (Collapse sidebars)"}
              >
                {isFocusMode ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                <span>{isFocusMode ? "Exit Focus" : "Focus Canvas"}</span>
              </button>

              <div className="rf-zoom-controls">
                <button
                  type="button"
                  className={zoomMode === "fit" ? "is-active" : ""}
                  onClick={() => setZoomMode("fit")}
                >
                  Fit
                </button>
                <button
                  type="button"
                  className={zoomMode === "75" ? "is-active" : ""}
                  onClick={() => setZoomMode("75")}
                >
                  75%
                </button>
                <button
                  type="button"
                  className={zoomMode === "100" ? "is-active" : ""}
                  onClick={() => setZoomMode("100")}
                >
                  100%
                </button>
              </div>

              <button
                type="button"
                className="rf-quick-print-btn"
                onClick={handlePrint}
                title="Print / Save PDF"
              >
                <Printer size={14} />
              </button>
            </div>
          </div>

          {/* Dedicated Canvas Viewport with Container Ref */}
          <div className="rf-viewport" ref={viewportRef}>
            <ResumePreviewLive resume={resume} zoom={zoomLevel} />
          </div>

          {/* Mobile Floating Action Bar on Preview */}
          <div className="rf-mobile-floating-wrap">
            <button
              type="button"
              className="rf-mobile-floating-btn secondary"
              onClick={() => setMobileTab("editor")}
            >
              <Edit3 size={15} /> Edit Resume
            </button>
            <button
              type="button"
              className="rf-mobile-floating-btn primary"
              onClick={handlePrint}
            >
              <Download size={15} /> Export PDF
            </button>
          </div>
        </main>

        {/* ── Right Panel (25%): AI Copilot & ATS Analyzer or Collapsed Rail ── */}
        {(aiCollapsed && !isMobile) ? (
          <aside
            className="rf-rail rf-rail--right"
            onClick={() => setAiCollapsed(false)}
            title="Expand AI Career Copilot"
          >
            <button
              type="button"
              className="rf-rail-btn"
              onClick={(e) => {
                e.stopPropagation();
                setAiCollapsed(false);
              }}
              title="Expand AI Career Copilot"
            >
              <PanelRightOpen size={16} />
            </button>
            <div className="rf-rail-badge rf-rail-badge--score">
              {liveATS.score}
            </div>
            <div className="rf-rail-label-wrap">
              <span className="rf-rail-label">AI COPILOT</span>
            </div>
          </aside>
        ) : (
          <aside className="rf-panel rf-panel--ai">
            <div className="rf-panel__header">
              <div>
                <h2 className="rf-panel__title">AI Career Copilot</h2>
                <p className="rf-panel__desc">Intelligent ATS scoring & recruiter optimization</p>
              </div>
              <button
                type="button"
                className="rf-collapse-panel-btn"
                onClick={() => setAiCollapsed(true)}
                title="Compress AI Copilot Panel"
              >
                <PanelRightClose size={15} />
              </button>
            </div>

          {/* Segmented Tab Controls */}
          <div className="rf-ai-tabs">
            <button
              type="button"
              className={activeRightTab === "ats" ? "is-active" : ""}
              onClick={() => setActiveRightTab("ats")}
            >
              ATS Score
            </button>
            <button
              type="button"
              className={activeRightTab === "matcher" ? "is-active" : ""}
              onClick={() => setActiveRightTab("matcher")}
            >
              Job Matcher
            </button>
            <button
              type="button"
              className={activeRightTab === "suggestions" ? "is-active" : ""}
              onClick={() => setActiveRightTab("suggestions")}
            >
              AI Diffs {aiSuggestions.length > 0 && <span className="rf-badge-count">{aiSuggestions.length}</span>}
            </button>
          </div>

          <div className="rf-panel__body rf-ai-content">
            {/* ── TAB 1: ATS SCORE & AUDIT ── */}
            {activeRightTab === "ats" && (
              <div className="rf-ats-audit">
                <div className="rf-score-card">
                  <div className="rf-score-ring">
                    <svg viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" className="rf-score-ring__bg" />
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        className="rf-score-ring__progress"
                        style={{
                          strokeDasharray: 264,
                          strokeDashoffset: 264 - (264 * liveATS.score) / 100,
                          stroke: liveATS.score >= 80 ? "#10B981" : liveATS.score >= 60 ? "#F59E0B" : "#EF4444"
                        }}
                      />
                    </svg>
                    <div className="rf-score-ring__value">
                      <strong>{liveATS.score}</strong>
                      <span>/ 100</span>
                    </div>
                  </div>

                  <div className="rf-score-meta">
                    <h4>{liveATS.score >= 80 ? "Strong Recruiter Match" : liveATS.score >= 60 ? "Competitive Signal" : "Needs Optimization"}</h4>
                    <p className="rf-score-sub">{liveATS.percentile} for {resume.role || "Software Roles"}</p>
                    <button
                      type="button"
                      className="rf-btn-primary-sm"
                      onClick={() => handleAISummary("standard")}
                      disabled={isAILoading}
                    >
                      <Sparkles size={12} /> Optimize with AI
                    </button>
                  </div>
                </div>

                {/* Score Category Breakdown */}
                <div className="rf-audit-section">
                  <h4 className="rf-audit-title">Score Breakdown</h4>
                  <div className="rf-breakdown-list">
                    <div className="rf-breakdown-item">
                      <div className="rf-breakdown-item__head">
                        <span>Contact Completeness</span>
                        <strong>{liveATS.breakdown.contact}%</strong>
                      </div>
                      <div className="rf-progress-track">
                        <div className="rf-progress-fill" style={{ width: `${liveATS.breakdown.contact}%` }} />
                      </div>
                    </div>

                    <div className="rf-breakdown-item">
                      <div className="rf-breakdown-item__head">
                        <span>Experience & Metrics</span>
                        <strong>{liveATS.breakdown.experience}%</strong>
                      </div>
                      <div className="rf-progress-track">
                        <div className="rf-progress-fill" style={{ width: `${liveATS.breakdown.experience}%` }} />
                      </div>
                    </div>

                    <div className="rf-breakdown-item">
                      <div className="rf-breakdown-item__head">
                        <span>Project Depth</span>
                        <strong>{liveATS.breakdown.projects}%</strong>
                      </div>
                      <div className="rf-progress-track">
                        <div className="rf-progress-fill" style={{ width: `${liveATS.breakdown.projects}%` }} />
                      </div>
                    </div>

                    <div className="rf-breakdown-item">
                      <div className="rf-breakdown-item__head">
                        <span>Skills Diversity</span>
                        <strong>{liveATS.breakdown.skills}%</strong>
                      </div>
                      <div className="rf-progress-track">
                        <div className="rf-progress-fill" style={{ width: `${liveATS.breakdown.skills}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actionable Recommendations */}
                <div className="rf-audit-section">
                  <h4 className="rf-audit-title">Optimization Checklist</h4>
                  <div className="rf-checklist">
                    {liveATS.suggestions.map((sug, i) => (
                      <div className="rf-check-item" key={i}>
                        <AlertTriangle size={14} className="rf-warn-icon" />
                        <p>{sug}</p>
                      </div>
                    ))}
                    {liveATS.formattingIssues.map((iss, i) => (
                      <div className="rf-check-item rf-check-item--info" key={i}>
                        <CheckCircle2 size={14} className="rf-info-icon" />
                        <p>{iss}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 2: JOB MATCHER ── */}
            {activeRightTab === "matcher" && (
              <div className="rf-job-matcher">
                <p className="rf-tab-desc">
                  Paste the job description you are targeting. PrepAI will compare keywords and highlight missing requirements.
                </p>

                <div className="rf-field">
                  <label>Target Job Description</label>
                  <textarea
                    rows={6}
                    placeholder="Paste job requirements, tech stack, and responsibilities here..."
                    value={targetJD}
                    onChange={(e) => setTargetJD(e.target.value)}
                  />
                </div>

                <button
                  type="button"
                  className="rf-btn-primary rf-btn-block"
                  onClick={handleRunJobMatcher}
                >
                  <Target size={14} /> Analyze Alignment
                </button>

                {jdAnalysis && (
                  <div className="rf-matcher-results">
                    <div className="rf-matcher-score">
                      <span>Match Compatibility</span>
                      <strong>{jdAnalysis.score}%</strong>
                    </div>

                    {/* Matched Keywords */}
                    <div className="rf-kw-block">
                      <h5>Matched Keywords ({jdAnalysis.keywords.length})</h5>
                      <div className="rf-kw-pills">
                        {jdAnalysis.keywords.map((kw, i) => (
                          <span className="rf-kw-pill is-matched" key={i}>
                            <Check size={11} /> {kw}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Missing Keywords with 1-click Add */}
                    <div className="rf-kw-block">
                      <h5>Missing Keywords ({jdAnalysis.missingKeywords.length})</h5>
                      <div className="rf-kw-pills">
                        {jdAnalysis.missingKeywords.map((kw, i) => (
                          <button
                            type="button"
                            className="rf-kw-pill is-missing"
                            key={i}
                            title="Click to add to skills"
                            onClick={() => addMissingSkill(kw)}
                          >
                            + {kw}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── TAB 3: AI SUGGESTIONS DIFF ── */}
            {activeRightTab === "suggestions" && (
              <div className="rf-suggestions-tab">
                <div className="rf-suggestions-header">
                  <p className="rf-tab-desc">
                    Review and apply proposed optimizations. You have full control over all changes.
                  </p>
                  <button
                    type="button"
                    className="rf-ai-btn"
                    onClick={() => handleAISummary("standard")}
                    disabled={isAILoading}
                  >
                    <Sparkles size={12} /> Generate Suggestions
                  </button>
                </div>

                {aiSuggestions.length === 0 ? (
                  <div className="rf-empty-state">
                    <Sparkles size={24} className="rf-empty-icon" />
                    <h4>No Pending Suggestions</h4>
                    <p>Click "Generate Suggestions" or use the inline AI buttons in the editor to optimize sections.</p>
                  </div>
                ) : (
                  <div className="rf-diff-cards">
                    {aiSuggestions.map(sug => (
                      <div className="rf-diff-card" key={sug.id}>
                        <div className="rf-diff-card__head">
                          <span className="rf-diff-badge">{sug.section}</span>
                        </div>

                        <div className="rf-diff-block rf-diff-block--original">
                          <small>Current</small>
                          <p>{sug.original || "(Empty)"}</p>
                        </div>

                        <div className="rf-diff-block rf-diff-block--suggested">
                          <small>✨ AI Recommended</small>
                          <p>{sug.suggested}</p>
                        </div>

                        <div className="rf-diff-card__actions">
                          <button
                            type="button"
                            className="rf-btn-apply"
                            onClick={() => applySuggestion(sug)}
                          >
                            <Check size={13} /> Apply to Resume
                          </button>
                          <button
                            type="button"
                            className="rf-btn-reject"
                            onClick={() => dismissSuggestion(sug.id)}
                          >
                            <X size={13} /> Dismiss
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>
        )}
      </div>

      {/* ── Cover Letter Generator Modal ── */}
      {coverLetterOpen && (
        <div className="rf-modal-overlay" onClick={() => setCoverLetterOpen(false)}>
          <div className="rf-modal" onClick={(e) => e.stopPropagation()}>
            <div className="rf-modal__head">
              <div>
                <h3>AI Cover Letter Generator</h3>
                <p>Generate a tailored, high-converting cover letter based strictly on your verified resume background</p>
              </div>
              <button type="button" className="rf-close-btn" onClick={() => setCoverLetterOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="rf-modal__body">
              <div className="rf-grid-2">
                <div className="rf-field">
                  <label>Company Name</label>
                  <input
                    placeholder="e.g. Stripe, Google, Acme Labs"
                    value={coverLetterForm.company}
                    onChange={(e) => setCoverLetterForm(prev => ({ ...prev, company: e.target.value }))}
                  />
                </div>
                <div className="rf-field">
                  <label>Tone</label>
                  <select
                    value={coverLetterForm.tone}
                    onChange={(e) => setCoverLetterForm(prev => ({ ...prev, tone: e.target.value }))}
                  >
                    <option value="Professional">Professional</option>
                    <option value="Confident">Confident & Impactful</option>
                    <option value="Technical">Technical & Architecture-Focused</option>
                    <option value="Concise">Concise & Direct</option>
                  </select>
                </div>
              </div>

              <div className="rf-field">
                <label>Job Description Requirements</label>
                <textarea
                  rows={4}
                  placeholder="Paste the target job description here..."
                  value={coverLetterForm.jd}
                  onChange={(e) => setCoverLetterForm(prev => ({ ...prev, jd: e.target.value }))}
                />
              </div>

              <button
                type="button"
                className="rf-btn-primary rf-btn-block"
                onClick={handleGenerateCoverLetter}
                disabled={isAILoading}
              >
                <Sparkles size={14} /> {isAILoading ? "Drafting Cover Letter..." : "Generate Tailored Cover Letter"}
              </button>

              {generatedCoverLetter && (
                <div className="rf-cover-letter-result">
                  <div className="rf-cover-letter-head">
                    <h4>{generatedCoverLetter.subject}</h4>
                    <button
                      type="button"
                      className="rf-copy-btn"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedCoverLetter.coverLetter);
                        showToast("Cover letter copied to clipboard!", "success");
                      }}
                    >
                      <Copy size={13} /> Copy Text
                    </button>
                  </div>
                  <pre className="rf-cover-letter-text">{generatedCoverLetter.coverLetter}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── AI Copilot Chat Drawer ── */}
      {chatOpen && (
        <aside className="rf-chat-drawer">
          <div className="rf-chat-drawer__head">
            <div>
              <h3>PrepAI Copilot</h3>
              <p>Ask for phrasing advice, ATS tips, or interview questions</p>
            </div>
            <button type="button" onClick={() => setChatOpen(false)}>
              <X size={16} />
            </button>
          </div>

          <div className="rf-chat-drawer__messages">
            {chatMessages.map((m, idx) => (
              <div key={idx} className={`rf-chat-bubble rf-chat-bubble--${m.role}`}>
                <span>{m.role === "assistant" ? "AI Copilot" : "You"}</span>
                <p>{m.text}</p>
              </div>
            ))}
          </div>

          <div className="rf-chat-drawer__input">
            <input
              placeholder="Ask for feedback or wording advice..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <button type="button" onClick={handleSendMessage}>
              <Send size={14} />
            </button>
          </div>
        </aside>
      )}

      {/* ── Command Palette (Ctrl+K) ── */}
      {commandPaletteOpen && (
        <div className="rf-modal-overlay" onClick={() => setCommandPaletteOpen(false)}>
          <div className="rf-cmd-palette" onClick={(e) => e.stopPropagation()}>
            <div className="rf-cmd-palette__input">
              <Search size={16} />
              <input
                autoFocus
                placeholder="Type a command or action (e.g. Export, Template, Summary, Matcher)..."
                onKeyDown={(e) => {
                  if (e.key === "Escape") setCommandPaletteOpen(false);
                }}
              />
            </div>
            <div className="rf-cmd-palette__list">
              <div
                className="rf-cmd-item"
                onClick={() => {
                  setCommandPaletteOpen(false);
                  handlePrint();
                }}
              >
                <Printer size={14} />
                <span>Export / Print PDF</span>
                <span className="rf-cmd-sub">A4 Document</span>
              </div>
              <div
                className="rf-cmd-item"
                onClick={() => {
                  setCommandPaletteOpen(false);
                  handleAISummary("standard");
                }}
              >
                <Sparkles size={14} />
                <span>AI Improve Professional Summary</span>
                <span className="rf-cmd-sub">Optimization</span>
              </div>
              <div
                className="rf-cmd-item"
                onClick={() => {
                  setCommandPaletteOpen(false);
                  setActiveRightTab("matcher");
                }}
              >
                <Target size={14} />
                <span>Open Job Description Matcher</span>
                <span className="rf-cmd-sub">ATS Tool</span>
              </div>
              <div
                className="rf-cmd-item"
                onClick={() => {
                  setCommandPaletteOpen(false);
                  setCoverLetterOpen(true);
                }}
              >
                <Briefcase size={14} />
                <span>Generate Tailored Cover Letter</span>
                <span className="rf-cmd-sub">Application</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Subtle Floating Toast (Doesn't cover header) ── */}
      {toast.visible && (
        <div className={`rf-toast rf-toast--${toast.type}`}>
          {toast.type === "success" && <CheckCircle2 size={15} />}
          {toast.type === "warning" && <AlertTriangle size={15} />}
          <span>{toast.text}</span>
        </div>
      )}
      {/* ── Mobile Navigation Drawer (Teleported to document.body) ── */}
      {typeof document !== 'undefined' && createPortal(
        <>
          {mobileDrawerOpen && (
            <div 
              className="app-navbar__mobile-backdrop"
              onClick={() => setMobileDrawerOpen(false)}
              aria-hidden="true"
            />
          )}

          <div 
            className={`app-navbar__mobile-drawer ${mobileDrawerOpen ? 'open' : ''}`}
            aria-hidden={!mobileDrawerOpen}
          >
            <div className="mobile-drawer-header">
              <div className="mobile-user-info">
                <div className="user-avatar">
                  {userInitials}
                </div>
                <div>
                  <p className="mobile-user-name">{userName}</p>
                  <p className="mobile-user-sub">Career Prep Active</p>
                </div>
              </div>
              <button 
                className="mobile-close-btn"
                onClick={() => setMobileDrawerOpen(false)}
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mobile-drawer-nav">
              {id && (
                <button
                  type="button"
                  className="mobile-nav-link"
                  style={{ background: 'rgba(99, 102, 241, 0.16)', borderColor: 'rgba(99, 102, 241, 0.35)' }}
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    navigate(`/interview/${id}`);
                  }}
                >
                  <ArrowLeft size={16} />
                  <span>Back to Interview Intelligence</span>
                </button>
              )}

              <button
                type="button"
                className="mobile-nav-link"
                onClick={() => {
                  setMobileDrawerOpen(false);
                  navigate(id ? `/interview/${id}` : '/');
                }}
              >
                <Compass size={16} />
                <span>Interview Prep</span>
              </button>

              <button
                type="button"
                className="mobile-nav-link active"
                onClick={() => setMobileDrawerOpen(false)}
              >
                <FileText size={16} />
                <span>Resume Builder</span>
                <span className="mobile-active-pill">Editing</span>
              </button>

              <button
                type="button"
                className="mobile-nav-link"
                onClick={() => {
                  setMobileDrawerOpen(false);
                  navigate(id ? `/mock/${id}` : '/mock');
                }}
              >
                <Mic size={16} />
                <span>Mock Studio</span>
              </button>

              <button
                type="button"
                className="mobile-nav-link"
                onClick={() => {
                  setMobileDrawerOpen(false);
                  navigate('/dashboard');
                }}
              >
                <BarChart2 size={16} />
                <span>Command Center</span>
              </button>
            </div>

            <div className="mobile-drawer-footer">
              <button 
                onClick={async () => {
                  setMobileDrawerOpen(false);
                  if (handleLogout) await handleLogout();
                  navigate('/login');
                }} 
                className="mobile-logout-btn"
              >
                <LogOut size={16} /> Log Out
              </button>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
