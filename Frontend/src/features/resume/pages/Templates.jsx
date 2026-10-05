import { useState } from "react";
import { useNavigate } from "react-router";
import { Check, ArrowRight, Sparkles, Star } from "lucide-react";
import { templateLibrary } from "../hooks/useResume";
import Navbar from "../../interview/components/Navbar";
import "../style/resume.scss";

export default function Templates() {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState("all");

  const filters = [
    { key: "all", label: "All Templates" },
    { key: "Tech & Product", label: "Tech & Product" },
    { key: "Corporate & Executive", label: "Executive" },
    { key: "Design & Startups", label: "Design & Startups" },
    { key: "ATS Universal", label: "ATS Classic" }
  ];

  const filtered = selectedFilter === "all"
    ? templateLibrary
    : templateLibrary.filter(t => t.category === selectedFilter);

  const handleSelectTemplate = (templateKey) => {
    navigate(`/resume?template=${templateKey}`);
  };

  return (
    <div className="rf-page-templates">
      <Navbar />

      <div className="rf-templates-container">
        <header className="rf-templates-hero">
          <div className="rf-badge-pill">
            <Sparkles size={13} /> Recruiter-Approved Layouts
          </div>
          <h1>Professional Resume Templates</h1>
          <p>
            Engineered for ATS compliance, readable typographic hierarchy, and maximum recruiter conversion.
            Switching templates preserves 100% of your data.
          </p>

          <div className="rf-filter-bar">
            {filters.map(f => (
              <button
                key={f.key}
                type="button"
                className={`rf-filter-btn ${selectedFilter === f.key ? "is-active" : ""}`}
                onClick={() => setSelectedFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </header>

        <div className="rf-templates-grid">
          {filtered.map(t => (
            <div className="rf-template-card" key={t.key}>
              <div className="rf-template-card__preview" onClick={() => handleSelectTemplate(t.key)}>
                <div className={`rf-mini-sheet a4-template--${t.key}`}>
                  <div className="rf-mini-sheet__head">
                    <div className="rf-mini-bar-title" />
                    <div className="rf-mini-bar-sub" />
                  </div>
                  <div className="rf-mini-sheet__body">
                    <div className="rf-mini-line" style={{ width: "80%" }} />
                    <div className="rf-mini-line" style={{ width: "100%" }} />
                    <div className="rf-mini-line" style={{ width: "90%" }} />
                    <div className="rf-mini-line" style={{ width: "70%" }} />
                  </div>
                </div>
                <div className="rf-template-card__hover-overlay">
                  <span>Use This Template</span>
                </div>
              </div>

              <div className="rf-template-card__content">
                <div className="rf-template-card__meta">
                  <h3>{t.title}</h3>
                  <div className="rf-rating">
                    <Star size={13} fill="#F59E0B" color="#F59E0B" /> {t.rating}
                  </div>
                </div>
                <p className="rf-template-card__desc">{t.copy}</p>

                <div className="rf-template-card__footer">
                  <span className="rf-ats-pill">
                    <Check size={12} /> {t.atsScore} ATS Score
                  </span>
                  <button
                    type="button"
                    className="rf-btn-primary-sm"
                    onClick={() => handleSelectTemplate(t.key)}
                  >
                    Select <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
