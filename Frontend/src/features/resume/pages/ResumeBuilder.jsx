import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import ResumeEditor from "../components/ResumeEditor";
import ResumePreviewLive from "../components/ResumePreviewLive";
import { useResume } from "../hooks/useResume";
import { downloadPDF } from "../services/resume.api";
import "../style/resume.scss";

const templateOptions = [
  {
    key: "minimal",
    title: "Minimal",
    copy: "Quiet typography and ATS-first whitespace for conservative hiring pipelines.",
  },
  {
    key: "modern",
    title: "Modern",
    copy: "Balanced visual polish with SaaS-style spacing and crisp metadata treatment.",
  },
  {
    key: "tech",
    title: "Tech",
    copy: "Stronger accent lines, dense signal, and developer-friendly project emphasis.",
  },
  {
    key: "creative",
    title: "Creative",
    copy: "Higher contrast highlight blocks for design-forward portfolios and hybrid roles.",
  },
];

const assistantMessages = [
  {
    role: "assistant",
    text: "I found strong backend signals in your projects. Want me to tighten the summary for product engineering roles?",
  },
  {
    role: "user",
    text: "Yes, keep it ATS-friendly and concise.",
  },
  {
    role: "assistant",
    text: "Done. I also surfaced JWT, MongoDB transactions, and AI API integration for better recruiter scanning.",
  },
];

function triggerFileDownload(filename, content, type = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.URL.revokeObjectURL(url);
}

function trimLink(value) {
  return `${value || ""}`
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/$/, "");
}

function buildLatexExport(resume) {
  const lines = [
    "\\documentclass{resumeforge}",
    "\\begin{document}",
    `\\name{${resume.name || ""}}`,
    `\\role{${resume.role || ""}}`,
    `\\contact{${[
      resume.phone,
      resume.email,
      trimLink(resume.github),
      trimLink(resume.linkedin),
      trimLink(resume.leetcode),
      trimLink(resume.portfolio),
    ]
      .filter(Boolean)
      .join(" | ")}}`,
    `\\summary{${resume.summary || ""}}`,
    "",
    "\\experience{",
  ];

  (resume.experience || []).forEach((item) => {
    lines.push(
      `  \\roleitem{${item.title || ""}}{${item.company || ""}}{${item.startDate || ""} -- ${item.endDate || ""}}`
    );
    (item.points || []).forEach((point) => {
      lines.push(`  \\bullet{${point}}`);
    });
    lines.push("");
  });

  lines.push("}", "", "\\projects{");

  (resume.projects || []).forEach((item) => {
    lines.push(
      `  \\project{${item.name || ""}}{${item.role || ""}}{${item.stack || ""}}`
    );
    (item.points || []).forEach((point) => {
      lines.push(`  \\bullet{${point}}`);
    });
    lines.push("");
  });

  lines.push("}", "", "\\skills{");
  (resume.skills || []).forEach((item) => {
    lines.push(`  \\skill{${item}}`);
  });
  lines.push("}", "", "\\education{");

  (resume.education || []).forEach((item) => {
    lines.push(
      `  \\educationitem{${item.school || ""}}{${item.degree || ""}}{${item.startDate || ""} -- ${item.endDate || ""}}{${item.score || ""}}`
    );
  });

  lines.push("}", "\\end{document}");
  return lines.join("\n");
}

function AppIcon({ name }) {
  const icons = {
    compile: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 6h12v12H6z" />
        <path d="M10 10l4 2-4 2z" />
      </svg>
    ),
    download: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 4v10" />
        <path d="M8 10l4 4 4-4" />
        <path d="M5 19h14" />
      </svg>
    ),
    score: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 14a8 8 0 1116 0" />
        <path d="M12 14l4-6" />
      </svg>
    ),
    ai: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="5" y="7" width="14" height="10" rx="4" />
        <circle cx="10" cy="12" r="1" />
        <circle cx="14" cy="12" r="1" />
        <path d="M10 15h4" />
      </svg>
    ),
    template: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="5" width="16" height="14" rx="3" />
        <path d="M9 5v14" />
      </svg>
    ),
    sun: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v3" />
        <path d="M12 19v3" />
        <path d="M2 12h3" />
        <path d="M19 12h3" />
      </svg>
    ),
    moon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M16 3a8.5 8.5 0 108 8.5A7 7 0 0116 3z" />
      </svg>
    ),
    share: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="18" cy="5" r="2" />
        <circle cx="6" cy="12" r="2" />
        <circle cx="18" cy="19" r="2" />
        <path d="M8 12l8-6" />
        <path d="M8 12l8 6" />
      </svg>
    ),
    message: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 6h14v10H9l-4 3z" />
      </svg>
    ),
  };

  return <span className="resume-app-icon">{icons[name]}</span>;
}

function CircularScore({ score }) {
  const safeScore = Math.max(0, Math.min(100, Number(score || 0)));
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (safeScore / 100) * circumference;

  return (
    <div className="resume-score-circle">
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <circle className="resume-score-circle__track" cx="60" cy="60" r={radius} />
        <circle
          className="resume-score-circle__progress"
          cx="60"
          cy="60"
          r={radius}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: dashOffset,
          }}
        />
      </svg>
      <strong>{safeScore}</strong>
      <span>ATS Score</span>
    </div>
  );
}

function ResumeAIPanel({
  analytics,
  atsScore,
  activeTemplate,
  onAIOptimize,
  onDownloadJson,
  onDownloadLatex,
  onOpenAssistant,
  onShareLink,
  onTemplateChange,
  scoreRef,
  actionsRef,
  templatesRef,
}) {
  return (
    <div className="resume-ai-panel">
      <section
        className="resume-ai-panel__section resume-ai-panel__section--score"
        ref={scoreRef}
      >
        <div className="resume-ai-panel__section-head">
          <div>
            <p className="resume-ai-panel__eyebrow">ATS Score</p>
            <h3>Optimization overview</h3>
          </div>
          <span className="resume-ai-panel__badge">{analytics?.percentile || "Top tier"}</span>
        </div>

        <div className="resume-ai-score-card">
          <CircularScore score={atsScore} />
          <strong>Strong recruiter match</strong>
          <p>
            Your resume already surfaces strong backend and full-stack signals.
            Tightening keywords will improve shortlist performance.
          </p>
          <button type="button" onClick={onAIOptimize}>
            Improve with AI
          </button>
        </div>
      </section>

      <section className="resume-ai-panel__section" ref={actionsRef}>
        <div className="resume-ai-panel__section-head">
          <div>
            <p className="resume-ai-panel__eyebrow">AI Tools</p>
            <h3>Resume actions</h3>
          </div>
        </div>

        <div className="resume-ai-panel__actions">
          <button type="button" onClick={onAIOptimize}>
            AI Optimize Resume
          </button>
          <button type="button" onClick={onAIOptimize}>
            Rewrite Bullet Points
          </button>
          <button type="button" onClick={onAIOptimize}>
            Generate Summary
          </button>
          <button type="button" onClick={onAIOptimize}>
            Suggest Skills
          </button>
          <button type="button" onClick={onOpenAssistant}>
            Open Chat Assistant
          </button>
        </div>
      </section>

      <section className="resume-ai-panel__section">
        <div className="resume-ai-panel__section-head">
          <div>
            <p className="resume-ai-panel__eyebrow">Signals</p>
            <h3>ATS feedback</h3>
          </div>
        </div>

        <div className="resume-ai-panel__block">
          <h4>Matched Keywords</h4>
          <div className="resume-ai-panel__chips">
            {(analytics?.keywords || []).map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>

        <div className="resume-ai-panel__block">
          <h4>Missing Keywords</h4>
          <div className="resume-ai-panel__chips resume-ai-panel__chips--warning">
            {(analytics?.missingKeywords || []).map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>

        <div className="resume-ai-panel__block">
          <h4>Formatting Issues</h4>
          <ul>
            {(analytics?.formattingIssues || []).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="resume-ai-panel__block">
          <h4>Suggestions</h4>
          <ul>
            {(analytics?.suggestions || []).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="resume-ai-panel__section">
        <div className="resume-ai-panel__section-head">
          <div>
            <p className="resume-ai-panel__eyebrow">Export</p>
            <h3>Additional outputs</h3>
          </div>
        </div>

        <div className="resume-ai-panel__exports">
          <button type="button" onClick={onDownloadJson}>
            <AppIcon name="download" />
            Download JSON
          </button>
          <button type="button" onClick={onDownloadLatex}>
            <AppIcon name="download" />
            Download LaTeX
          </button>
          <button type="button" onClick={onShareLink}>
            <AppIcon name="share" />
            Share via Link
          </button>
        </div>
      </section>

      <section className="resume-ai-panel__section" ref={templatesRef}>
        <div className="resume-ai-panel__section-head">
          <div>
            <p className="resume-ai-panel__eyebrow">Templates</p>
            <h3>Switch visual style</h3>
          </div>
        </div>

        <div className="resume-ai-panel__templates">
          {templateOptions.map((template) => (
            <button
              className={`resume-ai-panel__template ${
                activeTemplate === template.key ? "is-active" : ""
              }`}
              key={template.key}
              type="button"
              onClick={() => onTemplateChange(template.key)}
            >
              <span
                className={`resume-ai-panel__template-preview resume-ai-panel__template-preview--${template.key}`}
              />
              <strong>{template.title}</strong>
              <small>{template.copy}</small>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function ResumeBuilder() {
  const { id } = useParams();
  const { resume, analytics, handleAIImprove, setResume } = useResume(id);
  const [theme, setTheme] = useState("light");
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [previewZoom, setPreviewZoom] = useState("fit");
  const [isCompiling, setIsCompiling] = useState(false);
  const [saveLabel, setSaveLabel] = useState("Live sync ready");
  const [toast, setToast] = useState({
    visible: true,
    tone: "info",
    text: "ResumeForge is ready. Edits compile live into the preview.",
  });
  const toastTimerRef = useRef(null);
  const resumeChangeRef = useRef(false);
  const aiScoreRef = useRef(null);
  const aiActionsRef = useRef(null);
  const aiTemplatesRef = useRef(null);

  const atsScore = Math.max(0, Math.min(100, Math.round(Number(analytics?.score || 0))));

  const showToast = (text, tone = "info") => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }

    setToast({
      visible: true,
      tone,
      text,
    });

    toastTimerRef.current = window.setTimeout(() => {
      setToast((prev) => ({
        ...prev,
        visible: false,
      }));
    }, 2800);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!resumeChangeRef.current) {
      resumeChangeRef.current = true;
      return;
    }

    setSaveLabel("Autosaving...");

    const timer = window.setTimeout(() => {
      setSaveLabel("Autosaved just now");
      showToast("Autosaved changes to your workspace.", "success");
    }, 1150);

    return () => window.clearTimeout(timer);
  }, [resume]);

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleCompile = () => {
    setIsCompiling(true);
    setPreviewZoom("fit");

    window.setTimeout(() => {
      setIsCompiling(false);
      setSaveLabel("Compilation successful");
      showToast("Resume compiled successfully. Preview refreshed.", "success");
    }, 900);
  };

  const handleDownload = async () => {
    try {
      const blob = await downloadPDF(resume);
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      anchor.href = url;
      anchor.download = `${(resume.name || "resume").replace(/\s+/g, "-").toLowerCase()}.pdf`;
      anchor.click();
      window.URL.revokeObjectURL(url);
      showToast("PDF download started.", "success");
    } catch (error) {
      showToast("PDF export failed. Please try again.", "error");
    }
  };

  const handleDownloadJson = () => {
    triggerFileDownload("resume.json", JSON.stringify(resume, null, 2), "application/json");
    showToast("JSON export ready.", "success");
  };

  const handleDownloadLatex = () => {
    triggerFileDownload("resume.tex", buildLatexExport(resume));
    showToast("LaTeX export ready.", "success");
  };

  const handleShareLink = async () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?template=${resume.template || "tech"}`;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        showToast("Share link copied to clipboard.", "success");
        return;
      }
    } catch (error) {
      console.log("Clipboard unavailable", error);
    }

    showToast(`Share link: ${shareUrl}`, "info");
  };

  const handleAIOptimize = async () => {
    await handleAIImprove();
    showToast("AI optimization suggestions applied.", "success");
  };

  const handleTemplateChange = (templateKey) => {
    setResume((prev) => ({
      ...prev,
      template: templateKey,
    }));
    showToast(
      `${templateKey[0].toUpperCase()}${templateKey.slice(1)} template applied.`,
      "success"
    );
  };

  const previewScale = previewZoom === "100" ? 1 : 0.9;

  return (
    <div className="resume-ui resume-page resume-page--builder">
      <div className={`resume-workbench resume-workbench--${theme}`}>
        <div className="resume-workbench__backdrop" />

        <div className="resume-workbench__shell">
          <header className="resume-workbench__nav">
            <div className="resume-brand">
              <div className="resume-brand__mark">RF</div>
              <div>
                <strong>ResumeForge</strong>
                <span>Premium resume builder workspace</span>
              </div>
            </div>

            <div className="resume-workbench__nav-actions">
              <button type="button" onClick={handleCompile}>
                <AppIcon name="compile" />
                {isCompiling ? "Compiling..." : "Compile / Generate Resume"}
              </button>
              {/* <button type="button" onClick={handleDownload}>
                <AppIcon name="download" />
                Download PDF
              </button> */}
              <button type="button" onClick={() => scrollToSection(aiScoreRef)}>
                <AppIcon name="score" />
                ATS Score
              </button>
              <button
                type="button"
                onClick={() => {
                  scrollToSection(aiActionsRef);
                  handleAIOptimize();
                }}
              >
                <AppIcon name="ai" />
                AI Optimize
              </button>
              <button type="button" onClick={() => scrollToSection(aiTemplatesRef)}>
                <AppIcon name="template" />
                Templates
              </button>
            </div>

            <div className="resume-workbench__nav-profile">
              <span className="resume-workbench__sync">{saveLabel}</span>

              <button
                className="resume-theme-toggle"
                type="button"
                onClick={() =>
                  setTheme((prev) => (prev === "light" ? "dark" : "light"))
                }
              >
                <AppIcon name={theme === "light" ? "moon" : "sun"} />
                {theme === "light" ? "Dark" : "Light"}
              </button>

              <button className="resume-profile-chip" type="button">
                KG
              </button>
            </div>
          </header>

          <div className="resume-workbench__content">
            <aside className="resume-workbench__panel resume-workbench__panel--form">
              <div className="resume-panel-shell">
                <div className="resume-panel-shell__header">
                  <div>
                    <p className="resume-panel-shell__eyebrow">Editor</p>
                    <h2>Smart Resume Editor</h2>
                  </div>
                </div>

                <ResumeEditor
                  onAIImprove={handleAIOptimize}
                  onOpenAssistant={() => setAssistantOpen(true)}
                  resume={resume}
                  setResume={setResume}
                />
              </div>
            </aside>

            <section className="resume-workbench__panel resume-workbench__panel--preview">
              <div className="resume-panel-shell resume-panel-shell--preview">
                <div className="resume-preview-stage__toolbar">
                  <div>
                    <p className="resume-preview-stage__eyebrow">Live Resume Preview</p>
                    <h2>Fixed A4 canvas</h2>
                  </div>

                  <div className="resume-preview-stage__toolbar-actions">
                    <div className="resume-preview-stage__zoom">
                      <button
                        className={previewZoom === "100" ? "is-active" : ""}
                        type="button"
                        onClick={() => setPreviewZoom("100")}
                      >
                        100%
                      </button>
                      <button
                        className={previewZoom === "fit" ? "is-active" : ""}
                        type="button"
                        onClick={() => setPreviewZoom("fit")}
                      >
                        Fit
                      </button>
                    </div>

                    <span className="resume-preview-stage__page">A4 Preview</span>
                  </div>
                </div>

                <div className="resume-preview-stage__viewport">
                  <div className="resume-preview-stage__canvas">
                    <div
                      className="resume-preview-stage__sheet-scale"
                      style={{ transform: `scale(${previewScale})` }}
                    >
                      <ResumePreviewLive resume={resume} />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <aside className="resume-workbench__panel resume-workbench__panel--ai">
              <div className="resume-panel-shell">
                <div className="resume-panel-shell__header">
                  <div>
                    <p className="resume-panel-shell__eyebrow">AI Panel</p>
                    <h2>Insights & actions</h2>
                  </div>

                  <button type="button" onClick={() => setAssistantOpen(true)}>
                    Open Chat
                  </button>
                </div>

                <ResumeAIPanel
                  activeTemplate={resume.template}
                  analytics={analytics}
                  atsScore={atsScore}
                  onAIOptimize={handleAIOptimize}
                  onDownloadJson={handleDownloadJson}
                  onDownloadLatex={handleDownloadLatex}
                  onOpenAssistant={() => setAssistantOpen(true)}
                  onShareLink={handleShareLink}
                  onTemplateChange={handleTemplateChange}
                  actionsRef={aiActionsRef}
                  scoreRef={aiScoreRef}
                  templatesRef={aiTemplatesRef}
                />
              </div>
            </aside>
          </div>
        </div>

        {assistantOpen && (
          <aside className="resume-assistant">
            <div className="resume-assistant__head">
              <div>
                <p>AI Assistant</p>
                <h3>Resume Copilot</h3>
              </div>
              <button type="button" onClick={() => setAssistantOpen(false)}>
                Close
              </button>
            </div>

            <div className="resume-assistant__messages">
              {assistantMessages.map((message, index) => (
                <article
                  className={`resume-assistant__bubble resume-assistant__bubble--${message.role}`}
                  key={`${message.role}-${index}`}
                >
                  <span>{message.role === "assistant" ? "AI" : "You"}</span>
                  <p>{message.text}</p>
                </article>
              ))}
            </div>

            <div className="resume-assistant__actions">
              <button type="button" onClick={handleAIOptimize}>
                Rewrite Bullet Points
              </button>
              <button type="button" onClick={handleAIOptimize}>
                Generate Summary
              </button>
              <button type="button" onClick={handleAIOptimize}>
                Suggest Skills
              </button>
            </div>

            <label className="resume-assistant__input">
              <AppIcon name="message" />
              <input placeholder="Ask for recruiter-ready phrasing or ATS feedback..." />
            </label>
          </aside>
        )}

        {toast.visible && (
          <div className={`resume-toast resume-toast--${toast.tone}`}>{toast.text}</div>
        )}
      </div>
    </div>
  );
}
